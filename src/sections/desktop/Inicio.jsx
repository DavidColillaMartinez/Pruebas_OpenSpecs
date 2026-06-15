import { AnimatedLogoMark } from '../../components/AnimatedLogoMark';
import { methodSteps } from '../../data/methodSteps';

export function Inicio({ step, isActive, cardless }) {
  const s = isActive ? step : 0;
  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden">
      <img src="https://images.unsplash.com/photo-1763485956293-873ea83bf095?auto=format&fit=crop&w=2200&q=90" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" loading="eager" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/48 via-ink/34 to-ink/72" />
       <AnimatedLogoMark mode={cardless ? 'minimal' : 'cards'} className="absolute left-1/2 top-[15%] z-10 h-[13.5rem] w-[13.5rem] -translate-x-1/2 opacity-90" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 text-center sm:px-6">
        <p className="mb-3 inline-block text-sm font-semibold uppercase tracking-[0.34em] text-clay"><span className="inline-block rounded-lg bg-ink/20 px-3 py-1.5 backdrop-blur-sm">Tienda</span></p>
        <h1 className="font-display text-5xl leading-[0.9] tracking-[0.045em] text-white sm:text-7xl lg:text-8xl text-wrap-balance">AREA LRMQ</h1>
        <p className="mt-4 text-3xl font-semibold tracking-[0.16em] text-clay uppercase">DESIGN S.L.</p>
      </div>
      <div className={`absolute bottom-6 left-1/2 z-10 -translate-x-1/2 transition-opacity duration-500 ${s >= 1 ? 'opacity-0' : 'opacity-100'}`}>
        <span className="block h-8 w-px bg-white/35 mx-auto" />
        <span className="mt-2 block text-xs tracking-[0.2em] text-white/45 uppercase">Gira para avanzar</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-32 sm:px-6">
        <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-3">
          {methodSteps.map((item, index) => (
            cardless ? (
              <article key={item.title} className={`border-l-2 border-clay/40 pl-5 text-left transition-all duration-500 ease-out ${s > index ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-14 blur-[2px]'}`}>
                <span className="font-display text-3xl text-clay">{index + 1}</span>
                <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{item.copy}</p>
              </article>
            ) : (
              <article key={item.title} className={`rounded-[1.6rem] border border-white/14 bg-ink/30 p-5 text-left shadow-lift backdrop-blur-sm transition-all duration-500 ease-out ${s > index ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-14 blur-[2px]'}`}>
                <span className="font-display text-3xl text-clay">{index + 1}</span>
                <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{item.copy}</p>
              </article>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
