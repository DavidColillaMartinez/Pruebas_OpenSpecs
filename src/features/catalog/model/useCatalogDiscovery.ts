import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CatalogApiError, getProducts } from '../api/client';
import { deriveCatalogFacets } from './normalize';
import { isRoyoFurnitureScope } from './royo';
import type { CatalogFacetKey, CatalogFacets, CatalogSortMetadata, ProductCard } from './types';
import {
  catalogQueryKey,
  catalogQueryToRequest,
  getCatalogFilterKeys,
  getCatalogFilterProfile,
  parseCatalogQuery,
  pruneCatalogFilters,
  serializeCatalogQuery,
  withCatalogQueryChange,
  type CatalogFilters,
  type CatalogQueryState,
} from './catalogQuery';

type DiscoveryStatus = 'loading' | 'success' | 'error';

type DiscoveryData = {
  status: DiscoveryStatus;
  items: ProductCard[];
  total: number;
  facets: CatalogFacets;
  sort: CatalogSortMetadata;
  loadedPage: number;
  error?: string;
  additionalError?: string;
  loadingMore: boolean;
};

type ItemCache = {
  key: string;
  items: Map<string, ProductCard>;
  pages: Set<number>;
  total: number;
  sort: CatalogSortMetadata;
  serverFacets: CatalogFacets;
};

const emptyData: DiscoveryData = {
  status: 'loading',
  items: [],
  total: 0,
  facets: {},
  sort: { supported: [] },
  loadedPage: 0,
  loadingMore: false,
};

function visibleSortKey(product: ProductCard): string {
  if (isRoyoFurnitureScope(product)) {
    // Royo furniture titles come from the API model. Fall back to the internal
    // name only as a technical sort key; it is never displayed as a model.
    return product.collection || product.model || product.name;
  }
  return product.name;
}

function sortItems(items: ProductCard[], sort: CatalogSortMetadata): ProductCard[] {
  if (sort.applied === 'name_asc' || sort.applied === 'name_desc') {
    const direction = sort.applied === 'name_asc' ? 1 : -1;
    return [...items].sort((a, b) => visibleSortKey(a).localeCompare(visibleSortKey(b), 'es') * direction);
  }
  return items;
}

function errorMessage(error: unknown): string {
  return error instanceof CatalogApiError ? error.message : 'No se pudo cargar el catálogo.';
}

function hasFacets(facets: CatalogFacets): boolean {
  return Object.keys(facets).length > 0;
}

function createItemCache(key: string): ItemCache {
  return { key, items: new Map(), pages: new Set(), total: 0, sort: { supported: [] }, serverFacets: {} };
}

function getLoadedPage(cache: ItemCache): number {
  return Math.max(0, ...cache.pages);
}

function pickFacetKeys(facets: CatalogFacets, keys: CatalogFacetKey[]): CatalogFacets {
  return Object.fromEntries(keys
    .filter((key) => (facets[key] || []).length > 0)
    .map((key) => [key, facets[key]])) as CatalogFacets;
}

function getFacets(cache: ItemCache, query: CatalogQueryState): CatalogFacets {
  const facets = hasFacets(cache.serverFacets)
    ? cache.serverFacets
    : deriveCatalogFacets([...cache.items.values()]);
  return pickFacetKeys(facets, getCatalogFilterKeys(getCatalogFilterProfile(query)));
}

function toDiscoveryData(cache: ItemCache, query: CatalogQueryState): DiscoveryData {
  const items = sortItems([...cache.items.values()], cache.sort);
  return {
    status: 'success',
    items,
    total: cache.total,
    facets: getFacets(cache, query),
    sort: cache.sort,
    loadedPage: getLoadedPage(cache),
    loadingMore: false,
    additionalError: undefined,
  };
}

