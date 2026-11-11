import { defineConfig } from 'astro/config';

// GitHub Pages project sites are served from a sub-path, so the deploy workflow sets
// SITE_URL=https://<user>.github.io and BASE_PATH=/<repo>. Locally both fall back to a root-served site.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://olympia.docs.local',
  base: process.env.BASE_PATH ?? '/',
  output: 'static',
  vite: {
    build: {
      // Chrome-first. 123 is the floor: CSS `light-dark()` (123) is used unguarded, and client code
      // uses `Promise.withResolvers` (119) and `Map.groupBy` (117). Keep these in sync when adding features.
      target: 'chrome123',
    },
  },
});
