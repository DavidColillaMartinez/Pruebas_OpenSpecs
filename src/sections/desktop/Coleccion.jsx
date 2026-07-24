import { categories } from '../../data/categories';

export function Coleccion({ step, isActive }) {
  const s = isActive ? step : 0;
  const featured = categories[0];
  const tray = categories[1];
  const taps = categories[2];
  const accessories = categories[3];
  const revealTail = s >= 5;

  return (
    <div className="flex h-full items-center bg-transparent px-6 py-24 md:pb-10 md:pt-36">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-10 text-center">
          <h2 className="font-display text-5xl leading-[0.96] tracking-[0.035em] text-ink sm:text-6xl text-wrap-balance">Cuatro decisiones, una lectura.</h2>
          <p className={`mx-auto mt-5 max-w-2xl text-lg leading-8 text-ink/74 transition-all duration-500 ease-out ${s >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>La tienda no separa piezas por catálogo. Ordena vidrio, superficie, metal y detalle para que el baño tenga una sola dirección visual.</p>
        </div>
        <div className="grid gap-10 lg:grid-cols-[1fr_0.76fr]">
          <div className={`transition-all duration-500 ease-out ${s >= 2 ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-8 blur-[2px]'}`}>
            <img src={featured.image} alt={featured.imageAlt} className="aspect-[16/10] w-full rounded-[1.8rem] object-cover" loading="lazy" />
            <div className={`mt-6 transition-all duration-500 ease-out ${s >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <p className="mb-2 border-l-2 border-clay/35 pl-4 text-sm font-semibold text-clay">{featured.label}</p>
              <h3 className="font-display text-4xl leading-none tracking-[0.035em] text-ink">{featured.title}</h3>
              <p className="mt-4 max-w-xl text-base leading-7 text-ink/72">{featured.copy}</p>
            </div>
          </div>
          <div className="space-y-8 self-end">
            <div className={`border-l-2 border-clay/25 pl-4 transition-all duration-500 ease-out ${s >= 4 ? 'opacity-100 translate-x-0 blur-0' : 'opacity-0 translate-x-8 blur-[1px]'}`}>
              <p className="text-sm font-semibold text-clay">{tray.label}</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink">{tray.title}</h3>
              <p className="mt-3 text-base leading-7 text-ink/68">{tray.copy}</p>
            </div>
            <div
              style={{ transitionDelay: revealTail ? '0ms' : '0ms' }}
              className={`border-l-2 border-clay/25 pl-4 transition-all duration-500 ease-out ${revealTail ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-8 blur-[1px]'}`}
            >
              <p className="text-sm font-semibold text-clay">{taps.label}</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink">{taps.title}</h3>
              <p className="mt-3 text-base leading-7 text-ink/68">{taps.copy}</p>
            </div>
            <div
              style={{ transitionDelay: revealTail ? '150ms' : '0ms' }}
              className={`border-l-2 border-clay/25 pl-4 transition-all duration-500 ease-out ${revealTail ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-8 blur-[1px]'}`}
            >
              <p className="text-sm font-semibold text-clay">{accessories.label}</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink">{accessories.title}</h3>
              <p className="mt-3 text-base leading-7 text-ink/68">{accessories.copy}</p>
            </div>
            <aside
              style={{ transitionDelay: revealTail ? '300ms' : '0ms' }}
              className={`border-l-2 border-clay/20 pl-4 transition-all duration-500 ease-out ${revealTail ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-7 blur-[1px]'}`}
            >
              <p className="text-base leading-7 text-ink/68">El criterio es sencillo: si una pieza pide protagonismo, las demás bajan el volumen. Por eso el conjunto se decide antes que el objeto.</p>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
