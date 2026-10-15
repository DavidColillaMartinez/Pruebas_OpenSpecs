import { LogoMark } from '../../components/LogoMark';
import { PHONE_INTL } from '../../data/business';
import { LRMQ_PHOTOS } from '../../config/mediaAssets';

// First chapter inherits the approved dark kitchen photo (vertical crop),
// mirroring the desktop hero. Light chip keeps the dark glyph legible on
// top of the photo in both themes.
export function MobileInicio() {
  return (
    <section id="inicio" aria-labelledby="mobile-inicio-title" className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-ink px-6 pt-24 pb-16 sm:pt-32">
      <img
        src={LRMQ_PHOTOS.inicioCocina.mobile.src}
        srcSet={LRMQ_PHOTOS.inicioCocina.mobile.srcSet}
        sizes={LRMQ_PHOTOS.inicioCocina.mobile.sizes}
        alt="" aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager" fetchPriority="high" decoding="async"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-ink/40 to-ink/70" aria-hidden="true" />
      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center text-center">
        <span className="lrmq-photo-mark mb-8 grid place-items-center"><LogoMark className="h-24 w-24 sm:h-28 sm:w-28" minimal /></span>
        <h1 id="mobile-inicio-title" className="font-display text-5xl leading-[0.92] tracking-[0.045em] text-white sm:text-6xl text-wrap-balance">AREA LRMQ</h1>
        <p className="mt-3 text-base font-semibold tracking-[0.18em] text-clay uppercase sm:text-lg">DESIGN S.L.</p>
        <p className="mt-6 max-w-md text-base leading-7 font-medium text-white/90 sm:text-lg sm:leading-8">Reformas integrales, arquitectura y soluciones para tu espacio. Coordinamos los oficios de tu reforma y te asesoramos en nuestra tienda de exposición.</p>
        <a href={`https://wa.me/${PHONE_INTL}?text=${encodeURIComponent('Hola AREA LRMQ, quiero pedir asesoría para mi proyecto.')}`} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-ink shadow-lift transition hover:-translate-y-0.5 hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2">Pedir asesoría</a>
      </div>
    </section>
  );
}
