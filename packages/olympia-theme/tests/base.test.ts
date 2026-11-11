import { describe, expect, test } from 'bun:test';
import { buildDocsNavigation } from '../src/navigation.ts';
import { withBase } from '../src/utils/base.ts';

describe('withBase', () => {
  test('keeps root-relative paths unchanged for the root base', () => {
    expect(withBase('/x', '/')).toBe('/x');
    expect(withBase('/', '/')).toBe('/');
  });

  test('prefixes the base, with or without a trailing slash', () => {
    expect(withBase('/x', '/docs')).toBe('/docs/x');
    expect(withBase('/x', '/docs/')).toBe('/docs/x');
    expect(withBase('/', '/docs')).toBe('/docs/');
  });

  test('accepts paths without a leading slash', () => {
    expect(withBase('x', '/docs')).toBe('/docs/x');
  });
});

describe('buildDocsNavigation with a base path', () => {
  test('prefixes every href', () => {
    const { flatItems } = buildDocsNavigation(
      [
        { id: 'index', data: { title: 'Home' } },
        { id: 'guide/start', data: { title: 'Start' } },
      ],
      undefined,
      '/docs/',
    );
    expect(flatItems.map((item) => item.href).toSorted()).toEqual(['/docs/', '/docs/guide/start']);
  });
});
