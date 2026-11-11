/**
 * Prefixes a root-relative path with the site's Astro `base` (for example `/docs`), so links keep
 * working when the site is not served from the domain root. `base` defaults to Astro's
 * `import.meta.env.BASE_URL`, which is `/` outside Astro (for example in tests).
 */
export function withBase(path: string, base: string = import.meta.env.BASE_URL ?? '/'): string {
  const prefix = base.replace(/\/+$/, '');
  return prefix + (path.startsWith('/') ? path : `/${path}`);
}
