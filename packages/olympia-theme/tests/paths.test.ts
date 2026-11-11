import { describe, expect, test } from 'bun:test';
import { join } from 'node:path';
import {
  isEditorNoise,
  isInsideDirectory,
  isPartialPath,
  normalizeEntryId,
} from '../src/loader/paths.ts';

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

describe('isPartialPath', () => {
  test('treats files and folders starting with an underscore as partials', () => {
    expect(isPartialPath(join('guide', '_partials', 'x.adoc'))).toBe(true);
    expect(isPartialPath('_x.adoc')).toBe(true);
  });

  test('regular pages are not partials', () => {
    expect(isPartialPath(join('guide', 'x.adoc'))).toBe(false);
  });
});

describe('isEditorNoise', () => {
  test('flags hidden entries and editor swap or temp files', () => {
    expect(isEditorNoise('.DS_Store')).toBe(true);
    expect(isEditorNoise(join('guide', '.git', 'HEAD'))).toBe(true);
    expect(isEditorNoise('x.adoc.swp')).toBe(true);
    expect(isEditorNoise('x.adoc~')).toBe(true);
    expect(isEditorNoise('4913')).toBe(true);
  });

  test('keeps pages and partials', () => {
    expect(isEditorNoise(join('guide', 'x.adoc'))).toBe(false);
    expect(isEditorNoise(join('_partials', 'note.adoc'))).toBe(false);
  });
});
