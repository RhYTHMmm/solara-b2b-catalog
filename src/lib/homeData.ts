import { ProxyAgent, fetch as undiciFetch } from 'undici';

export type AssetImage = {
  alt?: string;
  asset?: {
    url?: string;
  };
};

export type Settings = {
  companyName: string;
  tagline?: string;
  heroTitle: string;
  heroSubtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
  heroStats?: Array<{ value: string; label: string }>;
  contactEmail?: string;
  phone?: string;
  whatsapp?: string;
  seoTitle?: string;
  seoDescription?: string;
};

export type Category = {
  title: string;
  slug: string;
  summary?: string;
  image?: AssetImage;
};

export type Product = {
  title: string;
  slug: string;
  sku?: string;
  summary?: string;
  minOrderQuantity?: string;
  leadTime?: string;
  category?: { title: string; slug: string; image?: AssetImage };
  imageUrl?: string;
  imageAlt?: string;
};

export type Application = {
  title: string;
  slug: string;
  summary?: string;
  industries?: string[];
  image?: AssetImage;
};

export type CaseStudy = {
  title: string;
  slug: string;
  clientCountry?: string;
  industry?: string;
  challenge?: string;
  result?: string;
  metrics?: Array<{ value: string; label: string }>;
  image?: AssetImage;
};

export type Faq = {
  question: string;
  answer: string;
  category?: string;
};

export type HomeData = {
  settings?: Settings;
  categories?: Category[];
  featuredProducts?: Product[];
  applications?: Application[];
  caseStudies?: CaseStudy[];
  faqs?: Faq[];
};

export type HomeDataResult =
  | { data: HomeData; error?: undefined }
  | { data?: undefined; error: string };

const SANITY_PROJECT_ID = '2wmp847w';
const SANITY_DATASET = 'production';
const SANITY_API_VERSION = '2026-04-11';
const SANITY_FETCH_TIMEOUT_MS = 8000;

const HOME_QUERY = `{
  "settings": *[_type == "siteSettings"][0] {
    companyName,
    tagline,
    heroTitle,
    heroSubtitle,
    primaryCta,
    secondaryCta,
    heroStats,
    contactEmail,
    phone,
    whatsapp,
    seoTitle,
    seoDescription
  },
  "categories": *[_type == "productCategory"] | order(sortOrder asc, title asc)[0...4] {
    title,
    "slug": slug.current,
    summary,
    image {
      alt,
      asset->{url}
    }
  },
  "featuredProducts": *[_type == "product" && isFeatured == true] | order(title asc)[0...3] {
    title,
    "slug": slug.current,
    sku,
    summary,
    minOrderQuantity,
    leadTime,
    category->{
      title,
      "slug": slug.current,
      image {
        alt,
        asset->{url}
      }
    },
    image {
      alt,
      asset->{url}
    },
    mainImage {
      alt,
      asset->{url}
    },
    gallery[] {
      alt,
      asset->{url}
    },
    images[] {
      alt,
      asset->{url}
    },
    "imageUrl": coalesce(image.asset->url, mainImage.asset->url, gallery[0].asset->url, images[0].asset->url, category->image.asset->url),
    "imageAlt": coalesce(image.alt, mainImage.alt, gallery[0].alt, images[0].alt, category->image.alt)
  },
  "applications": *[_type == "application"] | order(title asc)[0...3] {
    title,
    "slug": slug.current,
    summary,
    industries,
    image {
      alt,
      asset->{url}
    }
  },
  "caseStudies": *[_type == "caseStudy"] | order(_createdAt desc)[0...2] {
    title,
    "slug": slug.current,
    clientCountry,
    industry,
    challenge,
    result,
    metrics,
    image {
      alt,
      asset->{url}
    }
  },
  "faqs": *[_type == "faq"] | order(sortOrder asc)[0...4] {
    question,
    answer,
    category
  }
}`;

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    const cause =
      error.cause instanceof Error
        ? error.cause.message
        : error.cause
          ? String(error.cause)
          : '';

    return cause ? `${error.message}. cause=${cause}` : error.message;
  }

  return String(error);
};

const SANITY_QUERY_URL = `https://${SANITY_PROJECT_ID}.apicdn.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}`;

const SANITY_PROXY_URL =
  process.env.HTTPS_PROXY ??
  process.env.HTTP_PROXY ??
  process.env.https_proxy ??
  process.env.http_proxy;

const SANITY_PROXY_AGENT = SANITY_PROXY_URL
  ? new ProxyAgent(SANITY_PROXY_URL)
  : undefined;

export const fetchHomeData = async (): Promise<HomeDataResult> => {
  try {
    const response = await undiciFetch(SANITY_QUERY_URL, {
      dispatcher: SANITY_PROXY_AGENT,
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        query: HOME_QUERY,
      }),
      signal: AbortSignal.timeout(SANITY_FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      const error = `Sanity homepage request failed with ${response.status} ${response.statusText}.`;
      console.error(error);
      return { error };
    }

    const payload = (await response.json()) as {
      result?: HomeData;
    };
    const data = payload?.result;

    if (!data) {
      const error = 'Sanity returned an empty homepage response.';
      console.error(error);
      return { error };
    }

    return { data };
  } catch (error) {
    const message = `Failed to load homepage data from Sanity. ${getErrorMessage(error)}`;
    console.error(message);
    return {
      error: message,
    };
  }
};

export const imageUrl = (image: AssetImage | undefined) => image?.asset?.url;
