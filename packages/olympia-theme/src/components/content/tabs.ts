import { defineElement } from '../../utils/define-element.ts';

/** <o-tabs>: click and ArrowLeft/ArrowRight (wrapping) tab switcher with roving tabindex. */
class OlympiaTabs extends HTMLElement {
  connectedCallback() {
    const tabs = [
      ...this.querySelectorAll<HTMLButtonElement>(':scope > .o-tabs__list > [role="tab"]'),
    ];
    const panels = [
      ...this.querySelectorAll<HTMLElement>(':scope > .o-tabs__panels > [role="tabpanel"]'),
    ];
    if (tabs.length === 0) return;

    const selectTab = (index: number, focus = false) => {
      for (const [i, tab] of tabs.entries()) {
        const active = i === index;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        if (active && focus) tab.focus();
      }
      for (const [i, panel] of panels.entries()) {
        panel.hidden = i !== index;
      }
    };

    for (const [index, tab] of tabs.entries()) {
      tab.tabIndex = index === 0 ? 0 : -1;
      tab.addEventListener('click', () => selectTab(index));
      tab.addEventListener('keydown', (event) => {
        const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
        if (step === undefined) return;
        event.preventDefault();
        selectTab((index + step + tabs.length) % tabs.length, true);
      });
    }
  }
}

defineElement('o-tabs', OlympiaTabs);
