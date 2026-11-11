import { afterAll, describe, expect, test } from 'bun:test';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { compileAsciiDoc } from '../src/loader/converter.ts';

const tempDirs: string[] = [];
afterAll(async () => {
  await Promise.all(tempDirs.map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('Olympia AsciiDoc Converter', () => {
  test('parses document title, attributes, and extracts section headings for TOC', async () => {
    const adoc = `= Architecture Overview
:description: High-density technical reference architecture
:category: Core Concepts
:order: 2
:badge: NEW
:badge-variant: secondary

Olympia is built for speed and precision.

== Three-Column Layout

The layout is divided into navigation, prose, and contextual rail.

=== Responsive Breakpoints

Desktop, tablet, and mobile viewports are supported.
`;

    const result = await compileAsciiDoc(adoc);

    expect(result.meta.title).toBe('Architecture Overview');
    expect(result.meta.description).toBe('High-density technical reference architecture');
    expect(result.meta.category).toBe('Core Concepts');
    expect(result.meta.order).toBe(2);
    expect(result.meta.badge).toBe('NEW');
    expect(result.meta.badgeVariant).toBe('secondary');

    expect(result.headings).toEqual([
      { depth: 2, slug: '_three_column_layout', text: 'Three-Column Layout' },
      { depth: 3, slug: '_responsive_breakpoints', text: 'Responsive Breakpoints' },
    ]);

    expect(result.html).toContain('class="o-heading o-heading--l2"');
    expect(result.html).toContain('href="#_three_column_layout"');
  });

  test('converts AsciiDoc admonitions into DESIGN.md Callout custom elements', async () => {
    const adoc = `= Admonitions Test

[NOTE]
====
Remember to configure your workspace first.
====

[TIP]
.Performance Hint
====
Use lightweight custom elements for instant page loads.
====

[WARNING]
====
Rate limit exceeded on v1 endpoints.
====
`;

    const result = await compileAsciiDoc(adoc);

    expect(result.html).toContain(
      '<o-callout class="o-callout o-callout--note" data-variant="note"',
    );
    expect(result.html).toContain('<o-callout class="o-callout o-callout--tip" data-variant="tip"');
    expect(result.html).toContain('Performance Hint');
    expect(result.html).toContain(
      '<o-callout class="o-callout o-callout--warning" data-variant="warning"',
    );
  });

  test('converts source code blocks with Shiki syntax highlighting and copy button', async () => {
    const adoc = `= Code Test

[source,typescript,filename="astro.config.mjs"]
----
import { defineConfig } from 'astro/config';
export default defineConfig({});
----
`;

    const result = await compileAsciiDoc(adoc);

    expect(result.html).toContain('<o-code-block class="o-code-block" data-lang="typescript">');
    expect(result.html).toContain('<span class="o-code-filename">astro.config.mjs</span>');
    expect(result.html).toContain('<o-copy-btn class="o-copy-btn"');
    expect(result.html).toContain('shiki');
  });

  test('converts [tabs] open block into <o-tabs> custom element', async () => {
    const adoc = `= Tabs Test

[tabs]
--
.Bun
[source,bash]
----
bun install
----

.pnpm
[source,bash]
----
pnpm install
----
--
`;

    const result = await compileAsciiDoc(adoc);

    expect(result.html).toContain('<o-tabs class="o-tabs">');
    expect(result.html).toContain('role="tablist"');
    expect(result.html).toContain('data-tab-index="0">Bun</button>');
    expect(result.html).toContain('data-tab-index="1">pnpm</button>');
  });

  test('frontmatter overrides AsciiDoc attributes', async () => {
    const result = await compileAsciiDoc(
      '---\ntitle: FM Title\ncategory: FM Cat\n---\n= Doc Title\n:category: Attr Cat\n',
    );
    expect(result.meta.title).toBe('FM Title');
    expect(result.meta.category).toBe('FM Cat');
  });

  test('falls back to default category and parses nav-order', async () => {
    const result = await compileAsciiDoc('= Plain\n:nav-order: 5\n');
    expect(result.meta.category).toBe('Documentation');
    expect(result.meta.order).toBe(5);
  });

  test('non-numeric order falls back to 99', async () => {
    const result = await compileAsciiDoc('= Plain\n:order: abc\n');
    expect(result.meta.order).toBe(99);
  });

  test('attribute values keep a literal ampersand instead of an HTML entity', async () => {
    const result = await compileAsciiDoc(
      '= T\n:category: Authoring & AsciiDoc\n:description: Q & A\n',
    );
    expect(result.meta.category).toBe('Authoring & AsciiDoc');
    expect(result.meta.description).toBe('Q & A');
  });

  test('renders inline and block math with KaTeX at build time', async () => {
    const result = await compileAsciiDoc(
      '= T\n\nstem:[x^2] and latexmath:[\\frac{a}{b}]\n\n[latexmath]\n++++\n\\int_0^1 x\\,dx\n++++\n',
    );
    expect(result.html).toContain('class="katex"');
    expect(result.html).toContain('class="katex-display"');
    expect(result.html).not.toContain('\\(');
    expect(result.html).not.toContain('\\$');
  });

  test('invalid TeX does not throw and renders a KaTeX error span', async () => {
    const result = await compileAsciiDoc('= T\n\nlatexmath:[\\frac{]\n');
    expect(result.html).toContain('katex-error');
  });

  test('resolves relative images against the site root by default', async () => {
    const result = await compileAsciiDoc('= T\n\nimage::foo.png[Foo]\n');
    expect(result.html).toContain('src="/foo.png"');
  });

  test('a document can override imagesdir', async () => {
    const result = await compileAsciiDoc('= T\n:imagesdir: assets\n\nimage::foo.png[Foo]\n');
    expect(result.html).toContain('src="assets/foo.png"');
  });

  test('renders task lists with inline SVG checkboxes instead of an icon font', async () => {
    const result = await compileAsciiDoc('= T\n\n* [x] done\n* [ ] open\n* plain\n');
    expect(result.html).toContain('data-checked="true"');
    expect(result.html).toContain('data-checked="false"');
    expect(result.html).not.toContain('fa-');
  });

  test('renders menu paths with an inline SVG caret', async () => {
    const result = await compileAsciiDoc('= T\n\nmenu:View[Zoom > Reset]\n');
    expect(result.html).toContain('<b class="submenu">Zoom</b>');
    expect(result.html).toContain('o-menu-caret');
    expect(result.html).not.toContain('fa-');
  });

  test('renders code callouts as badges and copies the code without markers', async () => {
    const result = await compileAsciiDoc(
      '= T\n\n[source,typescript]\n----\nconst a = 1; // <.>\nconst b = 2; // <.>\n----\n<.> one\n<.> two\n',
    );
    expect(result.html).toContain('class="o-conum" data-value="1"');
    expect(result.html).toContain('class="o-conum" data-value="2"');
    const copied = /data-code="([^"]*)"/.exec(result.html)?.[1] ?? '';
    expect(decodeURIComponent(copied)).toBe('const a = 1;\nconst b = 2;');
    expect(result.html).toContain('<div class="colist arabic">\n<ol>');
  });

  test('renders [mermaid] blocks as diagram elements with escaped source', async () => {
    const result = await compileAsciiDoc('= T\n\n[mermaid]\n----\ngraph TD; A-->B\n----\n');
    expect(result.html).toContain('<o-mermaid class="o-mermaid">');
    expect(result.html).toContain('A--&gt;B');
    expect(result.html).not.toContain('o-code-block');
  });

  test('renders [source,mermaid] and literal mermaid blocks as diagrams too', async () => {
    const result = await compileAsciiDoc(
      '= T\n\n[source,mermaid]\n----\ngraph TB; E-->F\n----\n\n[mermaid]\n....\ngraph LR; C-->D\n....\n',
    );
    expect(result.html.match(/<o-mermaid /g)).toHaveLength(2);
  });

  test('resolves include:: relative to the given baseDir', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'olympia-'));
    tempDirs.push(dir);
    await mkdir(join(dir, '_partials'));
    await writeFile(join(dir, '_partials', 'note.adoc'), 'Included text.\n');
    const result = await compileAsciiDoc('= T\n\ninclude::_partials/note.adoc[]\n', {
      baseDir: dir,
    });
    expect(result.html).toContain('Included text.');
  });
});
