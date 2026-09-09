import { useEffect, useState } from 'react';

const SCROLL_TOP_THRESHOLD_PX = 640;

export function useScrollTopVisibility(enabled: boolean, threshold = SCROLL_TOP_THRESHOLD_PX): boolean {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setShow(false);
      return undefined;
    }
    const check = () => setShow(window.scrollY > threshold);
    check();
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, [enabled, threshold]);

  return show;
}

export function scrollWindowToTop(): void {
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
}

export function ScrollTopButton({ show, onClick, className = '' }: { show: boolean; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      aria-label="Volver arriba"
      tabIndex={show ? 0 : -1}
      onClick={onClick}
      className={`scroll-top-safe fixed left-4 z-40 grid h-11 w-11 place-items-center rounded-full border border-ink/15 bg-white text-ink shadow-lift transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 motion-safe:hover:-translate-y-0.5 ${show ? 'pointer-events-auto opacity-100' : 'pointer-events-none translate-y-2 opacity-0'} ${className}`}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 19V5m0 0l-6 6m6-6l6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  );
}
