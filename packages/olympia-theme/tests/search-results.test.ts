import { describe, expect, test } from 'bun:test';
import { filterDocs, renderSearchResults } from '../src/components/search/search-results.ts';
import type { SearchDocItem } from '../src/types.ts';

describe('renderSearchResults', () => {
  test('escapes titles, categories and hrefs but keeps excerpt markup', () => {
    const html = renderSearchResults([
      {
        title: '<img src=x onerror=alert(1)>',
        excerptHtml: 'a <mark>b</mark>',
        category: '<b>',
        href: '/x"y',
      },
    ]);
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(html).toContain('&lt;b&gt;');
    expect(html).toContain('href="/x&quot;y"');
    expect(html).toContain('<mark>b</mark>');
    expect(html).not.toContain('<img');
  });

  test('renders an empty state', () => {
    expect(renderSearchResults([])).toContain('o-cmd-empty');
  });
});

describe('filterDocs', () => {
  const docs: SearchDocItem[] = [
    { title: 'Tabs', description: 'Switcher', category: 'Components', href: '/tabs' },
    { title: 'Install', description: 'Setup', category: 'Start', href: '/install' },
  ];

  test('blank query returns every doc', () => {
    expect(filterDocs(docs, '  ')).toHaveLength(2);
  });

  test('matches case-insensitively across fields', () => {
    expect(filterDocs(docs, 'SWITCH').map((r) => r.title)).toEqual(['Tabs']);
  });
});
