// Shared by build-time (loader) and client code: keep free of Node imports.

export function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function unescapeHtml(str: string): string {
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

export function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/** Converts an inline-HTML fragment (e.g. a section title) to plain text. */
export function htmlToPlainText(html: string): string {
  return unescapeHtml(stripTags(html));
}
