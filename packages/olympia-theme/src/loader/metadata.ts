import { DEFAULT_CATEGORY, DEFAULT_ORDER, type AsciiDocMeta, type BadgeVariant } from '../types.ts';

/** Keeps only string/number document attributes, stringified. */
export function collectStringAttributes(raw: Record<string, unknown>): Record<string, string> {
  const attributes: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === 'string' || typeof value === 'number') {
      attributes[key] = String(value);
    }
  }
  return attributes;
}

function firstNonEmpty(...values: Array<string | undefined>): string | undefined {
  return values.find(Boolean);
}

function parseOrder(raw: string | undefined): number {
  if (raw === undefined) return DEFAULT_ORDER;
  const order = Number(raw);
  return Number.isNaN(order) ? DEFAULT_ORDER : order;
}

/**
 * Merges frontmatter and document attributes into page metadata.
 * Frontmatter wins over AsciiDoc attributes.
 */
export function resolveMeta(
  frontmatter: Record<string, string>,
  attributes: Record<string, string>,
  documentTitle: string,
  fallbackTitle: string,
): AsciiDocMeta {
  return {
    title: firstNonEmpty(frontmatter.title, documentTitle, attributes.doctitle) ?? fallbackTitle,
    description:
      firstNonEmpty(frontmatter.description, attributes.description, attributes.summary) ?? '',
    category:
      firstNonEmpty(frontmatter.category, attributes.category, attributes['nav-group']) ??
      DEFAULT_CATEGORY,
    order: parseOrder(frontmatter.order ?? attributes.order ?? attributes['nav-order']),
    badge: firstNonEmpty(frontmatter.badge, attributes.badge),
    // Cast is safe to defer: the content-collection zod schema validates the value.
    badgeVariant: (firstNonEmpty(frontmatter['badge-variant'], attributes['badge-variant']) ??
      'primary') as BadgeVariant,
    httpMethod: firstNonEmpty(frontmatter['http-method'], attributes['http-method']),
    endpoint: firstNonEmpty(frontmatter.endpoint, attributes.endpoint),
    attributes,
  };
}