export function useCatalogDiscovery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = parseCatalogQuery(searchParams);
  const queryString = searchParams.toString();
  const queryKey = catalogQueryKey(query);
  const [searchInput, setSearchInput] = useState(query.search);
  const [retry, setRetry] = useState(0);
  const [data, setData] = useState<DiscoveryData>(emptyData);
  const cacheRef = useRef<ItemCache>(createItemCache(queryKey));

  useEffect(() => {
    setSearchInput(query.search);
  }, [query.search]);

  useEffect(() => {
    const currentQuery = parseCatalogQuery(queryString);
    if (searchInput.trim() === currentQuery.search) return undefined;
    const timeout = window.setTimeout(() => {
      setSearchParams(serializeCatalogQuery(withCatalogQueryChange(currentQuery, { search: searchInput.trim() })), { replace: false });
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [queryString, searchInput, setSearchParams]);

  useEffect(() => {
    if (cacheRef.current.key === queryKey) return;
    cacheRef.current = createItemCache(queryKey);
    setData(emptyData);
  }, [queryKey]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const cache = cacheRef.current;
    const currentQuery = parseCatalogQuery(queryString);
    const targetPage = currentQuery.page;
    const missingPages = Array.from({ length: targetPage }, (_, index) => index + 1).filter((page) => !cache.pages.has(page));
    const isInitial = cache.items.size === 0;

    if (missingPages.length === 0) {
      setData(toDiscoveryData(cache, currentQuery));
      return;
    }

    setData((current) => ({ ...current, status: isInitial ? 'loading' : current.status, loadingMore: !isInitial, error: isInitial ? undefined : current.error, additionalError: undefined }));
    const load = async () => {
      try {
        for (const page of missingPages) {
          const pageQuery: CatalogQueryState = { ...currentQuery, page };
          const response = await getProducts(catalogQueryToRequest(pageQuery, page === 1), null, { signal: controller.signal });
          if (cancelled) return;
          response.items.forEach((item) => cache.items.set(item.id, item));
          cache.pages.add(page);
          cache.total = response.pagination.total;
          if (response.sort.supported.length > 0 || response.sort.applied) cache.sort = response.sort;
          if (hasFacets(response.facets)) cache.serverFacets = response.facets;
          const items = sortItems([...cache.items.values()], cache.sort);
          const facets = getFacets(cache, currentQuery);
          setData({
            status: 'success',
            items,
            total: cache.total,
            facets,
            sort: cache.sort,
            loadedPage: getLoadedPage(cache),
            loadingMore: page < targetPage,
            additionalError: undefined,
          });
        }
      } catch (error) {
        if (cancelled || controller.signal.aborted) return;
        const loadingInitialError = cache.items.size === 0;
        setData((current) => ({
          ...current,
          status: loadingInitialError ? 'error' : 'success',
          loadingMore: false,
          error: loadingInitialError ? errorMessage(error) : current.error,
          additionalError: loadingInitialError ? undefined : errorMessage(error),
        }));
      }
    };
    void load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [queryKey, queryString, retry]);

  const updateQuery = (next: CatalogQueryState) => {
    setSearchParams(serializeCatalogQuery(next), { replace: false });
  };

  const setFilter = (key: CatalogFacetKey, value: string, checked: boolean) => {
    const current = query.filters[key] || [];
    const values = key === 'category'
      ? checked ? [value] : []
      : checked ? [...current, value] : current.filter((item) => item !== value);
    const filters: CatalogFilters = { ...query.filters, [key]: [...new Set(values)] };
    if (filters[key]?.length === 0) delete filters[key];
    const sanitizedFilters = pruneCatalogFilters(filters);
    updateQuery(withCatalogQueryChange(query, { filters: sanitizedFilters }));
  };

  const removeFilter = (key: CatalogFacetKey, value: string) => setFilter(key, value, false);
  const clearFilters = () => {
    setSearchInput('');
    updateQuery(withCatalogQueryChange(query, { search: '', filters: {} }));
  };
  const loadMore = () => {
    if (!data.loadingMore && data.items.length < data.total) updateQuery({ ...query, page: query.page + 1 });
  };

  return {
    query,
    searchInput,
    setSearchInput,
    data,
    setFilter,
    removeFilter,
    clearFilters,
    setSort: (sort: CatalogQueryState['sort']) => updateQuery(withCatalogQueryChange(query, { sort })),
    loadMore,
    retry: () => setRetry((value) => value + 1),
  };
}
