import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CatalogApiError, getProductBySlug } from '../api/client';
import type { ProductDetail, ProductImage } from '../model/types';
import type { SelectableUnit } from '../model/selection';
import { ProductGallery } from '../components/ProductGallery';
import { ProductVariantSelector } from '../components/ProductVariantSelector';
import { QuoteRequestForm } from '../../quote/components/QuoteRequestForm';
import { CATALOG_RETURN_STORAGE_KEY } from '../model/catalogQuery';

type DetailState =
  | { status: 'loading' }
  | { status: 'success'; product: ProductDetail }
  | { status: 'not-found' }
  | { status: 'error'; message: string };

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-red-800/20 bg-red-50 p-5 text-red-900">
      <p>{message}</p>
      <button type="button" onClick={onRetry} className="mt-3 font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay">Reintentar</button>
    </div>
  );
}

function ProductContent({ product, onActiveImage }: { product: ProductDetail; onActiveImage: (image: ProductImage | null) => void }) {
  const [selectedUnit, setSelectedUnit] = useState<SelectableUnit | null>(null);
  const variantLabel = selectedUnit?.variantSnapshot && Object.entries(selectedUnit.variantSnapshot).filter(([, value]) => value).map(([, value]) => String(value)).join(' · ');
  const specs = Object.entries(product.specs);

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <ProductGallery images={product.images} productName={product.name} variantLabel={variantLabel} onActiveChange={onActiveImage} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-graphite">{product.brand || product.supplierName || product.categoryName}</p>
          <h1 className="mt-3 font-display text-5xl leading-none">{product.name}</h1>
          {product.supplierName && <p className="mt-3 text-graphite">Proveedor: {product.supplierName}</p>}
          {product.subcategory && <p className="mt-1 text-graphite">{product.subcategory}</p>}
          {product.description && <p className="mt-6 whitespace-pre-line leading-relaxed text-graphite">{product.description}</p>}
          <div className="mt-8">
            <ProductVariantSelector product={product} onSelectionChange={setSelectedUnit} />
          </div>
          <div className="mt-8">
            <QuoteRequestForm product={product} unit={selectedUnit} />
          </div>
        </div>
      </div>
      {(specs.length > 0 || product.availableFinishes.length > 0 || product.availableMeasures.length > 0) && (
        <section className="mt-14 border-t border-ink/10 pt-8" aria-labelledby="product-details-heading">
          <h2 id="product-details-heading" className="font-display text-3xl">Detalles públicos</h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {specs.map(([key, value]) => <div key={key}><dt className="text-sm font-semibold text-graphite">{key}</dt><dd className="mt-1">{String(value)}</dd></div>)}
            {product.availableFinishes.length > 0 && <div><dt className="text-sm font-semibold text-graphite">Acabados</dt><dd className="mt-1">{product.availableFinishes.join(', ')}</dd></div>}
            {product.availableMeasures.length > 0 && <div><dt className="text-sm font-semibold text-graphite">Medidas</dt><dd className="mt-1">{product.availableMeasures.join(', ')}</dd></div>}
          </dl>
        </section>
      )}
      {product.commercialOffers.length > 0 && (
        <section className="mt-10 border-t border-ink/10 pt-8" aria-labelledby="commercial-offers-heading">
          <h2 id="commercial-offers-heading" className="font-display text-3xl">Opciones comerciales</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {product.commercialOffers.map((offer) => (
              <li key={offer.id} className="rounded-xl border border-ink/10 bg-white p-4">
                <p className="font-semibold">{offer.offerType || 'Conjunto'}</p>
                <p className="mt-1 text-sm text-graphite">{offer.variants.length} acabados disponibles</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

export function ProductDetailPage() {
  const { slug = '' } = useParams();
  const [state, setState] = useState<DetailState>({ status: 'loading' });
  const [retry, setRetry] = useState(0);
  const [activeImage, setActiveImage] = useState<ProductImage | null>(null);
  const handleActiveImage = useCallback((image: ProductImage | null) => setActiveImage(image), []);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });
    getProductBySlug(slug, null, { signal: controller.signal })
      .then((product) => setState({ status: 'success', product }))
      .catch((error) => {
        if (error?.name === 'AbortError') return;
        if (error instanceof CatalogApiError && error.code === 'PRODUCT_NOT_FOUND') {
          setState({ status: 'not-found' });
          return;
        }
        setState({ status: 'error', message: error instanceof CatalogApiError ? error.message : 'No se pudo cargar el producto.' });
      });
    return () => controller.abort();
  }, [slug, retry]);

  useEffect(() => {
    if (state.status !== 'success') return undefined;
    const previousTitle = document.title;
    const description = document.querySelector('meta[name="description"]');
    const previousDescription = description?.getAttribute('content') ?? null;
    document.title = `${state.product.name} · AREA LRMQ`;
    description?.setAttribute('content', state.product.description || `${state.product.name} de ${state.product.brand || state.product.supplierName || 'AREA LRMQ'}. Solicita presupuesto.`);
    return () => {
      document.title = previousTitle;
      if (description) {
        if (previousDescription === null) description.removeAttribute('content');
        else description.setAttribute('content', previousDescription);
      }
    };
  }, [state]);

  const returnTo = (() => {
    try {
      const raw = sessionStorage.getItem(CATALOG_RETURN_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { search?: string; scrollY?: number };
      return typeof parsed.search === 'string' ? parsed.search : null;
    } catch {
      return null;
    }
  })();

  return (
    <main className="min-h-screen bg-porcelain px-5 py-10 text-ink sm:px-8" id="product-content">
      <div className="mx-auto max-w-7xl">
        <nav aria-label="Migas de pan" className="text-sm text-graphite">
          <Link to="/" className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay">Inicio</Link>
          <span aria-hidden="true"> / </span>
          <Link to="/productos" className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay">Catálogo</Link>
        </nav>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {returnTo ? (
            <Link to={`/productos${returnTo}`} className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-ink/15 bg-white px-4 text-sm font-semibold shadow-soft transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-ink/40 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 focus-visible:ring-offset-porcelain">
              <span aria-hidden="true">←</span> Volver a resultados
            </Link>
          ) : (
            <Link to="/productos" className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-ink/15 bg-white px-4 text-sm font-semibold shadow-soft transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-ink/40 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 focus-visible:ring-offset-porcelain">
              <span aria-hidden="true">←</span> Volver al catálogo
            </Link>
          )}
          {activeImage && (
            <button
              type="button"
              onClick={() => {
                const event = new CustomEvent('lrmq:zoom-image', { detail: { url: activeImage.url } });
                document.dispatchEvent(event);
              }}
              className="self-start text-xs font-semibold uppercase tracking-[0.16em] text-graphite underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay"
            >
              Ver imagen ampliada
            </button>
          )}
        </div>
        {state.status === 'loading' && <p role="status" aria-live="polite" className="mt-12">Cargando producto…</p>}
        {state.status === 'not-found' && <div role="status" className="mt-12"><h1 className="font-display text-4xl">Producto no encontrado</h1><p className="mt-3 text-graphite">No hemos encontrado una ficha pública para este slug.</p><Link to="/productos" className="mt-5 inline-block font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay">Volver al catálogo completo</Link></div>}
        {state.status === 'error' && <div className="mt-12"><ErrorState message={state.message} onRetry={() => setRetry((value) => value + 1)} /></div>}
        {state.status === 'success' && <div className="mt-8"><ProductContent product={state.product} onActiveImage={handleActiveImage} /></div>}
      </div>
    </main>
  );
}
