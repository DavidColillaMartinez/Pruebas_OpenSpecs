import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CatalogFilterPanel } from '../components/CatalogFilterPanel';
import { CatalogProductCard } from '../components/CatalogProductCard';
import { CATALOG_RETURN_STORAGE_KEY, type CatalogQueryState } from '../model/catalogQuery';
import { useCatalogDiscovery } from '../model/useCatalogDiscovery';
import type { CatalogSortValue } from '../model/types';

const sortLabels: Record<CatalogSortValue, string> = {
  relevance: 'Relevancia',
  name_asc: 'Nombre A-Z',
  name_desc: 'Nombre Z-A',
  recent: 'Más recientes · Próximamente',
  new: 'Novedades · Próximamente',
  best_selling: 'Más vendidos · Próximamente',
};

type ActiveFilterKey = keyof CatalogQueryState['filters'] | 'search';

function ActiveFilters({ query, labels, onRemove }: { query: CatalogQueryState; labels: Record<string, string>; onRemove: (key: ActiveFilterKey, value: string) => void }) {
  const entries = Object.entries(query.filters).flatMap(([key, values]) => (values || []).map((value) => ({ key: key as keyof CatalogQueryState['filters'], value })));
  if (!query.search && entries.length === 0) return null;

  return (
    <div className="mt-6 flex flex-wrap items-center gap-2" aria-label="Filtros activos">
      {query.search && <button type="button" onClick={() => onRemove('search', query.search)} className="inline-flex min-h-9 items-center gap-2 rounded-full bg-stonewash px-3 text-sm text-ink transition-colors duration-200 ease-out hover:bg-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2">Buscar: {query.search}<span aria-hidden="true">×</span><span className="sr-only">Quitar búsqueda</span></button>}
      {entries.map(({ key, value }) => (
        <button key={`${key}-${value}`} type="button" onClick={() => onRemove(key, value)} className="inline-flex min-h-9 items-center gap-2 rounded-full bg-stonewash px-3 text-sm text-ink transition-colors duration-200 ease-out hover:bg-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2">
          {labels[`${key}:${value}`] || value}<span aria-hidden="true">×</span><span className="sr-only">Quitar filtro</span>
        </button>
      ))}
    </div>
  );
}

