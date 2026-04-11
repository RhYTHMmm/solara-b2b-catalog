import { sanityClient } from 'sanity:client';

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

const SANITY_FETCH_TIMEOUT_MS = import.meta.env.DEV ? 2500 : 8000;

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

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export const fetchHomeData = async (): Promise<HomeDataResult> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('Sanity homepage fetch timed out.'));
    }, SANITY_FETCH_TIMEOUT_MS);
  });

  try {
    const data = await Promise.race([
      sanityClient.fetch<HomeData>(HOME_QUERY),
      timeout,
    ]);
    return { data };
  } catch (error) {
    return {
      error: `Failed to load homepage data from Sanity. ${getErrorMessage(error)}`,
    };
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

export const imageUrl = (image: AssetImage | undefined) => image?.asset?.url;
