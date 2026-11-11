import { readdir, readFile } from 'node:fs/promises';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Loader } from 'astro/loaders';
import { compileAsciiDoc } from './converter.ts';
import {
  isAsciiDocFile,
  isEditorNoise,
  isInsideDirectory,
  isPartialPath,
  normalizeEntryId,
  toPosixPath,
} from './paths.ts';

export interface AsciiDocLoaderOptions {
  /**
   * Relative or absolute directory containing `.adoc` files, e.g. `./src/content/docs`
   */
  base: string;
}

/**
 * Recursively lists AsciiDoc pages; a missing directory yields no files.
 * Files and folders whose name starts with `_` are partials (include targets), not pages; hidden
 * entries (`.git`, `.DS_Store`) are skipped.
 */
async function findAsciiDocFiles(dir: string): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const nested = await Promise.all(
    entries.map(async (entry) => {
      if (entry.name.startsWith('_') || entry.name.startsWith('.')) return [];
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) return findAsciiDocFiles(fullPath);
      return entry.isFile() && isAsciiDocFile(entry.name) ? [fullPath] : [];
    }),
  );
  return nested.flat();
}

/**
 * Astro 5 Content Layer Loader for AsciiDoc (`.adoc`) documents.
 */
export function asciidocLoader(options: AsciiDocLoaderOptions): Loader {
  return {
    name: 'olympia-asciidoc-loader',
    load: async ({ config, store, logger, parseData, generateDigest, watcher }) => {
      const rootDir = fileURLToPath(config.root);
      const baseDir = resolve(rootDir, options.base);

      async function syncFile(absolutePath: string) {
        const id = normalizeEntryId(baseDir, absolutePath);
        const filePath = toPosixPath(relative(rootDir, absolutePath));
        const raw = await readFile(absolutePath, 'utf-8');
        const compiled = await compileAsciiDoc(raw, {
          fallbackTitle: basename(absolutePath, extname(absolutePath)),
          baseDir: dirname(absolutePath),
          basePath: config.base,
        });

        const data = await parseData({
          id,
          data: { ...compiled.meta, headings: compiled.headings },
          filePath,
        });

        store.set({
          id,
          data,
          body: raw,
          filePath,
          // Includes change the output without changing the source, so the digest covers the HTML too.
          digest: generateDigest(raw + compiled.html),
          rendered: {
            html: compiled.html,
            metadata: {
              headings: compiled.headings,
              frontmatter: compiled.meta,
            },
          },
        });
      }

      /** Compiles every page; returns how many were found. */
      async function syncAll(): Promise<number> {
        const files = await findAsciiDocFiles(baseDir);
        await Promise.all(files.map(syncFile));
        return files.length;
      }

      /**
       * `page`: an AsciiDoc page. `dependency`: any other file under `baseDir` (partials, included
       * code), which can change any page that includes it. `null`: outside `baseDir`, or hidden or
       * editor temp files, which are ignored.
       */
      function classifyChange(changedPath: string): 'page' | 'dependency' | null {
        const absolutePath = resolve(changedPath);
        if (!isInsideDirectory(baseDir, absolutePath)) return null;
        const relativePath = relative(baseDir, absolutePath);
        if (isEditorNoise(relativePath)) return null;
        return isAsciiDocFile(absolutePath) && !isPartialPath(relativePath) ? 'page' : 'dependency';
      }

      store.clear();
      const pageCount = await syncAll();
      logger.info(`Loaded ${pageCount} AsciiDoc files from ${options.base}`);

      if (watcher) {
        watcher.add(baseDir);
        const handleUpdate = async (changedPath: string) => {
          const kind = classifyChange(changedPath);
          if (!kind) return;
          const absolutePath = resolve(changedPath);
          const relativePath = toPosixPath(relative(baseDir, absolutePath));
          if (kind === 'page') {
            logger.info(`Reloading AsciiDoc file: ${relativePath}`);
            await syncFile(absolutePath);
          } else {
            logger.info(`Reloading AsciiDoc pages after change to ${relativePath}`);
            await syncAll();
          }
        };
        watcher.on('change', handleUpdate);
        watcher.on('add', handleUpdate);
        watcher.on('unlink', async (removedPath: string) => {
          const kind = classifyChange(removedPath);
          if (kind === 'page') {
            store.delete(normalizeEntryId(baseDir, resolve(removedPath)));
          } else if (kind === 'dependency') {
            await syncAll();
          }
        });
      }
    },
  };
}
