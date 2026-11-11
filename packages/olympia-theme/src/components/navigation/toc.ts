import { defineElement } from '../../utils/define-element.ts';

/** <o-toc>: highlights the TOC link of the heading currently in view. */
class OlympiaToc extends HTMLElement {
  connectedCallback() {
    const links = this.querySelectorAll<HTMLAnchorElement>('[data-toc-slug]');

    const linksBySlug = new Map<string, HTMLAnchorElement>();
    const targets: HTMLElement[] = [];
    for (const link of links) {
      const slug = link.dataset.tocSlug;
      if (!slug) continue;
      linksBySlug.set(slug, link);
      const target = document.getElementById(slug);
      if (target) targets.push(target);
    }
    if (targets.length === 0) return;

    const setActive = (slug: string) => {
      for (const [key, link] of linksBySlug) {
        if (key === slug) {
          link.dataset.active = 'true';
        } else {
          delete link.dataset.active;
        }
      }
    };

    setActive(targets[0].id);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActive(visible.target.id);
      },
      {
        rootMargin: '-72px 0px -75% 0px',
        threshold: [0, 1],
      }
    );

    for (const target of targets) {
      observer.observe(target);
    }
  }
}

defineElement('o-toc', OlympiaToc);
