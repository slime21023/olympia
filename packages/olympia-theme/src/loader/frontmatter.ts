const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;

/**
 * Extract frontmatter if present (`---\n...\n---`), returning remaining AsciiDoc source
 * and key-value frontmatter overrides.
 */
export function extractFrontmatter(raw: string): {
  content: string;
  frontmatter: Record<string, string>;
} {
  const match = raw.match(FRONTMATTER_PATTERN);
  if (!match) {
    return { content: raw, frontmatter: {} };
  }
  const frontmatter: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      frontmatter[key] = line
        .slice(idx + 1)
        .trim()
        .replace(/^['"]|['"]$/g, '');
    }
  }
  return {
    content: raw.slice(match[0].length),
    frontmatter,
  };
}
