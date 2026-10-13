import { useEffect, useState } from 'react';

// CSS owns every coordinate. Bounded dialog/scene/height checks preserve
// visibility and focus; no scroll/focus listeners or coordinate writes.
export function useFloatingSurface() {
  const [blocked, setBlocked] = useState(false);
  const [welcomeBlocked, setWelcomeBlocked] = useState(false);
  useEffect(() => {
    let previousMain: HTMLElement | null = null;
    let previousHeight = 0;
    const check = () => {
      const dialogs = [...document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]')];
      setBlocked(dialogs.some(dialog => !dialog.classList.contains('assistant-panel-in') && dialog.getClientRects().length > 0 && getComputedStyle(dialog).visibility !== 'hidden'));
      // Narrow layouts reserve a welcome row. Desktop retains its position:
      // the single approved Inicio card slot can temporarily own that space.
      // This bounded visibility check never scans document text or runs on scroll.
      let hideWelcome = window.innerWidth >= 1024 && document.documentElement.getAttribute('data-lrmq-context') !== 'photo';
      if (window.innerWidth >= 1024 && !hideWelcome) {
        const card = document.querySelector<HTMLElement>('[data-chapter="inicio"] article:last-child');
        const welcome = document.querySelector<HTMLElement>('.assistant-welcome');
        if (card && welcome && (card.classList.contains('opacity-100') || Number(getComputedStyle(card).opacity) > .05)) {
          const a = card.getBoundingClientRect();
          const transform = getComputedStyle(card).transform;
          const deck = card.closest('[data-chapter]')?.parentElement;
          const deckTransform = deck ? getComputedStyle(deck).transform : '';
          const translateY = (value: string) => value && value !== 'none' && typeof DOMMatrix !== 'undefined' ? new DOMMatrix(value).m42 : 0;
          const shift = translateY(transform) + translateY(deckTransform);
          const style = getComputedStyle(welcome);
          const x = document.documentElement.clientWidth - parseFloat(style.right) - welcome.offsetWidth;
          const y = innerHeight - parseFloat(style.bottom) - welcome.offsetHeight;
          hideWelcome = a.right > x && a.left < x + welcome.offsetWidth && a.bottom - shift > y && a.top - shift < y + welcome.offsetHeight;
        }
      }
      setWelcomeBlocked(hideWelcome);
      // A welcome row or viewport-height change can reduce the scrollport.
      // Keep the focused field reachable without moving any tool coordinate.
      const main = document.querySelector<HTMLElement>('main');
      const height = main?.clientHeight ?? 0;
      const areaChanged = main !== previousMain || height !== previousHeight;
      previousMain = main;
      previousHeight = height;
      if (areaChanged && !dialogs.length && window.innerWidth < 1024 && document.activeElement instanceof HTMLElement && document.activeElement.closest('main')) {
        const field = document.activeElement.getBoundingClientRect();
        const port = document.activeElement.closest('main')!.getBoundingClientRect();
        if (field.top < port.top || field.bottom > port.bottom) document.activeElement.scrollIntoView({ block: 'center', behavior: 'instant' });
      }
    };
    const clearLegacyCoordinates = () => {
      for (const control of document.querySelectorAll<HTMLElement>('.assistant-launcher-ring, .scroll-top-safe, [aria-controls="catalog-selection-drawer"], .lrmq-filters-float')) {
        for (const property of ['top', 'bottom', 'left', 'right']) control.style.removeProperty(property);
      }
      check();
    };
    const observer = new MutationObserver(check);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'inert', 'aria-modal'] });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-lrmq-context'] });
    window.addEventListener('resize', clearLegacyCoordinates, { passive: true });
    document.fonts?.addEventListener('loadingdone', check);
    clearLegacyCoordinates();
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', clearLegacyCoordinates);
      document.fonts?.removeEventListener('loadingdone', check);
    };
  }, []);
  return { blocked, welcomeBlocked };
}
