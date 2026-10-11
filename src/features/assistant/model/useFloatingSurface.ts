import { useEffect, useState } from 'react';

// External dialogs own interaction while open. On narrow layouts floating
// controls choose free edge space instead of narrowing the entire page.
function placeMobileControls() {
  const controls = [...document.querySelectorAll<HTMLElement>('.assistant-launcher-ring, .scroll-top-safe:not(.opacity-0), button[aria-controls="catalog-selection-drawer"], .lrmq-filters-float')];
  const previous = new Map(controls.filter(control=>control.style.top).map(control=>[control,control.getBoundingClientRect()]));
  for (const control of controls) {
    control.style.removeProperty('top');
    control.style.removeProperty('bottom');
    control.style.removeProperty('left');
    control.style.removeProperty('right');
  }
  if (window.innerWidth >= 1024 || document.querySelector('[role="dialog"][aria-modal="true"]')) return;
  const visible = (element: HTMLElement) => {
    const r = element.getBoundingClientRect();
    if (!r.width || !r.height || r.bottom <= 0 || r.top >= innerHeight || element.closest('[hidden],[inert]')) return false;
    for (let parent: HTMLElement | null = element; parent; parent = parent.parentElement) {
      const style = getComputedStyle(parent);
      if (style.visibility === 'hidden' || Number(style.opacity) < .05) return false;
    }
    return true;
  };
  const obstacles: DOMRect[] = [];
  for (const element of document.querySelectorAll<HTMLElement>('main h1, main h2, main h3, main p, main blockquote, main input, main textarea, main select, main label, main button, main a')) {
    if (!visible(element) || controls.includes(element) || element.closest('.sr-only') || element.matches('[aria-hidden="true"]')) continue;
    // Gallery/image click surfaces intentionally surround media; their arrows
    // and interaction points remain separate controls in this list.
    if (element.matches('button,a') && element.querySelector('img')) continue;
    if (element.matches('h1,h2,h3,p,blockquote,label')) {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        if (!walker.currentNode.textContent?.trim()) continue;
        const range = document.createRange(); range.selectNodeContents(walker.currentNode);
        for (const rect of range.getClientRects()) {
          let left = rect.left, right = rect.right, top = rect.top, bottom = rect.bottom;
          for (let parent = element.parentElement; parent; parent = parent.parentElement) {
            const style = getComputedStyle(parent), box = parent.getBoundingClientRect();
            if (/(auto|scroll|hidden|clip)/.test(style.overflowX)) { left = Math.max(left, box.left); right = Math.min(right, box.right); }
            if (/(auto|scroll|hidden|clip)/.test(style.overflowY)) { top = Math.max(top, box.top); bottom = Math.min(bottom, box.bottom); }
          }
          if (right > left && bottom > top) obstacles.push(new DOMRect(left, top, right-left, bottom-top));
        }
      }
    } else obstacles.push(element.getBoundingClientRect());
  }
  const header = document.querySelector<HTMLElement>('#contenido > header');
  if (header) obstacles.push(header.getBoundingClientRect());
  const welcome = document.querySelector<HTMLElement>('.assistant-welcome');
  if (welcome && visible(welcome)) obstacles.push(welcome.getBoundingClientRect());
  const intersects = (a: DOMRect, b: DOMRect) => Math.min(a.right,b.right)-Math.max(a.left,b.left)>1 && Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1;
  // The scroll-top control may be fading in when its class changes; place it
  // before the fade finishes rather than discarding it for transient opacity.
  for (const control of controls.filter(element => element.getClientRects().length > 0 && !element.closest('[inert]') && getComputedStyle(element).visibility !== 'hidden')) {
    const original = control.getBoundingClientRect();
    const retained = previous.get(control);
    const candidates = retained && retained.x>=0 && retained.right<=innerWidth && retained.y>=12 && retained.bottom<=innerHeight-12 ? [retained, original] : [original];
    const xs = [original.x, Math.max(16, innerWidth-original.width-16), 16];
    for (let distance=8;distance<innerHeight;distance+=8) {
      for (const y of [original.y-distance, original.y+distance]) for (const x of xs) {
        if (y>=12 && y+original.height<=innerHeight-12) candidates.push(new DOMRect(x,y,original.width,original.height));
      }
    }
    const free = candidates.find(candidate=>obstacles.every(obstacle=>!intersects(candidate,obstacle)));
    if (free) {
      if (free !== original) {
        control.style.top = `${free.y}px`; control.style.bottom = 'auto';
        control.style.left = `${free.x}px`; control.style.right = 'auto';
      }
      obstacles.push(free);
    } else obstacles.push(original);
  }
}

export function useFloatingSurface() {
  const [blocked, setBlocked] = useState(false);
  const [welcomeBlocked, setWelcomeBlocked] = useState(false);
  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      const dialogs = [...document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]')];
      setBlocked(dialogs.some(dialog => !dialog.classList.contains('assistant-panel-in') && dialog.getClientRects().length > 0 && getComputedStyle(dialog).visibility !== 'hidden'));
      placeMobileControls();
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
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'inert', 'aria-modal'] });
    window.addEventListener('scroll', schedule, { passive: true, capture: true });
    window.addEventListener('resize', schedule, { passive: true });
    document.addEventListener('focusin', schedule);
    document.fonts?.addEventListener('loadingdone', schedule);
    check();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('focusin', schedule);
      document.fonts?.removeEventListener('loadingdone', schedule);
    };
  }, []);
  return { blocked, welcomeBlocked };
}
