import { useEffect, useState } from 'react';

// External dialogs own interaction while open. The optional welcome surface can
// yield to underlying content; the launcher remains in its reserved end gutter.
export function useFloatingSurface() {
  const [blocked, setBlocked] = useState(false);
  const [welcomeBlocked, setWelcomeBlocked] = useState(false);
  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      const dialogs = [...document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]')];
      setBlocked(dialogs.some(dialog => !dialog.classList.contains('assistant-panel-in') && dialog.getClientRects().length > 0 && getComputedStyle(dialog).visibility !== 'hidden'));
      const welcome = document.querySelector<HTMLElement>('.assistant-welcome');
      if (!welcome) { setWelcomeBlocked(false); return; }
      const bubble = welcome.getBoundingClientRect();
      const intersects = (rect: DOMRect) => rect.right > bubble.left && rect.left < bubble.right && rect.bottom > bubble.top && rect.top < bubble.bottom;
      setWelcomeBlocked([...document.querySelectorAll<HTMLElement>('main input, main textarea, main select, main button, main a, main h1, main h2, main h3, main p')].some(element => {
        if (element.closest('[inert], [hidden], [aria-hidden="true"]') || !element.getClientRects().length) return false;
        for (let parent: HTMLElement | null = element; parent; parent = parent.parentElement) {
          const style = getComputedStyle(parent);
          if (style.visibility === 'hidden' || Number(style.opacity) < .05) return false;
        }
        // Don't penalize empty space around text or a whole clickable media frame.
        if (element.matches('button,a') && element.querySelector('img')) return false;
        if (element.matches('h1,h2,h3,p')) {
          const range = document.createRange();
          range.selectNodeContents(element);
          return [...range.getClientRects()].some(intersects);
        }
        return intersects(element.getBoundingClientRect());
      }));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(check); };
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'aria-modal'] });
    window.addEventListener('scroll', schedule, { passive: true, capture: true });
    window.addEventListener('resize', schedule, { passive: true });
    check();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
    };
  }, []);
  return { blocked, welcomeBlocked };
}
