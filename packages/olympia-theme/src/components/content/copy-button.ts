import { defineElement } from '../../utils/define-element.ts';

const COPIED_RESET_MS = 1800;

/** <o-copy-btn data-code="<url-encoded source>">: copies the code and shows a checkmark briefly. */
class OlympiaCopyBtn extends HTMLElement {
  private resetTimer: number | undefined;

  connectedCallback() {
    this.querySelector('button')?.addEventListener('click', () => void this.copy());
  }

  private async copy() {
    const code = decodeURIComponent(this.getAttribute('data-code') || '');
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Clipboard unavailable or permission denied: leave button state unchanged.
      return;
    }
    this.setAttribute('data-copied', 'true');
    window.clearTimeout(this.resetTimer);
    this.resetTimer = window.setTimeout(() => this.removeAttribute('data-copied'), COPIED_RESET_MS);
  }
}

defineElement('o-copy-btn', OlympiaCopyBtn);
