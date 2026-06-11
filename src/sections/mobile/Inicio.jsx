import { LogoMark } from '../../components/LogoMark';
import { PHONE_INTL } from '../../data/business';

export function MobileInicio({ cardless }) {
  if (!cardless) {
    return (
      <section id="inicio" aria-label="Inicio" className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden">
        <img src="https://images.unsplash.com/photo-1763485956293-873ea83bf095?auto=format&fit=crop&w=1200&q=80" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/40 to-ink/78" />
        <div className="relative z-10 mx-auto max-w-lg px-6 pt-20 pb-28 text-center">
          <LogoMark className="mx-auto mb-6 h-20 w-20 opacity-90" />
          <h1 className="font-display text-4xl leading-[0.9] tracking-[0.045em] text-white sm:text-5xl text-wrap-balance">AREA LRMQ</h1>
          <p className="mt-3 text-xl font-semibold tracking-[0.14em] text-clay uppercase">DESIGN S.L.</p>
        </div>
      </section>
    );
  }
  return (
    <section id="inicio" aria-labelledby="mobile-inicio-title" className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-white px-6 pt-24 pb-16 sm:pt-32">
      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center text-center">
        <LogoMark className="mb-8 h-28 w-28 sm:h-32 sm:w-32" minimal />
        <h1 id="mobile-inicio-title" className="font-display text-5xl leading-[0.92] tracking-[0.045em] text-ink sm:text-6xl text-wrap-balance">AREA LRMQ</h1>
        <p className="mt-3 text-base font-semibold tracking-[0.18em] text-clay uppercase sm:text-lg">DESIGN S.L.</p>
        <p className="mt-6 max-w-md text-base leading-7 text-ink/72 sm:text-lg sm:leading-8">Baños, materiales y decisiones visuales con medida. Mamparas a medida, platos minerales, grifería premium y accesorios.</p>
        <a href={`https://wa.me/${PHONE_INTL}?text=${encodeURIComponent('Hola AREA LRMQ, quiero pedir asesoría para mi baño.')}`} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-full bg-ink px-7 py-3 text-sm font-semibold text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2">Pedir asesoría</a>
      </div>
    </section>
  );
}
