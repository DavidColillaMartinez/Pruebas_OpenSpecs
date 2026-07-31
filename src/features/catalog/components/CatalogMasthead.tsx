import { Link } from 'react-router-dom';
import { QuoteSelectionLink } from '../../quote/components/QuoteSelectionLink';

const mastheadImage = 'https://images.unsplash.com/photo-1763485956293-873ea83bf095?auto=format&fit=crop&w=2200&q=90';

export function CatalogMasthead() {
  return (
    <header className="border-b border-ink/10 pb-10" aria-labelledby="catalog-heading">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div className="flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" aria-label="Volver a la página principal" className="inline-grid h-11 w-11 shrink-0 place-items-center rounded-full border border-ink/15 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2">
              <span className="grid h-full w-full place-items-center overflow-hidden rounded-full" aria-hidden="true">
                <img src="/logo-area-lrmq.webp" alt="" className="h-full w-full scale-[1.35] object-contain" loading="eager" />
              </span>
            </Link>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-graphite">AREA LRMQ DESIGN S.L.</span>
            <span className="ml-auto"><QuoteSelectionLink compact /></span>
          </div>
          <div className="mt-12 max-w-xl lg:mt-20">
            <p className="text-sm font-semibold text-clay">Tienda</p>
            <h1 id="catalog-heading" className="mt-4 font-display text-5xl leading-[0.92] tracking-[0.02em] sm:text-6xl">Catálogo</h1>
            <p className="mt-5 max-w-md text-base leading-7 text-graphite sm:text-lg">Explora piezas, acabados y soluciones para construir un baño con una dirección visual clara.</p>
          </div>
          <nav aria-label="Migas de pan" className="mt-10 text-sm text-graphite">
            <Link to="/" className="underline-offset-4 transition-colors hover:text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay">Inicio</Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page" className="text-ink">Tienda</span>
          </nav>
        </div>
        <figure className="relative min-h-52 overflow-hidden border-y border-ink/10 lg:border-y-0 lg:border-l lg:pl-8">
          <img src={mastheadImage} alt="Ambiente de baño de AREA LRMQ" className="h-64 w-full object-cover lg:h-72" loading="eager" />
          <figcaption className="mt-3 text-right text-xs text-graphite">Selección AREA LRMQ</figcaption>
        </figure>
      </div>
    </header>
  );
}
