import { DEFAULT_CATEGORY, type SearchDocItem } from '../../types.ts';
import { escapeHtml } from '../../utils/html.ts';

export interface PagefindResultData {
  url: string;
  excerpt?: string;
  meta?: { title?: string };
}

export interface SearchResult {
  title: string;
  /** HTML fragment. Pagefind excerpts carry intentional `<mark>` tags; everything else is pre-escaped. */
  excerptHtml: string;
  category: string;
  href: string;
}

export function docToResult(doc: SearchDocItem): SearchResult {
  return {
    title: doc.title,
    excerptHtml: escapeHtml(doc.description),
    category: doc.category,
    href: doc.href,
  };
}

export function pagefindToResult(data: PagefindResultData): SearchResult {
  return {
    title: data.meta?.title || 'Document',
    excerptHtml: data.excerpt || '',
    category: 'Full-Text Match',
    href: data.url,
  };
}

/** Metadata search used when Pagefind is unavailable (dev mode) or has no match. An empty query lists every doc. */
export function filterDocs(docs: SearchDocItem[], query: string): SearchResult[] {
  const needle = query.trim().toLowerCase();
  const matches = needle
    ? docs.filter((doc) =>
        [doc.title, doc.description, doc.category, doc.href].some((field) => field.toLowerCase().includes(needle))
      )
    : docs;
  return matches.map(docToResult);
}

function renderResultItem(result: SearchResult, index: number): string {
  const href = escapeHtml(result.href);
  return `<a href="${href}" class="o-cmd-item" role="option" aria-selected="${index === 0}" data-cmd-idx="${index}">
              <div class="o-cmd-item__main">
                <div class="o-cmd-item__title">${escapeHtml(result.title)}</div>
                ${result.excerptHtml ? `<div class="o-cmd-item__excerpt">${result.excerptHtml}</div>` : ''}
              </div>
              <span class="o-cmd-item__path">${href}</span>
            </a>`;
}

/** Renders results grouped by category; the first item is pre-selected. */
export function renderSearchResults(results: SearchResult[]): string {
  if (results.length === 0) {
    return `<div class="o-cmd-empty">No matching documentation found.</div>`;
  }

  const grouped = Map.groupBy(results, (result) => result.category || DEFAULT_CATEGORY);
  let index = 0;
  let html = '';
  for (const [category, items] of grouped) {
    html += `<div class="o-cmd-group-label">${escapeHtml(category)}</div>`;
    for (const item of items) {
      html += renderResultItem(item, index++);
    }
  }
  return html;
}