export function CatalogPage() {
  const { query, searchInput, setSearchInput, data, setFilter, removeFilter, clearFilters, setSort, loadMore, retry } = useCatalogDiscovery();
  const location = useLocation();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const hasActiveCriteria = Boolean(query.search || Object.values(query.filters).some((values) => values && values.length > 0));
  const sortSupported = new Set(data.sort.supported);
  const facetLabels = Object.fromEntries(Object.entries(data.facets).flatMap(([key, options]) => options.map((option) => [`${key}:${option.value}`, option.label])));
  const showing = data.items.length;
  const isLoadingInitial = data.status === 'loading' && showing === 0;
  const totalLabel = data.total > 0
    ? `${data.total} productos disponibles`
    : data.status === 'success'
      ? 'Sin productos disponibles'
      : 'Consultando catálogo';

  useEffect(() => {
    if (data.status !== 'success' || data.loadedPage < query.page) return undefined;
    const raw = sessionStorage.getItem(CATALOG_RETURN_STORAGE_KEY);
    if (!raw) return undefined;
    try {
      const saved = JSON.parse(raw) as { search?: string; scrollY?: number };
      if (saved.search !== location.search || typeof saved.scrollY !== 'number') return undefined;
      const frame = window.requestAnimationFrame(() => window.scrollTo({ top: saved.scrollY, behavior: 'auto' }));
      sessionStorage.removeItem(CATALOG_RETURN_STORAGE_KEY);
      return () => window.cancelAnimationFrame(frame);
    } catch {
      sessionStorage.removeItem(CATALOG_RETURN_STORAGE_KEY);
      return undefined;
    }
  }, [data.loadedPage, data.status, location.search, query.page]);

  return (
    <main className="min-h-screen bg-porcelain px-5 py-10 text-ink sm:px-8" id="catalog-content">
      <div className="mx-auto max-w-7xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-graphite underline-offset-4 transition-colors duration-200 ease-out hover:text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-4 focus-visible:ring-offset-porcelain">
          <span aria-hidden="true">←</span> Volver a AREA LRMQ
        </Link>
        <header className="mt-8 max-w-3xl">
          <h1 className="font-display text-5xl leading-none sm:text-6xl">Catálogo</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-graphite">Explora piezas, acabados y soluciones para comparar con calma antes de configurar tu proyecto.</p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-graphite" aria-live="polite">{totalLabel}</p>
        </header>

        <div className="mt-12 grid gap-12 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
          <CatalogFilterPanel facets={data.facets} filters={query.filters} categoryContext={query.filters.category?.find((value) => value.trim().toLocaleLowerCase() === 'mamparas')} mobileOpen={mobileFiltersOpen} onMobileClose={() => setMobileFiltersOpen(false)} onToggle={setFilter} />
          <section aria-labelledby="catalog-results-heading" className="min-w-0">
            <div className="flex flex-col gap-4 border-b border-ink/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0 flex-1">
                <label htmlFor="catalog-search" className="text-xs font-semibold uppercase tracking-[0.16em] text-graphite">Buscar en el catálogo</label>
                <div className="mt-2 flex gap-2">
                  <input id="catalog-search" type="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Nombre, colección o producto" className="min-h-12 min-w-0 flex-1 rounded-lg border border-ink/20 bg-white px-4 text-base text-ink outline-none transition-shadow duration-200 ease-out placeholder:text-graphite/60 focus:border-clay focus:ring-2 focus:ring-clay/30" />
                  {searchInput && <button type="button" onClick={() => setSearchInput('')} className="min-h-12 rounded-lg px-3 text-sm font-semibold text-graphite underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay">Limpiar</button>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" className="min-h-11 rounded-full border border-ink/20 bg-white px-4 text-sm font-semibold transition-colors duration-200 ease-out hover:border-ink/40 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay" aria-expanded={mobileFiltersOpen} onClick={() => setMobileFiltersOpen(true)}>Filtros</button>
                <label className="flex min-h-11 items-center gap-2 text-sm text-graphite">
                  <span className="sr-only">Ordenar por</span>
                  <select value={query.sort} onChange={(event) => setSort(event.target.value as CatalogSortValue)} className="min-h-11 rounded-lg border border-ink/20 bg-white px-3 text-sm text-ink outline-none transition-shadow duration-200 ease-out focus:border-clay focus:ring-2 focus:ring-clay/30" aria-label="Ordenar por">
                    {(Object.keys(sortLabels) as CatalogSortValue[]).map((sort) => <option key={sort} value={sort} disabled={sort !== 'relevance' && !sortSupported.has(sort)}>{sortLabels[sort]}</option>)}
                  </select>
                </label>
              </div>
            </div>

            <ActiveFilters query={query} labels={facetLabels} onRemove={(key, value) => key === 'search' ? setSearchInput('') : removeFilter(key, value)} />
            {(hasActiveCriteria || query.sort !== 'relevance') && <button type="button" onClick={clearFilters} className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-graphite underline-offset-4 transition-colors duration-200 ease-out hover:text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2">Limpiar filtros</button>}

            <div className="mt-10 flex items-end justify-between gap-4">
              <h2 id="catalog-results-heading" className="font-display text-3xl">Resultados</h2>
              <p className="text-sm text-graphite">{data.total > 0 ? `Mostrando ${showing} de ${data.total}` : ''}</p>
            </div>

            <div className="sr-only" aria-live="polite" role="status">{data.status === 'success' ? `${showing} productos mostrados` : data.status === 'loading' ? 'Cargando productos' : ''}</div>
            {isLoadingInitial && (
              <div className="mt-10 grid gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="animate-pulse rounded-2xl bg-white/72 p-3 shadow-soft ring-1 ring-ink/5">
                    <div className="aspect-[4/3] rounded-xl bg-stonewash" />
                    <div className="space-y-2 px-1 pb-2 pt-4">
                      <div className="h-3 w-1/3 rounded-full bg-stonewash" />
                      <div className="h-4 w-3/4 rounded-full bg-stonewash" />
                      <div className="h-3 w-1/2 rounded-full bg-stonewash" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {data.status === 'error' && (
              <div className="mt-10 rounded-xl border border-red-800/20 bg-red-50 p-5 text-red-900" role="alert">
                <p>{data.error}</p>
                <button type="button" onClick={retry} className="mt-3 font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay">Reintentar</button>
              </div>
            )}
            {data.status === 'success' && showing === 0 && (
              <div className="mt-10 rounded-xl border border-ink/10 bg-stonewash p-8">
                <h3 className="font-display text-2xl">{hasActiveCriteria ? 'No hay coincidencias' : 'Catálogo vacío'}</h3>
                <p className="mt-2 max-w-xl text-graphite">{hasActiveCriteria ? 'Prueba a retirar algún criterio o limpia la búsqueda para volver a explorar todas las piezas.' : 'No hay productos públicos disponibles en este momento.'}</p>
                {hasActiveCriteria && <button type="button" onClick={clearFilters} className="mt-5 font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay">Limpiar filtros</button>}
              </div>
            )}
            {showing > 0 && (
              <div id="catalog-results" className="mt-6 grid gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                {data.items.map((product) => <CatalogProductCard key={product.id} product={product} />)}
              </div>
            )}
            {data.additionalError && (
              <div className="mt-8 rounded-xl border border-red-800/20 bg-red-50 p-5 text-red-900" role="alert">
                <p>{data.additionalError}</p>
                <button type="button" onClick={retry} className="mt-3 font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay">Reintentar carga</button>
              </div>
            )}
            {showing > 0 && showing < data.total && (
              <div className="mt-10 flex justify-center">
                <button type="button" onClick={loadMore} disabled={data.loadingMore} aria-controls="catalog-results" className="min-h-12 rounded-full border border-ink/30 bg-white px-6 text-sm font-semibold shadow-soft transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-ink hover:bg-ink hover:text-white hover:shadow-lift disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2">
                  {data.loadingMore ? 'Cargando…' : `Cargar más (${Math.max(0, data.total - showing)})`}
                </button>
              </div>
            )}
            {showing > 0 && showing >= data.total && <p className="mt-10 text-center text-sm text-graphite">Has llegado al final del catálogo.</p>}
            {data.status === 'loading' && showing > 0 && <p className="mt-8 text-center text-sm text-graphite" role="status">Cargando más productos…</p>}
            <p className="mt-12 text-xs text-graphite/70">Página de resultados basada en información pública del catálogo. Los precios y la disponibilidad se confirman en la ficha.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
