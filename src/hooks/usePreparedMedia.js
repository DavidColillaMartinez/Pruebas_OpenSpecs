import { useEffect, useState } from 'react';
import { isNarrativeViewport } from '../data/copy';

// SSR and the first hydration render omit distant URLs. Once prepared, retain
// the source across chapter changes, backwards navigation and viewport changes.
export function usePreparedMedia(ref, narrative, prepare) {
  const [prepared, setPrepared] = useState(false);
  useEffect(() => {
    if (prepared) return;
    if (narrative) {
      if (prepare) setPrepared(true);
      return;
    }
    // useSyncExternalStore initially hydrates its server (natural) snapshot.
    // Never observe overlapping narrative scenes during that interim render.
    if (isNarrativeViewport(window.innerWidth, window.innerHeight)) return;
    const target = ref.current;
    if (!target) return;
    const main = target.closest('main');
    const root = main && /(auto|scroll)/.test(getComputedStyle(main).overflowY) ? main : null;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setPrepared(true);
        observer.disconnect();
      }
    }, { root, rootMargin: '800px 0px', threshold: 0 });
    observer.observe(target);
    return () => observer.disconnect();
  }, [prepared, narrative, prepare, ref]);
  return prepared;
}
