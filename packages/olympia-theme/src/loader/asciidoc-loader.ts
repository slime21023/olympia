import { readdir, readFile } from 'node:fs/promises';
import { basename, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Loader } from 'astro/loaders';
import { compileAsciiDoc } from './converter.ts';
import { isAsciiDocFile, isInsideDirectory, normalizeEntryId, toPosixPath } from './paths.ts';

export interface AsciiDocLoaderOptions {
  /**
   * Relative or absolute directory containing `.adoc` files, e.g. `./src/content/docs`
   */
  base: string;
}

/** Recursively lists AsciiDoc files; a missing directory yields no files. */
async function findAsciiDocFiles(dir: string): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const nested = await Promise.all(
    entries.map(async (entry) => {
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
        const compiled = await compileAsciiDoc(raw, basename(absolutePath, extname(absolutePath)));

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
          digest: generateDigest(raw),
          rendered: {
            html: compiled.html,
            metadata: {
              headings: compiled.headings,
              frontmatter: compiled.meta,
            },
          },
        });
      }

      /** Resolves a watcher path to an absolute AsciiDoc path under `baseDir`, or `null` to ignore it. */
      function toTrackedPath(changedPath: string): string | null {
        if (!isAsciiDocFile(changedPath)) return null;
        const absolutePath = resolve(changedPath);
        return isInsideDirectory(baseDir, absolutePath) ? absolutePath : null;
      }

      store.clear();
      const files = await findAsciiDocFiles(baseDir);
      logger.info(`Loaded ${files.length} AsciiDoc files from ${options.base}`);
      await Promise.all(files.map(syncFile));

      if (watcher) {
        watcher.add(baseDir);
        const handleUpdate = async (changedPath: string) => {
          const tracked = toTrackedPath(changedPath);
          if (!tracked) return;
          logger.info(`Reloading AsciiDoc file: ${relative(baseDir, tracked)}`);
          await syncFile(tracked);
        };
        watcher.on('change', handleUpdate);
        watcher.on('add', handleUpdate);
        watcher.on('unlink', (removedPath: string) => {
          const tracked = toTrackedPath(removedPath);
          if (tracked) store.delete(normalizeEntryId(baseDir, tracked));
        });
      }
    },
  };
}
