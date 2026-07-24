import { useRef, useState, useEffect } from 'react';
import { MobileSectionShell } from '../../components/MobileSectionShell';

export function MobileVision({ reducedMotion }) {
  const videoRef = useRef(null);
  const sliderRef = useRef(null);
  const draggingRef = useRef(false);
  const [state, setState] = useState('idle');
  const [sliderX, setSliderX] = useState(0.5);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || state !== 'playing') return;
    const onEnded = () => { v.pause(); setState('reveal'); };
    v.addEventListener('ended', onEnded);
    return () => v.removeEventListener('ended', onEnded);
  }, [state]);

  const handlePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    setState('playing');
    v.play().catch(() => setState('idle'));
  };

  const handleReveal = () => setState('compare');

  const setFromClientX = (clientX) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    setSliderX(Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)));
  };
  const onPointerDown = (e) => { e.preventDefault(); draggingRef.current = true; setFromClientX(e.clientX); };
  useEffect(() => {
    const move = (e) => { if (draggingRef.current) setFromClientX(e.clientX); };
    const up = () => { draggingRef.current = false; };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); };
  }, []);

  return (
    <MobileSectionShell id="vision" titleId="mobile-vision-title" ariaLabel="Visión" className="py-14 sm:py-16">
      <h2 id="mobile-vision-title" className="font-display text-4xl leading-[1.02] tracking-[0.035em] text-ink sm:text-5xl text-wrap-balance">Del boceto al baño.</h2>
      <p className="mt-4 text-base leading-7 text-ink/72 sm:text-lg sm:leading-8">Antes de elegir una pieza, vemos proporción, paso de luz y continuidad.</p>
      <div
        ref={sliderRef}
        role={state === 'compare' ? 'slider' : undefined}
        tabIndex={state === 'compare' ? 0 : undefined}
        aria-label={state === 'compare' ? 'Comparar boceto con imagen final' : undefined}
        aria-valuenow={state === 'compare' ? Math.round(sliderX * 100) : undefined}
        aria-valuemin={state === 'compare' ? 0 : undefined}
        aria-valuemax={state === 'compare' ? 100 : undefined}
        onKeyDown={(e) => { if (state !== 'compare') return; if (e.key === 'ArrowRight') setSliderX((v) => Math.min(1, v + 0.05)); if (e.key === 'ArrowLeft') setSliderX((v) => Math.max(0, v - 0.05)); }}
        onPointerDown={onPointerDown}
        className="relative mt-8 aspect-[4/3] w-full select-none overflow-hidden rounded-[1.4rem] border border-ink/8 bg-surface-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/40"
        style={{ touchAction: state === 'compare' ? 'none' : 'auto' }}>
        <video ref={videoRef} src="/boceto-video.mp4" muted playsInline preload="metadata" poster="/boceto-poster.webp" className="absolute inset-0 h-full w-full object-cover" aria-label="Video de boceto dibujándose" />
        {state === 'compare' && (
          <>
            <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${sliderX * 100}%)` }}>
              <img src="/boceto-final.png" alt="Imagen final del proyecto" className="absolute inset-0 h-full w-full object-contain bg-surface-strong" draggable={false} loading="lazy" />
            </div>
            <div className="absolute inset-y-0 w-0.5 bg-clay shadow-lg pointer-events-none" style={{ left: `${sliderX * 100}%` }}>
              <div className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-clay/30 bg-surface-strong text-action-foreground shadow-lift" aria-hidden="true">
                <span className="text-[10px] font-bold tracking-[0.16em]">DRAG</span>
              </div>
            </div>
          </>
        )}
        {state === 'reveal' && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/20">
            <button type="button" onClick={handleReveal} className="min-h-[44px] rounded-full border border-clay/40 bg-surface-strong px-7 py-3 text-sm font-semibold text-action-foreground shadow-lift transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2">Revelar</button>
          </div>
        )}
        {state === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/15">
            <button type="button" onClick={handlePlay} className="min-h-[44px] rounded-full border border-clay/40 bg-surface-strong px-7 py-3 text-sm font-semibold text-action-foreground shadow-lift transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2">Reproducir boceto</button>
          </div>
        )}
      </div>
      <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.18em] text-ink/40">{state === 'compare' ? 'Arrastra para comparar' : state === 'reveal' ? 'Revela el resultado final' : 'Toca reproducir'}</p>
    </MobileSectionShell>
  );
}
