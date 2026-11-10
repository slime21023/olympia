/** Mobile Navigation Drawer controller following modern-web-guidance `navigation-drawer`. */
function initMobileDrawer(): void {
  const drawer = document.getElementById('o-mobile-drawer') as HTMLDialogElement | null;
  const openBtn = document.getElementById('drawer-open');
  const closeBtn = document.getElementById('drawer-close');
  const scroller = drawer?.querySelector<HTMLElement>('.o-drawer__scroller');
  const sheet = drawer?.querySelector<HTMLElement>('.o-drawer__sheet');

  if (!drawer || !openBtn || !closeBtn || !scroller || !sheet) return;

  const openDrawer = async () => {
    drawer.showModal();
    if (!CSS.supports('scroll-initial-target', 'nearest')) {
      scroller.scrollTo({ left: scroller.offsetWidth, behavior: 'instant' as ScrollBehavior });
      const { promise, resolve } = Promise.withResolvers<void>();
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      await promise;
    }
    scroller.scrollTo({ left: 0, behavior: 'auto' });
  };

  const closeDrawer = () => {
    scroller.scrollTo({ left: scroller.offsetWidth, behavior: 'auto' });
  };

  const visibleThreshold = 1 / Math.max(window.innerWidth, 320);
  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries.at(-1);
      if (!entry) return;
      if (entry.intersectionRatio < visibleThreshold && drawer.open) {
        drawer.close();
        openBtn.setAttribute('aria-expanded', 'false');
      }
      if (entry.intersectionRatio === 1) {
        openBtn.setAttribute('aria-expanded', 'true');
      }
    },
    { root: drawer, threshold: [visibleThreshold, 1] }
  );
  observer.observe(sheet);

  if (!CSS.supports('animation-timeline: scroll()')) {
    scroller.addEventListener('scroll', () => {
      const ratio = 1 - scroller.scrollLeft / Math.max(sheet.offsetWidth, 1);
      drawer.style.setProperty('--drawer-backdrop', String(Math.max(0, Math.min(1, ratio))));
    });
  }

  openBtn.addEventListener('click', () => void openDrawer());
  closeBtn.addEventListener('click', closeDrawer);

  drawer.addEventListener('click', (event) => {
    if (!sheet.contains(event.target as Node)) closeDrawer();
  });

  drawer.addEventListener('cancel', (event) => {
    if (event.cancelable) {
      event.preventDefault();
      closeDrawer();
    }
  });
}

initMobileDrawer();
