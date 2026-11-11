export const BADGE_VARIANTS = ['primary', 'secondary', 'tertiary'] as const;
export type BadgeVariant = (typeof BADGE_VARIANTS)[number];

export const DEFAULT_CATEGORY = 'Documentation';
export const DEFAULT_ORDER = 99;

export interface HeadingItem {
  depth: number;
  slug: string;
  text: string;
}

export interface AsciiDocMeta {
  title: string;
  description: string;
  category: string;
  order: number;
  badge?: string;
  badgeVariant?: BadgeVariant;
  httpMethod?: string;
  endpoint?: string;
  attributes: Record<string, string>;
}

/** Minimal shape of an Astro content-collection entry consumed by `buildDocsNavigation`. */
export interface DocCollectionEntry {
  id: string;
  data: {
    title: string;
    description?: string;
    category?: string;
    order?: number;
    badge?: string;
    badgeVariant?: BadgeVariant;
    httpMethod?: string;
    endpoint?: string;
    headings?: HeadingItem[];
  };
}

export interface NavItem {
  id: string;
  title: string;
  href: string;
  order: number;
  category: string;
  description: string;
  badge?: string;
  badgeVariant?: BadgeVariant;
  httpMethod?: string;
}

export interface NavGroup {
  category: string;
  items: NavItem[];
}

export interface BuiltNavigation {
  navGroups: NavGroup[];
  flatItems: NavItem[];
}

export type SearchDocItem = Pick<
  NavItem,
  'title' | 'description' | 'category' | 'href' | 'httpMethod'
>;
