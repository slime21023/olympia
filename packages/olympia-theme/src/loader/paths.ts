import { isAbsolute, relative } from 'node:path';

const ASCIIDOC_EXTENSION = /\.(adoc|asciidoc)$/i;

export function isAsciiDocFile(path: string): boolean {
  return ASCIIDOC_EXTENSION.test(path);
}

export function toPosixPath(path: string): string {
  return path.replace(/\\/g, '/');
}

/** True when `path` is strictly inside `dir`; a sibling like `docs2` is not inside `docs`. */
export function isInsideDirectory(dir: string, path: string): boolean {
  const rel = relative(dir, path);
  return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel);
}

/** `guide/index.adoc` -> `guide`, `index.adoc` -> `index`, `a/b.asciidoc` -> `a/b`. */
export function normalizeEntryId(baseDir: string, filePath: string): string {
  const withoutExt = toPosixPath(relative(baseDir, filePath)).replace(ASCIIDOC_EXTENSION, '');
  if (withoutExt === 'index') return 'index';
  return withoutExt.replace(/\/index$/, '');
}
