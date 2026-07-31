import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CatalogApiError, getProductBySlug } from '../api/client';
import type { ProductDetail } from '../model/types';
import { buildVariantSnapshot, isManillonsMirrorProduct, type SelectableUnit } from '../model/selection';
import { ProductGallery } from '../components/ProductGallery';
import { ProductVariantSelector } from '../components/ProductVariantSelector';
import { QuoteRequestForm } from '../../quote/components/QuoteRequestForm';
import { CATALOG_RETURN_STORAGE_KEY } from '../model/catalogQuery';
import { buildQuoteRequestItem } from '../../quote/model/payload';
import { useQuoteSelection } from '../../quote/model/selectionStore';

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

function ProductContent({ product }: { product: ProductDetail }) {
  const [selectedUnit, setSelectedUnit] = useState<SelectableUnit | null>(null);
  const [addedMessage, setAddedMessage] = useState('');
  const { addLine } = useQuoteSelection();
  const variantLabel = selectedUnit?.variantSnapshot && ['dimension', 'finish', 'version', 'distribution'].map((key) => selectedUnit.variantSnapshot?.[key]).filter(Boolean).map(String).join(' · ');
  const galleryImages = isManillonsMirrorProduct(product) ? product.images : selectedUnit?.images?.length ? selectedUnit.images : product.images;
  const selectedSnapshot = buildVariantSnapshot(selectedUnit);
  const specs = Object.entries(product.specs).filter(([key]) => !['LED', 'Tipo de iluminación', 'Tecnología de iluminación', 'Temperatura de luz'].includes(key));
  const productFacts = [
    ['LED', selectedSnapshot?.has_led ?? product.hasLed],
    ['Tipo de iluminación', selectedSnapshot?.lighting_type ?? product.lightingType],
    ['Tecnología LED', selectedSnapshot?.lighting_technology ?? product.lightingTechnology],
    ['Temperatura de luz', selectedSnapshot?.light_temp ?? product.lightTemp],
  ].filter(([, value]) => value !== undefined && value !== '');
  const selectionFacts = ['dimension', 'finish', 'version'].map((key) => [key, selectedSnapshot?.[key]] as const).filter(([, value]) => value !== undefined && value !== '');

  const addCurrentSelection = () => {
    if (!selectedUnit) return;
    const added = addLine(buildQuoteRequestItem(product, selectedUnit, 1));
    setAddedMessage(added ? 'Añadido al presupuesto.' : 'No se pudo guardar esta variante completa.');
  };

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <ProductGallery images={galleryImages} productName={product.name} variantLabel={variantLabel} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-graphite">{product.brand || product.supplierName || product.categoryName}</p>
          <h1 className="mt-3 font-display text-5xl leading-none">{product.name}</h1>
          {product.supplierName && <p className="mt-3 text-graphite">Proveedor: {product.supplierName}</p>}
          {product.subcategory && <p className="mt-1 text-graphite">{product.subcategory}</p>}
          {product.description && <p className="mt-6 whitespace-pre-line leading-relaxed text-graphite">{product.description}</p>}
          <div className="mt-8">
            <ProductVariantSelector product={product} onSelectionChange={setSelectedUnit} />
          </div>
           <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" disabled={!selectedUnit} onClick={addCurrentSelection} className="inline-flex min-h-12 items-center justify-center rounded-full border border-ink/20 px-5 text-sm font-semibold transition-colors hover:border-ink/60 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay">Añadir al presupuesto</button>
            <Link to="/presupuesto" className="inline-flex min-h-12 items-center justify-center rounded-full border border-ink/20 px-5 text-sm font-semibold transition-colors hover:border-ink/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay">Ver presupuesto</Link>
           </div>
           {addedMessage && <p className="mt-3 text-sm text-green-800" role="status">{addedMessage}</p>}
           <div className="mt-8">
            <QuoteRequestForm product={product} unit={selectedUnit} />
           </div>
        </div>
      </div>
      {(productFacts.length > 0 || selectionFacts.length > 0 || specs.length > 0 || product.availableFinishes.length > 0 || product.availableMeasures.length > 0) && (
        <section className="mt-14 border-t border-ink/10 pt-8" aria-labelledby="product-details-heading">
          <h2 id="product-details-heading" className="font-display text-3xl">Detalles públicos</h2>
           <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
             {productFacts.map(([key, value]) => <div key={String(key)}><dt className="text-sm font-semibold text-graphite">{key}</dt><dd className="mt-1">{typeof value === 'boolean' ? value ? 'Sí' : 'No' : String(value)}</dd></div>)}
             {selectionFacts.map(([key, value]) => <div key={key}><dt className="text-sm font-semibold text-graphite">{key === 'dimension' ? 'Medida' : key === 'finish' ? 'Acabado' : 'Versión'} seleccionada</dt><dd className="mt-1">{String(value)}</dd></div>)}
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
            {product.commercialOffers.map((offer) => {
              const offerHasImages = Boolean(offer.images?.length || offer.variants.some((variant) => variant.images?.length));
              const references = [...new Set(offer.variants.map((variant) => variant.reference).filter((reference): reference is string => Boolean(reference)))];
              return (
                <li key={offer.id} className="rounded-xl border border-ink/10 bg-white p-4">
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-semibold">{offer.offerType || 'Conjunto'}</p>
                    <span className="rounded-full bg-stonewash px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-graphite">Oferta</span>
                  </div>
                  <p className="mt-2 text-sm text-graphite">{offer.variants.length} acabados disponibles</p>
                  {references.length > 0 && (
                    <p className="mt-2 text-xs leading-relaxed text-graphite/80">Referencias: {references.slice(0, 3).join(', ')}{references.length > 3 ? '…' : ''}</p>
                  )}
                  <p className="mt-3 text-xs leading-relaxed text-graphite/70">
                    {offerHasImages ? 'Esta oferta tiene imágenes propias.' : 'La ficha usa la imagen general: no hay una imagen específica publicada para esta oferta.'}
                  </p>
                </li>
              );
            })}
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
        </div>
        {state.status === 'loading' && <p role="status" aria-live="polite" className="mt-12">Cargando producto…</p>}
        {state.status === 'not-found' && <div role="status" className="mt-12"><h1 className="font-display text-4xl">Producto no encontrado</h1><p className="mt-3 text-graphite">No hemos encontrado una ficha pública para este slug.</p><Link to="/productos" className="mt-5 inline-block font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay">Volver al catálogo completo</Link></div>}
        {state.status === 'error' && <div className="mt-12"><ErrorState message={state.message} onRetry={() => setRetry((value) => value + 1)} /></div>}
        {state.status === 'success' && <div className="mt-8"><ProductContent product={state.product} /></div>}
      </div>
    </main>
  );
}
