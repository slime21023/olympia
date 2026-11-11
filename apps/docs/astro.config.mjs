import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://olympia.docs.local',
  output: 'static',
  vite: {
    build: {
      // Chrome-first. 123 is the floor: CSS `light-dark()` (123) is used unguarded, and client code
      // uses `Promise.withResolvers` (119) and `Map.groupBy` (117). Keep these in sync when adding features.
      target: 'chrome123',
    },
  },
});
