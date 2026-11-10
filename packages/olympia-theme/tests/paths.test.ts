import { describe, expect, test } from 'bun:test';
import { join } from 'node:path';
import { isInsideDirectory, normalizeEntryId } from '../src/loader/paths.ts';

describe('isInsideDirectory', () => {
  test('rejects a sibling directory sharing the name prefix', () => {
    expect(isInsideDirectory(join('a', 'docs'), join('a', 'docs2', 'x.adoc'))).toBe(false);
  });

  test('accepts nested files', () => {
    expect(isInsideDirectory(join('a', 'docs'), join('a', 'docs', 'x.adoc'))).toBe(true);
  });
});

describe('normalizeEntryId', () => {
  const base = join('a', 'docs');

  test('collapses index files into their directory', () => {
    expect(normalizeEntryId(base, join(base, 'guide', 'index.adoc'))).toBe('guide');
    expect(normalizeEntryId(base, join(base, 'index.adoc'))).toBe('index');
  });

  test('strips the extension and uses forward slashes', () => {
    expect(normalizeEntryId(base, join(base, 'a', 'b.asciidoc'))).toBe('a/b');
  });
});
