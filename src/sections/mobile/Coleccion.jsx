import { categories } from '../../data/categories';
import { MobileSectionShell } from '../../components/MobileSectionShell';

export function MobileColeccion() {
  const featured = categories[0];
  const tray = categories[1];
  const taps = categories[2];
  return (
    <MobileSectionShell id="coleccion" titleId="mobile-coleccion-title" ariaLabel="Colección" className="py-14 sm:py-16">
      <h2 id="mobile-coleccion-title" className="font-display text-4xl leading-[1.02] tracking-[0.035em] text-ink sm:text-5xl text-wrap-balance">Tres decisiones, una lectura.</h2>
      <p className="mt-4 text-base leading-7 text-ink/72 sm:text-lg sm:leading-8">La tienda ordena vidrio, superficie y metal para que el baño tenga una sola dirección visual.</p>
      <div className="mt-10 overflow-hidden border-l-2 border-clay/35 pl-5">
        <img src={featured.image} alt={featured.imageAlt} className="aspect-[16/10] w-full rounded-[1.4rem] object-cover" loading="lazy" />
        <p className="mt-6 text-sm font-semibold text-clay">{featured.label}</p>
        <h3 className="mt-2 font-display text-3xl leading-none tracking-[0.035em] text-ink sm:text-4xl">{featured.title}</h3>
        <p className="mt-3 text-base leading-7 text-ink/72">{featured.copy}</p>
      </div>
      <div className="mt-10 space-y-7">
        <div className="border-l-2 border-clay/25 pl-5">
          <p className="text-sm font-semibold text-clay">{tray.label}</p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-ink sm:text-2xl">{tray.title}</h3>
          <p className="mt-2 text-base leading-7 text-ink/72">{tray.copy}</p>
        </div>
        <div className="border-l-2 border-clay/25 pl-5">
          <p className="text-sm font-semibold text-clay">{taps.label}</p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-ink sm:text-2xl">{taps.title}</h3>
          <p className="mt-2 text-base leading-7 text-ink/72">{taps.copy}</p>
        </div>
      </div>
      <p className="mt-10 max-w-xl border-l-2 border-clay/15 pl-5 text-base leading-7 text-ink/65">El criterio es sencillo: si una pieza pide protagonismo, las demás bajan el volumen. Por eso el conjunto se decide antes que el objeto.</p>
    </MobileSectionShell>
  );
}
