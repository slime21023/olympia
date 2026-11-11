import AsciiMathParser from 'asciimath2tex';
import { renderToString } from 'katex';
import { escapeHtml } from '../utils/html.ts';

export type MathNotation = 'asciimath' | 'latexmath';

const asciiMathParser = new AsciiMathParser();

/**
 * Renders a math expression to static KaTeX HTML at build time.
 * AsciiMath is converted to TeX first. KaTeX syntax errors render as KaTeX's own `katex-error`
 * span; a failure in the AsciiMath conversion falls back to the escaped source.
 */
export function renderMath(source: string, notation: MathNotation, displayMode: boolean): string {
  let tex = source;
  if (notation === 'asciimath') {
    try {
      tex = asciiMathParser.parse(source);
    } catch {
      return `<code class="o-math-error">${escapeHtml(source)}</code>`;
    }
  }
  // KaTeX emits both MathML and a visual copy of the formula, which would show up twice in search
  // excerpts, so the whole formula is left out of the Pagefind index.
  return renderToString(tex, { displayMode, throwOnError: false }).replace(
    'class="katex"',
    'class="katex" data-pagefind-ignore',
  );
}
