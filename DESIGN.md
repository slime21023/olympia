---
name: Technical Precision
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1c1b1d'
  surface-container: '#201f22'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#313032'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#ca8100'
  on-tertiary-container: '#3e2400'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style
The design system targets software engineers, API architects, technical writers, and product builders seeking low-friction, high-density technical reference material. It emphasizes intellectual clarity, speed of comprehension, and operational confidence over decorative flourishes. 

The aesthetic blends **Modern Utilitarianism** with **Engineered Minimalism**:
- Precise, crisp structural framing using hairline strokes rather than heavy shadows.
- Calm, disciplined visual density that accommodates deep nested sidebars, multi-column API signatures, synchronized request/response panes, and tabular schema references.
- High signal-to-noise ratio: interface scaffolding recedes into neutral zinc/slate tones, empowering syntax-highlighted code blocks, actionable state indicators, and informational callouts to drive attention instantly.

## Colors
The palette is calibrated for long reading sessions and rapid code parsing, defaulting to a deep, zero-glare dark mode while retaining an identical semantic structure for clean light-mode viewports.

- **Primary (`#6366f1` / Indigo-Violet):** Reserved for interactive anchor highlights, selected sidebar nodes, active navigation pills, primary actions, and focus rings.
- **Secondary (`#10b981` / Emerald):** Signals success responses, API status 200/201 pills, inline tip callouts, and copy confirmations.
- **Tertiary (`#f59e0b` / Amber):** Highlights breaking API changes, rate-limit warnings, deprecation notices, and caution admonitions.
- **Neutral (`#09090b` / Deep Zinc Canvas):** Anchors page canvas, nested surface layers, and code editor backdrops, supported by slate-tinted hairpins (`#27272a` in dark, `#e4e4e7` in light).
- **Surface Elevation Hierarchy:** Canvas (`#09090b`), Surface Raised / Sidebar (`#121215`), Surface Overlay / Popovers (`#18181b`), and Code Block Canvas (`#0f0f12`).

## Typography
Typography is organized around strict optical clarity and dense structural readability.

- **Geist:** Powers the primary document structure, headings, body copy, and navigation trees. Tight letter spacing (`-0.02em` on titles) creates modern, cohesive headings without sacrificing legibility at paragraph scale.
- **JetBrains Mono:** Exclusively utilized for code listings, HTTP method tags (`POST`, `GET`), parameter schema keys, response status labels, inline code tags, and keyboard shortcuts (`Cmd+K`).
- **Hierarchy Rules:** Section titles (`headline-lg`) feature an unobtrusive self-linking anchor glyph on hover. Paragraph body text enforces an optimal line length between 65–75 characters in central documentation panes to optimize reading scan rate.

## Layout & Spacing
The layout adheres to a structured, 3-column reference architecture:
- **Left Column (Primary Navigation):** Fixed width (260px–280px), persistent tree navigation with grouped sections, collapsible directory nodes, and quick search entry.
- **Center Column (Documentation Core):** Flexible width (max 768px), high-readability prose, tables, parameter lists, and diagrams.
- **Right Column (Contextual API Pane / Table of Contents):** Sticky contextual rail (300px–420px) housing dynamic code playgrounds, interactive language switchers, and on-page section TOCs.

### Responsiveness
- **Desktop (>= 1280px):** Full 3-column split view (Nav, Prose, Interactive Playground / TOC).
- **Tablet (768px - 1279px):** 2-column view. The playground/code blocks fold beneath their corresponding prose descriptions; the table of contents collapses into a floating bottom sheet or header dropdown.
- **Mobile (< 768px):** Single-column stacked fluid layout with sticky mobile header containing a hamburger drawer (navigation) and breadcrumb rail. Code blocks use horizontal scroll with visible right edge fade masks.

## Elevation & Depth
Depth is articulated primarily through **low-contrast outlines** and **tonal layering** rather than diffused drop shadows, preventing visual blur in technical, text-heavy views.

- **Hairline Borders:** Key structural separations (sidebar dividers, header bars, card boundaries, table cells) use precise `1px solid` borders using `#27272a` (dark) or `#e4e4e7` (light).
- **Tonal Stepping:** Overlays and dropdown menus sit on elevated surfaces (`#18181b`) accompanied by a subtle ambient outline (`rgba(255, 255, 255, 0.08)`) and high-density, low-spread shadows (`0 8px 24px rgba(0, 0, 0, 0.4)`).
- **Frosted Glass Navigation:** Fixed top headers apply a subtle `backdrop-filter: blur(8px)` with `85%` alpha surface fill, allowing background typography to soften seamlessly during document scrolling.

## Shapes
A disciplined 8px (`rounded-md` / base `roundedness: 2`) border radius defines the tactile signature across all interface controls.

- **Standard Containers & Cards:** Precision 8px corner curves maintain clean alignment with code blocks and input fields.
- **Interactive Badges & Pills:** Secondary endpoints, tags, and HTTP verb tags use tighter 4px–6px curves (`rounded-sm` to `rounded-md`) to communicate tight, dense grouping.
- **Floating Modals & Command Bars:** Outer borders employ `12px` (`rounded-lg`) to soften larger floating elements such as the `Cmd+K` palette.

## Components

### Buttons & Quick Actions
- **Primary Action:** Solid indigo background (`#6366f1`), bright white text, 8px border radius, subtle top-highlight border, hovering to `#4f46e5`.
- **Secondary / Ghost:** Transparent background with hairline border (`#27272a`), muted text (`#a1a1aa`), hovering to surface-raised (`#18181b`) and primary text (`#f4f4f5`).
- **Icon / Copy Action:** Frameless 28x28px micro-buttons nested in code headers that reveal a tooltip and switch between clipboard and green checkmark icons.

### Code Blocks & Snippets
- **Code Container:** Darkened slate backdrop (`#0f0f12`) framed in 1px border. Features a header bar with language indicator badge, active file path or endpoint method, and a one-click copy button.
- **Inline Code:** Monospace font (`JetBrains Mono`), padded horizontally by `0.375rem`, vertically by `0.125rem`, with a neutral boundary and background (`#18181b` in dark mode).
- **Syntax Highlighting:** High-contrast tokens—Indigo for keywords, Sky for attributes, Amber for strings, Emerald for return types, and Slate for comments.

### Callout Admonitions
- **Structure:** 8px rounded container with 1px border and a subtle 4% background tint matching the semantic state.
- **Info (Indigo):** General context, links to guides, or prerequisite dependencies.
- **Tip (Emerald):** Best practices, performance optimizations, and recommended patterns.
- **Warning (Amber):** Deprecations, authorization warnings, and critical rate-limit thresholds.

### Command Palette (`Cmd+K`)
- Centered overlay modal with backdrop scrim (`rgba(0, 0, 0, 0.6)`).
- Top search input with an integrated search glyph, followed by dynamic keyboard-navigable list categories ("Pages", "API Methods", "Concepts") showing path badges and hotkey indicators.

### Navigation Trees & Lists
- Nested tree items spaced with `4px` gaps, utilizing a `2px` vertical guideline indicating child depth.
- Active item marked by an indigo left accent line or full-width tinted pill with medium font weight and white text.