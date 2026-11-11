import { getRenderedScheme, onSchemeChange } from '../../utils/color-scheme.ts';
import { defineElement } from '../../utils/define-element.ts';

let diagramCounter = 0;

/**
 * <o-mermaid>: renders the Mermaid source in its `.o-mermaid__source` child as an SVG diagram,
 * and re-renders it when the color scheme changes. Without JavaScript the source stays visible.
 */
class OlympiaMermaid extends HTMLElement {
  private source = '';
  private diagram: HTMLElement | null = null;
  private rendering = false;
  private renderAgain = false;

  connectedCallback() {
    this.source = this.querySelector('.o-mermaid__source')?.textContent?.trim() ?? '';
    if (!this.source) return;
    void this.render();
    onSchemeChange(() => void this.render());
  }

  private async render() {
    // Rendering runs one at a time; a scheme change during a render queues exactly one more.
    if (this.rendering) {
      this.renderAgain = true;
      return;
    }
    this.rendering = true;
    const id = `o-mermaid-${++diagramCounter}`;
    try {
      // Lazy: mermaid is large, so the chunk loads only on pages that contain a diagram.
      const { default: mermaid } = await import('mermaid');
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: getRenderedScheme() === 'dark' ? 'dark' : 'default',
      });
      const { svg } = await mermaid.render(id, this.source);
      if (!this.diagram) {
        this.diagram = document.createElement('div');
        this.diagram.className = 'o-mermaid__diagram';
        this.append(this.diagram);
      }
      this.diagram.innerHTML = svg;
      this.dataset.rendered = 'true';
      delete this.dataset.error;
    } catch {
      // Invalid diagram source: keep the source text visible and drop mermaid's leftover error node.
      this.dataset.error = 'true';
      document.getElementById(`d${id}`)?.remove();
    } finally {
      this.rendering = false;
      if (this.renderAgain) {
        this.renderAgain = false;
        void this.render();
      }
    }
  }
}

defineElement('o-mermaid', OlympiaMermaid);
