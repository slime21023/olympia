import type { AbstractBlock, Block, Inline, Section } from '@asciidoctor/core';
import type { Highlighter } from 'shiki';
import { CHECK_ICON, COPY_ICON, getCalloutIcon } from '../icons.ts';
import type { HeadingItem } from '../types.ts';
import { escapeHtml, htmlToPlainText, unescapeHtml } from '../utils/html.ts';
import { highlightCode, resolveLanguage } from './highlighter.ts';

export interface RenderContext {
  highlighter: Highlighter;
  /** Filled as sections are rendered; read after `doc.convert()` completes. */
  headings: HeadingItem[];
}

const TOC_MIN_DEPTH = 2;
const TOC_MAX_DEPTH = 4;
const MAX_HEADING_TAG_LEVEL = 6;

/** Level 1 AsciiDoc sections render as `<h2>`; only depths 2-4 are listed in the TOC. */
export function renderSection(node: Section, ctx: RenderContext): string {
  const level = node.getLevel() + 1;
  const id = node.getId() || '';
  const rawTitle = node.getTitle() || '';
  if (level >= TOC_MIN_DEPTH && level <= TOC_MAX_DEPTH && id) {
    ctx.headings.push({ depth: level, slug: id, text: htmlToPlainText(rawTitle) });
  }
  const tag = `h${Math.min(Math.max(level, TOC_MIN_DEPTH), MAX_HEADING_TAG_LEVEL)}`;
  const role = node.getRole() ? ` ${node.getRole()}` : '';
  return `<section class="o-section o-section--l${level}${role}" aria-labelledby="${id}">
          <${tag} id="${id}" class="o-heading o-heading--l${level}">
            <a class="o-heading__anchor" href="#${id}">
              <span>${rawTitle}</span>
              <span class="o-heading__glyph" aria-hidden="true">#</span>
            </a>
          </${tag}>
          <div class="o-section__body">${node.getContent() ?? ''}</div>
        </section>`;
}

export function renderAdmonition(node: Block): string {
  const name = String(node.getAttribute('name') || 'note').toLowerCase();
  const title = node.getTitle() || node.getAttribute('textlabel') || name.toUpperCase();
  return `<o-callout class="o-callout o-callout--${name}" data-variant="${name}" role="note">
          <div class="o-callout__header">
            <span class="o-callout__icon">${getCalloutIcon(name)}</span>
            <span class="o-callout__title">${title}</span>
          </div>
          <div class="o-callout__body">${node.getContent()}</div>
        </o-callout>`;
}

interface CodeHeaderInfo {
  method: string;
  endpoint: string;
  title: string;
  lang: string;
}

function renderCodeHeaderMeta({ method, endpoint, title, lang }: CodeHeaderInfo): string {
  const hasEndpoint = Boolean(method && endpoint);
  let primary: string;
  if (hasEndpoint) {
    primary = `<span class="o-code-verb o-code-verb--${method.toLowerCase()}">${escapeHtml(method.toUpperCase())}</span><span class="o-code-endpoint">${escapeHtml(endpoint)}</span>`;
  } else if (title) {
    primary = `<span class="o-code-filename">${escapeHtml(title)}</span>`;
  } else {
    primary = `<span class="o-code-lang">${escapeHtml(lang === 'plaintext' ? 'text' : lang)}</span>`;
  }
  const showLangBadge = (title || hasEndpoint) && lang !== 'plaintext';
  return `${primary}
              ${showLangBadge ? `<span class="o-code-badge">${escapeHtml(lang)}</span>` : ''}`;
}

function renderCopyButton(code: string): string {
  return `<o-copy-btn class="o-copy-btn" data-code="${encodeURIComponent(code)}">
              <button type="button" class="o-copy-btn__trigger" aria-label="Copy code to clipboard" title="Copy code">
                ${COPY_ICON}
                ${CHECK_ICON}
              </button>
            </o-copy-btn>`;
}

export function renderListing(node: Block, ctx: RenderContext): string {
  const rawLang = String(node.getAttribute('language') || 'plaintext').toLowerCase();
  const title = node.getTitle() || node.getAttribute('filename') || '';
  const method = node.getAttribute('method') || '';
  const endpoint = node.getAttribute('endpoint') || '';
  const rawCode = unescapeHtml(String(node.getSource() || ''));

  const lang = resolveLanguage(ctx.highlighter, rawLang);
  const highlightedHtml = highlightCode(ctx.highlighter, rawCode, lang);

  return `<o-code-block class="o-code-block" data-lang="${escapeHtml(rawLang)}">
          <div class="o-code-block__header">
            <div class="o-code-block__meta">
              ${renderCodeHeaderMeta({ method, endpoint, title, lang: rawLang })}
            </div>
            ${renderCopyButton(rawCode)}
          </div>
          <div class="o-code-block__body">${highlightedHtml}</div>
        </o-code-block>`;
}

/** Renders `[tabs]` open/example blocks; returns `undefined` for any other block so the caller can fall back. */
export function renderTabs(node: Block): string | undefined {
  const style = String(node.getStyle() || '');
  const role = String(node.getRole() || '');
  const isTabs = style === 'tabs' || role.split(/\s+/).includes('tabs');
  const blocks: AbstractBlock[] = node.getBlocks();
  if (!isTabs || blocks.length === 0) return undefined;

  const buttons = blocks.map((child, idx) => {
    const tabTitle = child.getTitle() || child.getAttribute('tab') || `Tab ${idx + 1}`;
    return `<button type="button" role="tab" class="o-tabs__tab" aria-selected="${idx === 0}" data-tab-index="${idx}">${escapeHtml(String(tabTitle))}</button>`;
  });
  const panels = blocks.map(
    (child, idx) =>
      `<div role="tabpanel" class="o-tabs__panel" data-panel-index="${idx}" ${idx === 0 ? '' : 'hidden'}>${child.convert()}</div>`,
  );
  return `<o-tabs class="o-tabs">
              <div class="o-tabs__list" role="tablist">${buttons.join('')}</div>
              <div class="o-tabs__panels">${panels.join('')}</div>
            </o-tabs>`;
}

export function renderKbd(node: Inline): string {
  const keys = (node.getAttribute('keys') || []) as string[];
  const keyElements = keys.map((key) => `<kbd class="o-kbd">${escapeHtml(key)}</kbd>`);
  return `<span class="o-kbd-group">${keyElements.join('<span class="o-kbd-plus">+</span>')}</span>`;
}
