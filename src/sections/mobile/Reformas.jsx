import { useRef, useState, useEffect } from 'react';
import { MobileSectionShell } from '../../components/MobileSectionShell';
import { PHONE_INTL } from '../../data/business';

const facts = ['Baño principal, Madrid.', 'Mampara fija a medida, plato mineral enrasado y grifería mural.', 'El vidrio libera luz, el plato continuo reduce cortes visuales.', 'Satisfacción del cliente: 9.6 / 10.'];

export function MobileReformas({ reducedMotion }) {
  const videoRef = useRef(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => {
      if (!v.duration) return;
      setProgress(Math.min(v.currentTime / v.duration, 1));
    };
    const onEnded = () => setProgress(1);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('ended', onEnded);
    return () => { v.removeEventListener('timeupdate', onTime); v.removeEventListener('ended', onEnded); };
  }, []);

  return (
    <MobileSectionShell id="reformas" label="Proyecto real" titleId="mobile-reformas-title" ariaLabel="Reformas" className="py-16 sm:py-20">
      <h2 id="mobile-reformas-title" className="font-display text-4xl leading-[1.02] tracking-[0.035em] text-ink sm:text-5xl text-wrap-balance">Reforma en 21 días.</h2>
      <p className="mt-4 text-base leading-7 text-ink/72 sm:text-lg sm:leading-8">Cuatro decisiones medidas para que la obra avance sin rectificar.</p>
      <div className="mt-8 overflow-hidden rounded-[1.4rem] border border-ink/8 bg-white">
        <video ref={videoRef} src="/reforma-bano.mp4" controls muted playsInline preload="metadata" className="aspect-[4/3] w-full object-cover" aria-label="Video stopmotion de reforma de baño completo" />
      </div>
      <div className="mt-3 h-1.5 w-full rounded-full bg-ink/8" role="progressbar" aria-label="Avance de obra" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-clay transition-[width] duration-200 ease-linear" style={{ width: `${progress * 100}%` }} />
      </div>
      <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-ink/40">{progress >= 1 ? 'Proyecto completo' : `Avance de obra ${Math.round(progress * 100)}%`}</p>
      <ol className="mt-8 space-y-4 border-l-2 border-clay/30 pl-5 text-base leading-7 text-ink/75 sm:text-lg">
        {facts.map((text, index) => (
          <li key={text} className="flex items-start gap-3">
            <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-clay/12 text-xs font-semibold text-clay">{index + 1}</span>
            <span>{text}</span>
          </li>
        ))}
      </ol>
      <a href={`https://wa.me/${PHONE_INTL}?text=${encodeURIComponent('Hola AREA LRMQ, quiero información sobre una reforma.')}`} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-full bg-ink px-7 py-3 text-sm font-semibold text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2">Pedir asesoría</a>
      {reducedMotion && <span className="sr-only">El video se reproduce bajo demanda porque el usuario ha pedido reducir movimiento.</span>}
    </MobileSectionShell>
  );
}
