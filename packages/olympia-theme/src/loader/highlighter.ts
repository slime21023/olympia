import { createHighlighter, type Highlighter } from 'shiki';

export const SHIKI_THEMES = {
  dark: 'github-dark-default',
  light: 'github-light-default',
} as const;

const SUPPORTED_LANGUAGES = [
  'typescript',
  'javascript',
  'json',
  'bash',
  'shell',
  'html',
  'css',
  'asciidoc',
  'yaml',
  'toml',
  'astro',
  'sql',
  'http',
  'markdown',
  'plaintext',
];

let highlighterPromise: Promise<Highlighter> | undefined;

export function getOlympiaHighlighter(): Promise<Highlighter> {
  highlighterPromise ??= createHighlighter({
    themes: Object.values(SHIKI_THEMES),
    langs: SUPPORTED_LANGUAGES,
  });
  return highlighterPromise;
}

/** Falls back to `plaintext` for languages the highlighter did not load. */
export function resolveLanguage(highlighter: Highlighter, lang: string): string {
  return highlighter.getLoadedLanguages().includes(lang) ? lang : 'plaintext';
}

export function highlightCode(highlighter: Highlighter, code: string, lang: string): string {
  return highlighter.codeToHtml(code, { lang, themes: SHIKI_THEMES, defaultColor: false });
}
