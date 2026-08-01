import { Link } from 'react-router-dom';
import { QuoteSelectionLink } from '../../quote/components/QuoteSelectionLink';

const mastheadImage = 'https://images.unsplash.com/photo-1763485956293-873ea83bf095?auto=format&fit=crop&w=2200&q=90';

export function CatalogMasthead() {
  return (
    <header className="overflow-hidden rounded-[2rem] bg-ink text-white shadow-lift" aria-labelledby="catalog-heading">
      <div className="grid min-h-[25rem] lg:grid-cols-[0.82fr_1.18fr]">
        <div className="flex flex-col justify-between p-7 sm:p-10 lg:p-12">
          <div className="flex items-center gap-3">
            <Link to="/" aria-label="Volver a la página principal" className="inline-grid h-11 w-11 shrink-0 place-items-center rounded-full border border-clay/25 bg-white shadow-lift transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 focus-visible:ring-offset-ink">
              <span className="grid h-full w-full place-items-center overflow-hidden rounded-full" aria-hidden="true">
                <img src="/logo-area-lrmq.webp" alt="" className="h-full w-full scale-[1.35] object-contain" loading="eager" />
              </span>
            </Link>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/72">AREA LRMQ DESIGN S.L.</span>
            <span className="ml-auto"><QuoteSelectionLink compact tone="dark" /></span>
          </div>
          <div className="mt-12 max-w-xl lg:mt-20">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-clay">Tienda</p>
            <h1 id="catalog-heading" className="mt-4 font-display text-5xl leading-[0.92] tracking-[0.02em] sm:text-6xl">Catálogo</h1>
            <p className="mt-5 max-w-md text-base leading-7 text-white/72 sm:text-lg">Explora piezas, acabados y soluciones para construir un baño con una dirección visual clara.</p>
          </div>
          <nav aria-label="Migas de pan" className="mt-10 text-sm text-white/68">
            <Link to="/" className="underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 focus-visible:ring-offset-ink">Inicio</Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page" className="text-white">Tienda</span>
          </nav>
        </div>
        <figure className="relative min-h-64 overflow-hidden lg:min-h-full">
          <img src={mastheadImage} alt="Ambiente de baño de AREA LRMQ" className="absolute inset-0 h-full w-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/48 via-ink/10 to-transparent lg:from-ink/38" aria-hidden="true" />
          <figcaption className="absolute bottom-5 right-5 rounded-full bg-ink/55 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">Selección AREA LRMQ</figcaption>
        </figure>
      </div>
    </header>
  );
}
