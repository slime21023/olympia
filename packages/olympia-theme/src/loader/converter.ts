import createAsciidoctor, {
  type AbstractNode,
  type Asciidoctor,
  type Block,
  type Inline,
  type List,
  type Section,
} from '@asciidoctor/core';
import type { AsciiDocMeta, HeadingItem } from '../types.ts';
import { htmlToPlainText } from '../utils/html.ts';
import { extractFrontmatter } from './frontmatter.ts';
import { getOlympiaHighlighter } from './highlighter.ts';
import { collectStringAttributes, resolveMeta } from './metadata.ts';
import {
  renderAdmonition,
  renderChecklist,
  renderInlineMath,
  renderKbd,
  renderListing,
  renderMenu,
  renderMermaid,
  renderSection,
  renderStemBlock,
  renderTabs,
  type RenderContext,
} from './node-renderers.ts';

export interface CompiledAsciiDoc {
  html: string;
  headings: HeadingItem[];
  meta: AsciiDocMeta;
}

const ASCIIDOC_ATTRIBUTES = {
  experimental: '',
  // Relative image targets resolve to the site root, so images live in the site's `public/` folder.
  // A document can still override this with `:imagesdir:`.
  imagesdir: '/@',
  sectanchors: '',
  'source-highlighter': 'none',
};

let asciidoctorInstance: Asciidoctor | undefined;

function getAsciidoctor(): Asciidoctor {
  asciidoctorInstance ??= createAsciidoctor();
  return asciidoctorInstance;
}

/** Overrides section, admonition, listing, tabs and `kbd` output; defers everything else to the stock HTML5 converter. */
class OlympiaHtml5Converter {
  private readonly base = getAsciidoctor().Html5Converter.create();

  constructor(private readonly ctx: RenderContext) {}

  convert(node: AbstractNode, transform?: string, opts?: unknown): string {
    // The Asciidoctor dispatch guarantees the node class that matches each transform name.
    switch (transform || node.getNodeName()) {
      case 'section':
        return renderSection(node as Section, this.ctx);
      case 'admonition':
        return renderAdmonition(node as Block);
      case 'listing': {
        // `[mermaid]` blocks and `[source,mermaid]` listings are diagrams, not highlighted code.
        const block = node as Block;
        return block.getStyle() === 'mermaid' || block.getAttribute('language') === 'mermaid'
          ? renderMermaid(block)
          : renderListing(block, this.ctx);
      }
      case 'literal':
        return (node as Block).getStyle() === 'mermaid'
          ? renderMermaid(node as Block)
          : this.base.convert(node, transform, opts);
      case 'open':
      case 'example':
        return renderTabs(node as Block) ?? this.base.convert(node, transform, opts);
      case 'inline_kbd':
        return renderKbd(node as Inline);
      case 'inline_menu':
        return renderMenu(node as Inline);
      case 'ulist':
        return (node as List).isOption('checklist')
          ? renderChecklist(node as List)
          : this.base.convert(node, transform, opts);
      case 'stem':
        return renderStemBlock(node as Block);
      case 'inline_quoted': {
        const type = (node as Inline).getType();
        return type === 'asciimath' || type === 'latexmath'
          ? renderInlineMath(node as Inline)
          : this.base.convert(node, transform, opts);
      }
      default:
        return this.base.convert(node, transform, opts);
    }
  }
}

/**
 * Compiles an AsciiDoc document string into Technical Precision HTML + structured metadata + TOC headings.
 * Emits 11ty WebC-style custom elements (`<o-code-block>`, `<o-copy-btn>`, `<o-callout>`, `<o-tabs>`)
 * for zero-framework progressive enhancement.
 */
export async function compileAsciiDoc(
  rawSource: string,
  fallbackTitle = 'Untitled',
): Promise<CompiledAsciiDoc> {
  const highlighter = await getOlympiaHighlighter();
  const { content, frontmatter } = extractFrontmatter(rawSource);
  const ctx: RenderContext = { highlighter, headings: [] };

  const doc = getAsciidoctor().load(content, {
    safe: 'safe',
    standalone: false,
    converter: new OlympiaHtml5Converter(ctx),
    attributes: ASCIIDOC_ATTRIBUTES,
  });

  const attributes = collectStringAttributes(doc.getAttributes());
  const documentTitle = doc.getDocumentTitle();
  const meta = resolveMeta(
    frontmatter,
    attributes,
    documentTitle ? htmlToPlainText(String(documentTitle)) : '',
    fallbackTitle,
  );

  // Headings are collected while converting, so read them only after `convert()` returns.
  const html = String(doc.convert());

  return { html, headings: ctx.headings, meta };
}
