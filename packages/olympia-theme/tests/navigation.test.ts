import { describe, expect, test } from 'bun:test';
import { buildDocsNavigation, getAdjacentPages } from '../src/navigation.ts';
import type { DocCollectionEntry } from '../src/types.ts';

function entry(id: string, data: Partial<DocCollectionEntry['data']> = {}): DocCollectionEntry {
  return { id, data: { title: id, ...data } };
}

describe('buildDocsNavigation', () => {
  test('orders listed categories first, then unlisted alphabetically', () => {
    const { navGroups } = buildDocsNavigation([
      entry('a', { category: 'Zeta' }),
      entry('b', { category: 'API Reference' }),
      entry('c', { category: 'Alpha' }),
      entry('d', { category: 'Getting Started' }),
    ]);
    expect(navGroups.map((g) => g.category)).toEqual(['Getting Started', 'API Reference', 'Alpha', 'Zeta']);
  });

  test('sorts items by order, then title', () => {
    const { navGroups } = buildDocsNavigation([
      entry('b', { title: 'B', order: 2 }),
      entry('z', { title: 'Z', order: 1 }),
      entry('a', { title: 'A', order: 2 }),
    ]);
    expect(navGroups[0].items.map((i) => i.title)).toEqual(['Z', 'A', 'B']);
  });

  test('maps index to "/" and applies category/order defaults', () => {
    const { flatItems } = buildDocsNavigation([entry('index'), entry('guide/start')]);
    const index = flatItems.find((i) => i.id === 'index');
    expect(index?.href).toBe('/');
    expect(index?.category).toBe('Documentation');
    expect(index?.order).toBe(99);
    expect(flatItems.find((i) => i.id === 'guide/start')?.href).toBe('/guide/start');
  });
});

describe('getAdjacentPages', () => {
  const { flatItems } = buildDocsNavigation([entry('a', { order: 1 }), entry('b', { order: 2 })]);

  test('first item has no previous page', () => {
    const { prevPage, nextPage } = getAdjacentPages(flatItems, 'a');
    expect(prevPage).toBeNull();
    expect(nextPage?.id).toBe('b');
  });

  test('unknown id has neither', () => {
    expect(getAdjacentPages(flatItems, 'missing')).toEqual({ prevPage: null, nextPage: null });
  });
});
