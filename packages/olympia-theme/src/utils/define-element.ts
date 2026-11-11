/** Registers a custom element once; repeated bundle evaluation is a no-op. */
export function defineElement(name: string, ctor: CustomElementConstructor): void {
  if (!customElements.get(name)) {
    customElements.define(name, ctor);
  }
}
