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

/** True when any path segment starts with `_`, marking a partial (include-only) file or folder. */
export function isPartialPath(relativePath: string): boolean {
  return toPosixPath(relativePath)
    .split('/')
    .some((segment) => segment.startsWith('_'));
}

const EDITOR_TEMP_FILE = /(~|\.(swp|swx|tmp))$|^4913$/;

/** True for hidden files and folders and for editor swap/temp files, which never affect any page. */
export function isEditorNoise(relativePath: string): boolean {
  const segments = toPosixPath(relativePath).split('/');
  return (
    segments.some((segment) => segment.startsWith('.')) ||
    EDITOR_TEMP_FILE.test(segments.at(-1) ?? '')
  );
}

/** `guide/index.adoc` -> `guide`, `index.adoc` -> `index`, `a/b.asciidoc` -> `a/b`. */
export function normalizeEntryId(baseDir: string, filePath: string): string {
  const withoutExt = toPosixPath(relative(baseDir, filePath)).replace(ASCIIDOC_EXTENSION, '');
  if (withoutExt === 'index') return 'index';
  return withoutExt.replace(/\/index$/, '');
}
