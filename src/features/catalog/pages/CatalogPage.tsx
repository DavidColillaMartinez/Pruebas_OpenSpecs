import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CatalogApiError, getProducts } from '../api/client';
import type { ProductListResponse } from '../model/types';

export function CatalogPage() {
  const [state, setState] = useState<{ status: 'loading' | 'success' | 'error'; data?: ProductListResponse; message?: string }>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    getProducts({ limit: 24, offset: 0 }, null, { signal: controller.signal })
      .then((data) => setState({ status: 'success', data }))
      .catch((error) => {
        if (error?.name === 'AbortError') return;
        setState({ status: 'error', message: error instanceof CatalogApiError ? error.message : 'No se pudo cargar el catálogo.' });
      });
    return () => controller.abort();
  }, []);

  return (
    <main className="min-h-screen bg-porcelain px-5 py-10 text-ink sm:px-8">
      <div className="mx-auto max-w-7xl">
        <Link to="/" className="text-sm font-semibold text-graphite underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay">Volver a AREA LRMQ</Link>
        <h1 className="mt-8 font-display text-5xl leading-none">Catálogo</h1>
        <p className="mt-3 max-w-2xl text-graphite">Explora productos disponibles para tu proyecto y solicita un presupuesto con la configuración que elijas.</p>
        {state.status === 'loading' && <p role="status" aria-live="polite" className="mt-10">Cargando catálogo…</p>}
        {state.status === 'error' && (
          <div role="alert" className="mt-10 rounded-xl border border-red-800/20 bg-red-50 p-5 text-red-900">
            <p>{state.message}</p>
            <button type="button" onClick={() => window.location.reload()} className="mt-3 font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay">Reintentar</button>
          </div>
        )}
        {state.status === 'success' && (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {state.data?.items.map((product) => (
              <article key={product.id} className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
                <Link to={`/productos/${encodeURIComponent(product.slug)}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-clay">
                  {product.images[0] ? <img src={product.images[0].url} alt={product.images[0].alt} className="aspect-[4/3] w-full object-cover" /> : <div className="aspect-[4/3] bg-stonewash" aria-hidden="true" />}
                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-graphite">{product.brand || product.supplierName || product.categoryName}</p>
                    <h2 className="mt-2 text-xl font-semibold">{product.name}</h2>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
