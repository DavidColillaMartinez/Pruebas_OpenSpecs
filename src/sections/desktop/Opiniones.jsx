import { useEffect, useState } from 'react';
import { googleReviews } from '../../data/reviewsContent';

const AUTOPLAY_MS = 4000;
const GLIDE_MS = 700;
const MECHANICAL_EASE = 'cubic-bezier(0.75, 0, 0.18, 1)';

const cardTransform = (offset) => {
  if (offset === 0) return { transform: 'translate(-50%, -50%) scale(1)', zIndex: 20, opacity: 1, blurred: false };
  if (offset === -1) return { transform: 'translate(-50%, -50%) translateX(-52%) translateY(-10%) scale(0.84)', zIndex: 10, opacity: 0.55, blurred: true };
  if (offset === 1) return { transform: 'translate(-50%, -50%) translateX(52%) translateY(10%) scale(0.84)', zIndex: 10, opacity: 0.55, blurred: true };
  if (offset < 0) return { transform: 'translate(-50%, -50%) translateX(-108%) translateY(-18%) scale(0.7)', zIndex: 0, opacity: 0, blurred: true };
  return { transform: 'translate(-50%, -50%) translateX(108%) translateY(18%) scale(0.7)', zIndex: 0, opacity: 0, blurred: true };
};

function StarRow({ rating }) {
  return (
    <span role="img" aria-label={`${rating} de 5 estrellas`} className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((value) => (
        <svg key={value} viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4" fill={value <= rating ? '#c1aa67' : 'none'} stroke={value <= rating ? '#c1aa67' : 'rgba(5,5,5,0.25)'} strokeWidth="1.5">
          <path d="M10 1.8l2.4 5 5.5.7-4 3.8 1 5.4-4.9-2.7-4.9 2.7 1-5.4-4-3.8 5.5-.7z" strokeLinejoin="round" />
        </svg>
      ))}
    </span>
  );
}

export function Opiniones({ step, isActive }) {
  const s = isActive ? step : 0;
  const total = googleReviews.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (index >= total) setIndex(0);
  }, [index, total]);

  useEffect(() => {
    if (!total || total < 3 || paused || !isActive || s < 1) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setTimeout(() => setIndex((current) => (current + 1) % total), AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [index, total, paused, isActive, s]);

  const offsetFrom = (reviewIndex) => {
    const raw = (reviewIndex - index + total) % total;
    return raw > Math.floor(total / 2) ? raw - total : raw;
  };

  return (
    <div className="flex h-full items-center justify-center bg-transparent px-6 py-24 md:pb-8 md:pt-32">
      <div className="mx-auto w-full max-w-3xl text-center">
        <div className={s >= 1 ? 'opacity-100 transition-all duration-500 ease-out translate-y-0 blur-0' : 'opacity-0 translate-y-6 blur-[1px] transition-all duration-500 ease-out'}>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-clay">Opiniones</p>
          <h2 className="mt-4 font-display text-5xl leading-[0.96] tracking-[0.035em] text-ink sm:text-6xl text-wrap-balance">Juzga tú mismo.</h2>
        </div>
        {total === 0 ? (
          <p className={`mt-10 text-base leading-7 text-ink/68 transition-all duration-500 ease-out ${s >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>Pronto mostraremos aquí las reseñas verificadas de Google.</p>
        ) : (
          <div
            role="region"
            aria-roledescription="carrusel"
            aria-label="Reseñas de Google"
            className={`mt-10 transition-all duration-500 ease-out ${s >= 1 ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-8 blur-[2px]'}`}
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
          >
            <div className="relative h-[clamp(23rem,45svh,30rem)] w-full overflow-hidden">
              {googleReviews.map((review, reviewIndex) => {
                const offset = offsetFrom(reviewIndex);
                const state = cardTransform(offset);
                const active = offset === 0;
                return (
                  <figure
                    key={`${review.author}-${reviewIndex}`}
                    aria-hidden={!active}
                    inert={!active}
                    style={{ transform: state.transform, zIndex: state.zIndex, opacity: state.opacity, filter: state.blurred ? 'blur(5px)' : 'none', transition: `transform ${GLIDE_MS}ms ${MECHANICAL_EASE}, opacity ${GLIDE_MS}ms ${MECHANICAL_EASE}, filter ${GLIDE_MS}ms ${MECHANICAL_EASE}` }}
                    className="absolute left-1/2 top-1/2 flex h-full w-[clamp(20rem,34vw,24rem)] flex-col items-center justify-center overflow-hidden rounded-[1.8rem] border border-ink/8 bg-white/85 p-8 text-center shadow-soft will-change-transform"
                  >
                    <span aria-hidden="true" className={`pointer-events-none absolute inset-0 rounded-[inherit] bg-white/55 transition-opacity ${GLIDE_MS}ms ${MECHANICAL_EASE} ${active ? 'opacity-0' : 'opacity-100'}`} />
                    <StarRow rating={review.rating} />
                    {review.text ? (
                      <blockquote className="mt-5 max-h-64 overflow-y-auto text-base leading-7 text-ink/78">«{review.text}»</blockquote>
                    ) : (
                      <p className="mt-5 text-base leading-7 text-ink/45">Reseña sin comentario de texto.</p>
                    )}
                    <figcaption className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
                      {review.image ? <img src={review.image} alt="" aria-hidden="true" loading="lazy" className="h-9 w-9 rounded-full border border-ink/10 object-cover" /> : null}
                      <span className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/55">{review.author}</span>
                      {review.date ? <span className="text-xs uppercase tracking-[0.14em] text-ink/40">{review.date}</span> : null}
                    </figcaption>
                    <a href={review.googleUrl} target="_blank" rel="noopener noreferrer" tabIndex={active ? undefined : -1} className="mt-3 inline-block text-xs font-semibold uppercase tracking-[0.16em] text-clay underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2">Ver en Google</a>
                  </figure>
                );
              })}
            </div>
            <div className={`mt-6 flex items-center justify-center gap-4 transition-all duration-500 ease-out ${s >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <button type="button" onClick={() => setIndex((current) => (current - 1 + total) % total)} aria-label="Reseña anterior" className="grid h-11 w-11 place-items-center rounded-full border border-ink/12 text-ink/60 transition hover:border-ink/30 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2">
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 3L5 8l5 5" /></svg>
              </button>
              <div className="flex items-center gap-2" aria-label="Seleccionar reseña">
                {googleReviews.map((review, dotIndex) => (
                  <button key={`${review.author}-dot-${dotIndex}`} type="button" onClick={() => setIndex(dotIndex)} aria-label={`Ver reseña ${dotIndex + 1}`} aria-current={dotIndex === index ? 'true' : undefined} className={`h-2.5 w-2.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 ${dotIndex === index ? 'scale-125 bg-ink' : 'bg-ink/20 hover:bg-ink/40'}`} />
                ))}
              </div>
              <button type="button" onClick={() => setIndex((current) => (current + 1) % total)} aria-label="Reseña siguiente" className="grid h-11 w-11 place-items-center rounded-full border border-ink/12 text-ink/60 transition hover:border-ink/30 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2">
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 3l5 5-5 5" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
