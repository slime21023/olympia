export type CalloutVariant = 'note' | 'tip' | 'important' | 'warning' | 'caution';

export const CALLOUT_ICONS: Record<CalloutVariant, string> = {
  note: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><circle cx="10" cy="10" r="8"/><path stroke-linecap="round" d="M10 9v5M10 6.5h.01"/></svg>`,
  tip: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M10 2.5a5.5 5.5 0 0 0-3.5 9.74V14a1.5 1.5 0 0 0 1.5 1.5h4A1.5 1.5 0 0 0 13.5 14v-1.76A5.5 5.5 0 0 0 10 2.5ZM8 17.5h4"/></svg>`,
  important: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M10 3v8m0 4h.01M4.5 17h11a1.5 1.5 0 0 0 1.3-2.25l-5.5-9.5a1.5 1.5 0 0 0-2.6 0l-5.5 9.5A1.5 1.5 0 0 0 4.5 17Z"/></svg>`,
  warning: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6.5v4.5m0 3h.01M3.34 16h13.32c1.15 0 1.87-1.25 1.3-2.25L11.3 2.25c-.58-1-2.02-1-2.6 0L2.04 13.75C1.47 14.75 2.19 16 3.34 16Z"/></svg>`,
  caution: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 2.5 7 9.5h5l-1 8 6-8h-5l0-7Z"/></svg>`,
};

/** Returns the icon for an admonition name, falling back to the `note` icon for unknown names. */
export function getCalloutIcon(name: string): string {
  return Object.hasOwn(CALLOUT_ICONS, name)
    ? CALLOUT_ICONS[name as CalloutVariant]
    : CALLOUT_ICONS.note;
}

export const COPY_ICON = `<svg class="o-copy-btn__icon o-copy-btn__icon--copy" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                  <rect x="5.5" y="5.5" width="8" height="8" rx="1.5"/>
                  <path stroke-linecap="round" d="M10.5 5.5V3.5a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2"/>
                </svg>`;

export const CHECK_ICON = `<svg class="o-copy-btn__icon o-copy-btn__icon--check" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m3.5 8.5 3 3 6-6.5"/>
                </svg>`;

export const CHECKBOX_ICON = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="2.5" y="2.5" width="11" height="11" rx="2"/></svg>`;

export const CHECKBOX_CHECKED_ICON = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="2.5" y="2.5" width="11" height="11" rx="2"/><path stroke-linecap="round" stroke-linejoin="round" d="m5.5 8.2 1.8 1.8 3.4-3.6"/></svg>`;

export const MENU_CARET_ICON = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m6 4 4 4-4 4"/></svg>`;
