import {
  DEFAULT_CATEGORY,
  DEFAULT_ORDER,
  type BuiltNavigation,
  type DocCollectionEntry,
  type NavItem,
} from './types.ts';
import { withBase } from './utils/base.ts';

export const DEFAULT_CATEGORY_ORDER: readonly string[] = [
  'Getting Started',
  'Authoring & AsciiDoc',
  'Components & Layout',
  'API Reference',
];

function toNavItem({ id, data }: DocCollectionEntry, base: string | undefined): NavItem {
  return {
    id,
    title: data.title,
    description: data.description || '',
    category: data.category || DEFAULT_CATEGORY,
    order: data.order ?? DEFAULT_ORDER,
    badge: data.badge,
    badgeVariant: data.badgeVariant,
    httpMethod: data.httpMethod,
    href: withBase(id === 'index' ? '/' : `/${id}`, base),
  };
}

function groupByCategory(items: NavItem[]): Map<string, NavItem[]> {
  const groups = new Map<string, NavItem[]>();
  for (const item of items) {
    let group = groups.get(item.category);
    if (!group) {
      group = [];
      groups.set(item.category, group);
    }
    group.push(item);
  }
  return groups;
}

/** Listed categories keep their given order; unlisted ones rank after them. */
function categoryRank(category: string, categoryOrder: readonly string[]): number {
  const index = categoryOrder.indexOf(category);
  return index === -1 ? categoryOrder.length : index;
}

/**
 * Organizes a collection of AsciiDoc entries into sorted sidebar groups and flat pagination items.
 * Groups follow `categoryOrder`, then alphabetical; items sort by `order`, then title.
 * Hrefs include the Astro `base` path (`import.meta.env.BASE_URL` unless `base` is given).
 */
export function buildDocsNavigation(
  entries: DocCollectionEntry[],
  categoryOrder: readonly string[] = DEFAULT_CATEGORY_ORDER,
  base?: string,
): BuiltNavigation {
  const groups = groupByCategory(entries.map((entry) => toNavItem(entry, base)));

  const navGroups = [...groups.entries()]
    .toSorted(
      ([a], [b]) =>
        categoryRank(a, categoryOrder) - categoryRank(b, categoryOrder) || a.localeCompare(b),
    )
    .map(([category, items]) => ({
      category,
      items: items.toSorted((a, b) => a.order - b.order || a.title.localeCompare(b.title)),
    }));

  return { navGroups, flatItems: navGroups.flatMap((group) => group.items) };
}

export function getAdjacentPages(
  flatItems: NavItem[],
  id: string,
): { prevPage: NavItem | null; nextPage: NavItem | null } {
  const index = flatItems.findIndex((item) => item.id === id);
  if (index === -1) return { prevPage: null, nextPage: null };
  return {
    prevPage: flatItems[index - 1] ?? null,
    nextPage: flatItems[index + 1] ?? null,
  };
}
