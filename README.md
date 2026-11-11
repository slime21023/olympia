# Olympia

A technical documentation and API reference theme for [Astro](https://astro.build) 5 with native
[AsciiDoc](https://asciidoc.org) support.

- **AsciiDoc content loader**: write `.adoc` files and they become pages, with hot reload in dev.
- **Three-column reference layout**: sidebar tree, reading column, scroll-synced table of contents,
  and a slide-out drawer on mobile.
- **Build-time syntax highlighting** with [Shiki](https://shiki.style) (dark and light themes), file
  name headers, HTTP method and endpoint labels, and a copy button.
- **Callouts, tabs and keyboard shortcuts** from plain AsciiDoc (`NOTE`/`TIP`/`IMPORTANT`/`WARNING`/`CAUTION`,
  `[tabs]`, `kbd:[Ctrl+K]`).
- **Full-text search** with [Pagefind](https://pagefind.app) behind a `Cmd/Ctrl+K` command palette.
- **Light and dark color scheme** with a toggle and no flash on load.

The repository is a Bun workspace with two packages:

| Path                     | What it is                                                                              |
| ------------------------ | --------------------------------------------------------------------------------------- |
| `packages/olympia-theme` | The theme, used as the workspace package `@olympia/theme` (layout, components, loader). |
| `apps/docs`              | A working example site that uses the theme. It is also its documentation.               |

## Requirements

- [Bun](https://bun.sh) 1.2 or later (installs dependencies and runs the scripts).
- Node.js 20 or later (the Astro CLI runs on it).
- Browsers: **Chrome 123 or later**. The CSS uses `light-dark()` and the scripts use
  `Promise.withResolvers` and `Map.groupBy`. Only Chrome has been tested. The build target is set to
  `chrome123` in `apps/docs/astro.config.mjs`.

## Try the example site

```sh
git clone https://github.com/slime21023/olympia.git
cd olympia
bun install
bun run dev      # http://localhost:4321
```

Add or edit `.adoc` files in `apps/docs/src/content/docs/` and the site updates immediately.

## Create your own docs site

`@olympia/theme` is not published to npm. To use it, keep it as a workspace package next to your site.
Either start from this repository (replace the content in `apps/docs`), or add the theme to a new
project as below. The steps below were run end to end in a clean directory.

### 1. Set up the workspace

```text
my-docs/
├─ package.json              # workspaces
├─ packages/
│  └─ olympia-theme/         # copy this folder from this repository
└─ apps/
   └─ site/                  # your Astro site
```

Copy `packages/olympia-theme` from this repository into `packages/olympia-theme` (leave out
`node_modules`, `tests` and `tsconfig.json`; they are not needed to consume the theme).

`my-docs/package.json`:

```json
{
  "name": "my-docs",
  "private": true,
  "workspaces": ["packages/*", "apps/*"],
  "scripts": {
    "dev": "bun --cwd apps/site dev",
    "build": "bun --cwd apps/site build",
    "preview": "bun --cwd apps/site preview"
  }
}
```

`apps/site/package.json`:

```json
{
  "name": "my-site",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build && bunx pagefind --site dist",
    "preview": "astro preview"
  },
  "dependencies": {
    "@olympia/theme": "workspace:*",
    "astro": "^5.5.0",
    "pagefind": "^1.3.0"
  }
}
```

The `build` script runs Pagefind after Astro to create the search index.

### 2. Configure Astro

`apps/site/astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://example.com', // your production URL
  output: 'static',
});
```

`apps/site/tsconfig.json` (gives you Astro's generated types):

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

### 3. Register the content collection

`apps/site/src/content.config.ts`:

```ts
import { defineCollection, z } from 'astro:content';
import { asciidocLoader } from '@olympia/theme/loader';
import { BADGE_VARIANTS, DEFAULT_CATEGORY, DEFAULT_ORDER } from '@olympia/theme';

const docs = defineCollection({
  loader: asciidocLoader({ base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    category: z.string().default(DEFAULT_CATEGORY),
    order: z.number().default(DEFAULT_ORDER),
    badge: z.string().optional(),
    badgeVariant: z.enum(BADGE_VARIANTS).optional(),
    httpMethod: z.string().optional(),
    endpoint: z.string().optional(),
    attributes: z.record(z.string(), z.string()).default({}),
    headings: z
      .array(z.object({ depth: z.number(), slug: z.string(), text: z.string() }))
      .default([]),
  }),
});

export const collections = { docs };
```

Keep the `headings` field: the loader fills it and the table of contents reads it. If the schema omits
it, the on-page table of contents is empty.

### 4. Add the page route

`apps/site/src/pages/[...slug].astro` renders every document with the theme layout:

```astro
---
import { getCollection, render } from 'astro:content';
import { buildDocsNavigation, getAdjacentPages } from '@olympia/theme';
import DocsLayout from '@olympia/theme/layouts/DocsLayout.astro';

export async function getStaticPaths() {
  const entries = await getCollection('docs');
  const { navGroups, flatItems } = buildDocsNavigation(entries);

  return entries.map((entry) => {
    const slug = entry.id === 'index' ? undefined : entry.id;
    const { prevPage, nextPage } = getAdjacentPages(flatItems, entry.id);

    return {
      params: { slug },
      props: { entry, navGroups, searchDocs: flatItems, prevPage, nextPage },
    };
  });
}

const { entry, navGroups, searchDocs, prevPage, nextPage } = Astro.props;
const { Content } = await render(entry);
---

<DocsLayout
  title={entry.data.title}
  description={entry.data.description}
  category={entry.data.category}
  badge={entry.data.badge}
  badgeVariant={entry.data.badgeVariant}
  httpMethod={entry.data.httpMethod}
  endpoint={entry.data.endpoint}
  headings={entry.data.headings}
  navGroups={navGroups}
  searchDocs={searchDocs}
  prevPage={prevPage}
  nextPage={nextPage}
  siteTitle="My Docs"
  version="v1.0.0"
>
  <Content />
</DocsLayout>
```

### 5. Write content

Every `.adoc` file under `src/content/docs/` becomes a page. `index.adoc` is the home page, and
`guide/index.adoc` is served at `/guide`.

```asciidoc
= Installation Guide
:description: System requirements and project initialization steps
:category: Getting Started
:order: 2
:badge: GUIDE
:badge-variant: secondary

== System Requirements

Ensure Bun 1.2 or later is installed.
```

### 6. Run it

```sh
bun install
bun run dev       # development server with hot reload
bun run build     # static site in apps/site/dist, with the search index
bun run preview   # serve the production build
```

Search uses the Pagefind index, which only exists after `bun run build`. In `dev` the command palette
falls back to matching titles, descriptions and categories.

## Writing content

### Page attributes

Set these in the AsciiDoc document header. A YAML-style `---` frontmatter block at the top of the
file also works, and its values win over header attributes.

| Attribute                        | Default         | Purpose                                                      |
| -------------------------------- | --------------- | ------------------------------------------------------------ |
| `= Title`                        | file name       | Page title.                                                  |
| `:description:`                  | empty           | Lead text under the title, and the search excerpt.           |
| `:category:` (or `:nav-group:`)  | `Documentation` | Sidebar group.                                               |
| `:order:` (or `:nav-order:`)     | `99`            | Sort position inside the group (lower first, ties by title). |
| `:badge:`                        | none            | Small label in the sidebar and page header.                  |
| `:badge-variant:`                | `primary`       | `primary`, `secondary` or `tertiary`.                        |
| `:http-method:` and `:endpoint:` | none            | HTTP verb label and route shown for API pages.               |

### Content blocks

- **Callouts**: `[NOTE]`, `[TIP]`, `[IMPORTANT]`, `[WARNING]` and `[CAUTION]` blocks, with an optional
  `.Title` line.
- **Code**: `[source,typescript,filename="src/app.ts"]` adds a file name header.
  `[source,http,method="POST",endpoint="/v1/query"]` adds a method and route header. Supported
  languages: typescript, javascript, json, bash, shell, html, css, asciidoc, yaml, toml, astro, sql, http,
  markdown. Anything else renders as plain text.
- **Tabs**: put `[tabs]` above an open (`--`) or example (`====`) block; each child block with a
  `.Tab Title` becomes a tab.
- **Keyboard shortcuts**: `kbd:[Ctrl+Shift+P]`.

See `apps/docs/src/content/docs/authoring/asciidoc-syntax.adoc` for full examples.

## Customization

- **Site name and version**: the `siteTitle` and `version` props of `DocsLayout`.
- **Sidebar group order**: pass your own list as the second argument,
  `buildDocsNavigation(entries, ['Getting Started', 'Guides', 'API'])`. Listed groups come first in that
  order; any others follow alphabetically.
- **Colors and sizes**: the design tokens are CSS variables in
  `packages/olympia-theme/src/styles/tokens.css` (`--o-primary`, `--o-surface`, `--sidebar-width`, and
  so on). Override them in your own stylesheet, or edit the file in your copy of the theme.
- **Extra right-rail content**: `DocsLayout` has a named slot, `<Fragment slot="rail">…</Fragment>`.
- **Components**: the pieces are grouped by feature in `packages/olympia-theme/src/components/`
  (`layout`, `navigation`, `content`, `search`). You own your copy of the theme, so edit them directly.

Known limits: the GitHub link in the header always points to `https://github.com`, and
`DocsLayout` does not expose a prop to change it. Edit `components/layout/Header.astro` in your copy
to set your repository URL.

## Development

Run from the repository root:

| Command                             | Does                                                                  |
| ----------------------------------- | --------------------------------------------------------------------- |
| `bun run dev`                       | Start the example site with hot reload.                               |
| `bun run build`                     | Build the example site and its search index.                          |
| `bun run preview`                   | Serve the production build.                                           |
| `bun test`                          | Run the loader, converter, navigation and search tests.               |
| `bun run lint` / `bun run lint:fix` | [oxlint](https://oxc.rs/docs/guide/usage/linter).                     |
| `bun run fmt` / `bun run fmt:check` | [oxfmt](https://oxc.rs/docs/guide/usage/formatter) (writes / checks). |
| `bun run typecheck`                 | `tsc` on the theme's TypeScript.                                      |
| `bun run check`                     | `astro check` on the example site and the theme's `.astro` files.     |

Layout of the theme package (`packages/olympia-theme/src`):

```text
layouts/DocsLayout.astro   page shell
components/                layout/ navigation/ content/ search/  (each with its own scripts)
loader/                    AsciiDoc loader, converter, metadata and renderers
styles/                    tokens.css and prose.css (split into styles/content/*.css)
navigation.ts, types.ts    sidebar and pagination logic, shared types
```

## License

[MIT](./LICENSE) © 2026 KevinChueh
