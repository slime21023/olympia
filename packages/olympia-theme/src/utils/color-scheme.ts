export type Scheme = 'dark' | 'light';

const LIGHT_QUERY = '(prefers-color-scheme: light)';

/** The `<meta name="color-scheme">` element that drives the page color scheme. */
export function getColorSchemeMeta(): HTMLMetaElement | null {
  return document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');
}

export function getSystemScheme(): Scheme {
  return window.matchMedia(LIGHT_QUERY).matches ? 'light' : 'dark';
}

/** The scheme currently in effect: an explicit `light`/`dark` meta value, else the OS preference. */
export function getRenderedScheme(): Scheme {
  const metaValue = getColorSchemeMeta()?.content;
  return metaValue === 'light' || metaValue === 'dark' ? metaValue : getSystemScheme();
}

/** Calls `callback` when the rendered scheme may have changed: a meta edit or an OS preference change. */
export function onSchemeChange(callback: () => void): void {
  const meta = getColorSchemeMeta();
  if (meta) {
    new MutationObserver(callback).observe(meta, {
      attributes: true,
      attributeFilter: ['content'],
    });
  }
  window.matchMedia(LIGHT_QUERY).addEventListener('change', callback);
}
