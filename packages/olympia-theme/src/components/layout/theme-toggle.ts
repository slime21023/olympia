import {
  getColorSchemeMeta,
  getRenderedScheme,
  getSystemScheme,
  type Scheme,
} from '../../utils/color-scheme.ts';
import { defineElement } from '../../utils/define-element.ts';

// Must match the `is:inline` color-scheme bootstrap in `layouts/DocsLayout.astro`.
const STORAGE_KEY = 'color-scheme';
const AUTO_SCHEME = 'light dark';

/**
 * <o-theme-toggle> implementing modern-web-guidance `dark-mode-toggle`:
 * Synchronizes `<meta name="color-scheme">` and `localStorage`, reverting to `"light dark"`
 * when the target matches the OS preference so system auto-switching isn't invisibly pinned.
 */
class OlympiaThemeToggle extends HTMLElement {
  connectedCallback() {
    const button = this.querySelector('button');
    if (!button) return;

    button.addEventListener('click', () => {
      const target: Scheme = getRenderedScheme() === 'dark' ? 'light' : 'dark';
      const meta = getColorSchemeMeta();

      try {
        if (target === getSystemScheme()) {
          localStorage.removeItem(STORAGE_KEY);
          if (meta) meta.content = AUTO_SCHEME;
        } else {
          localStorage.setItem(STORAGE_KEY, target);
          if (meta) meta.content = target;
        }
      } catch {
        // Storage blocked: apply for this page view only.
        if (meta) meta.content = target;
      }
    });

    window.addEventListener('storage', (event) => {
      if (event.key !== STORAGE_KEY) return;
      const meta = getColorSchemeMeta();
      if (meta) meta.content = event.newValue ?? AUTO_SCHEME;
    });
  }
}

defineElement('o-theme-toggle', OlympiaThemeToggle);
