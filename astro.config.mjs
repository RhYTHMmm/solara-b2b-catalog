import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

import sanity from '@sanity/astro';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    // 👇 update these lines
    sanity({
      projectId: '2wmp847w',
      dataset: 'production',
      useCdn: false, // for static builds
      apiVersion: '2026-04-11',
    }),
  ],
});
