import { useState, useEffect } from 'react';
import { DESKTOP_MIN_WIDTH, isNarrativeViewport } from '../data/copy';

function getDesktopGate() {
  if (typeof window === 'undefined') return false;
  return isNarrativeViewport(window.innerWidth, window.innerHeight);
}

export function useMediaGate() {
  const [isDesktop, setIsDesktop] = useState(getDesktopGate);

  useEffect(() => {
    const onResize = () => setIsDesktop(getDesktopGate());
    window.addEventListener('resize', onResize);
    const m = window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`);
    const h = () => setIsDesktop(getDesktopGate());
    m.addEventListener('change', h);
    return () => { window.removeEventListener('resize', onResize); m.removeEventListener('change', h); };
  }, []);

  return isDesktop;
}
