import { describe, expect, test } from 'bun:test';
import { compileAsciiDoc } from '../src/loader/converter.ts';

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

    expect(result.html).toContain('<o-callout class="o-callout o-callout--note" data-variant="note"');
    expect(result.html).toContain('<o-callout class="o-callout o-callout--tip" data-variant="tip"');
    expect(result.html).toContain('Performance Hint');
    expect(result.html).toContain('<o-callout class="o-callout o-callout--warning" data-variant="warning"');
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
      '---\ntitle: FM Title\ncategory: FM Cat\n---\n= Doc Title\n:category: Attr Cat\n'
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
});
