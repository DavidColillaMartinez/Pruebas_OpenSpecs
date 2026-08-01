import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CatalogApiError, getProducts } from '../api/client';
import { deriveCatalogFacets } from './normalize';
import type { CatalogFacetKey, CatalogFacetOption, CatalogFacets, CatalogSortMetadata, ProductCard } from './types';
import {
  catalogQueryKey,
  catalogQueryToRequest,
  getCatalogFilterKeys,
  getCatalogFilterProfile,
  ROOT_CATALOG_FILTER_KEYS,
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

type FacetCache = {
  items: Map<string, ProductCard>;
  facets: CatalogFacets;
  status: 'idle' | 'loading' | 'success' | 'error';
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

function sortItems(items: ProductCard[], sort: CatalogSortMetadata): ProductCard[] {
  if (sort.applied === 'name_asc' || sort.applied === 'name_desc') {
    const direction = sort.applied === 'name_asc' ? 1 : -1;
    return [...items].sort((a, b) => a.name.localeCompare(b.name, 'es') * direction);
  }
  return items;
}

function errorMessage(error: unknown): string {
  return error instanceof CatalogApiError ? error.message : 'No se pudo cargar el catálogo.';
}

function hasFacets(facets: CatalogFacets): boolean {
  return Object.keys(facets).length > 0;
}

function hasRequiredFacets(facets: CatalogFacets, query: CatalogQueryState): boolean {
  const profile = getCatalogFilterProfile(query);
  if (profile === 'root') return ROOT_CATALOG_FILTER_KEYS.some((key) => Array.isArray(facets[key]));
  const requiredKeys = getCatalogFilterKeys(profile);
  return requiredKeys.every((key) => Array.isArray(facets[key]));
}

function createItemCache(key: string): ItemCache {
  return { key, items: new Map(), pages: new Set(), total: 0, sort: { supported: [] }, serverFacets: {} };
}

function createFacetCache(): FacetCache {
  return { items: new Map(), facets: {}, status: 'idle' };
}

function getLoadedPage(cache: ItemCache): number {
  return Math.max(0, ...cache.pages);
}

function mergeFacetOptions(globalFacets: CatalogFacets, activeFacets: CatalogFacets): CatalogFacets {
  const keys = new Set<CatalogFacetKey>([
    ...(Object.keys(globalFacets) as CatalogFacetKey[]),
    ...(Object.keys(activeFacets) as CatalogFacetKey[]),
  ]);
  const merged: CatalogFacets = {};

  keys.forEach((key) => {
    const globalOptions = globalFacets[key] || [];
    const activeOptions = activeFacets[key] || [];
    const activeByValue = new Map(activeOptions.map((option) => [option.value, option]));
    const values = new Map<string, CatalogFacetOption>();

    globalOptions.forEach((option) => {
      const activeOption = activeByValue.get(option.value);
      values.set(option.value, { ...option, count: activeOption?.count ?? 0 });
    });
    activeOptions.forEach((option) => values.set(option.value, option));

    if (values.size > 0) {
      merged[key] = [...values.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'es'));
    }
  });

  return merged;
}

function pickFacetKeys(facets: CatalogFacets, keys: CatalogFacetKey[]): CatalogFacets {
  return Object.fromEntries(keys
    .filter((key) => (facets[key] || []).length > 0)
    .map((key) => [key, facets[key]])) as CatalogFacets;
}

function getFacets(cache: ItemCache, facetCache: FacetCache, globalFacetCache: FacetCache, query: CatalogQueryState): CatalogFacets {
  const activeFacets = hasFacets(cache.serverFacets) ? cache.serverFacets : facetCache.facets;
  const activeReady = hasFacets(cache.serverFacets) || facetCache.status === 'success';
  const globalFacets = globalFacetCache.facets;
  const hasRootContext = Boolean(query.filters.category?.length || query.filters.supplier?.length);

  if (!hasRootContext) return pickFacetKeys(hasFacets(globalFacets) ? globalFacets : activeFacets, ROOT_CATALOG_FILTER_KEYS);
  if (!activeReady) return pickFacetKeys(globalFacets, ROOT_CATALOG_FILTER_KEYS);

  const rootFacets = mergeFacetOptions(
    pickFacetKeys(globalFacets, ROOT_CATALOG_FILTER_KEYS),
    pickFacetKeys(activeFacets, ROOT_CATALOG_FILTER_KEYS),
  );
  return {
    ...rootFacets,
    ...pickFacetKeys(activeFacets, getCatalogFilterKeys(getCatalogFilterProfile(query)).filter((key) => !ROOT_CATALOG_FILTER_KEYS.includes(key))),
  };
}

function toDiscoveryData(cache: ItemCache, facetCache: FacetCache, globalFacetCache: FacetCache, query: CatalogQueryState): DiscoveryData {
  const items = sortItems([...cache.items.values()], cache.sort);
  return {
    status: 'success',
    items,
    total: cache.total,
    facets: getFacets(cache, facetCache, globalFacetCache, query),
    sort: cache.sort,
    loadedPage: getLoadedPage(cache),
    loadingMore: false,
    additionalError: undefined,
  };
}

async function loadFacetUniverse(cache: FacetCache, query: CatalogQueryState, signal: AbortSignal, isCancelled: () => boolean): Promise<void> {
  let offset = 0;
  let total = Number.POSITIVE_INFINITY;
  const requestedLimit = 60;

  while (offset < total) {
    const response = await getProducts({ ...catalogQueryToRequest(query, true), limit: requestedLimit, offset }, null, { signal });
    if (isCancelled()) return;

    if (hasRequiredFacets(response.facets, query)) {
      cache.facets = response.facets;
      cache.status = 'success';
      return;
    }

    response.items.forEach((item) => cache.items.set(item.id, item));
    total = response.pagination.total;
    const step = response.pagination.limit || response.items.length;
    if (step <= 0 || response.items.length === 0) break;
    offset += step;
  }

  cache.facets = pickFacetKeys(deriveCatalogFacets([...cache.items.values()]), getCatalogFilterKeys(getCatalogFilterProfile(query)));
  cache.status = 'success';
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
  const facetCachesRef = useRef(new Map<string, FacetCache>());
  const globalFacetCacheRef = useRef<FacetCache>(createFacetCache());
  const facetKey = catalogQueryKey({ ...query, sort: 'relevance', page: 1 });
  const globalFacetKey = catalogQueryKey({ search: '', filters: {}, sort: 'relevance', page: 1 });
  const queryRef = useRef(query);
  const facetKeyRef = useRef(facetKey);
  queryRef.current = query;
  facetKeyRef.current = facetKey;

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
    const activeFacetCache = facetCachesRef.current.get(facetKey) || createFacetCache();
    const currentQuery = parseCatalogQuery(queryString);
    setData((current) => ({ ...emptyData, facets: getFacets(cacheRef.current, activeFacetCache, globalFacetCacheRef.current, currentQuery) || current.facets }));
  }, [facetKey, queryKey, queryString]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const facetCache = facetKey === globalFacetKey
      ? globalFacetCacheRef.current
      : facetCachesRef.current.get(facetKey) || createFacetCache();
    facetCachesRef.current.set(facetKey, facetCache);
    const facetQuery = { ...parseCatalogQuery(facetKey), sort: 'relevance' as const, page: 1 };

    if (facetCache.status === 'success' || facetCache.status === 'loading') return undefined;
    facetCache.status = 'loading';

    const loadFacets = async () => {
      try {
        await loadFacetUniverse(facetCache, facetQuery, controller.signal, () => cancelled);
        if (cancelled) return;
        const activeFacetCache = facetCachesRef.current.get(facetKey) || facetCache;
        setData((current) => ({ ...current, facets: getFacets(cacheRef.current, activeFacetCache, globalFacetCacheRef.current, facetQuery) || current.facets }));
      } catch {
        if (cancelled || controller.signal.aborted) return;
        facetCache.status = 'error';
        setData((current) => ({ ...current, facets: getFacets(cacheRef.current, facetCache, globalFacetCacheRef.current, facetQuery) || current.facets }));
      }
    };

    void loadFacets();
    return () => {
      cancelled = true;
      controller.abort();
      if (facetCache.status === 'loading') facetCache.status = 'idle';
    };
  }, [facetKey, globalFacetKey, retry]);

  useEffect(() => {
    if (facetKeyRef.current === globalFacetKey) return undefined;
    let cancelled = false;
    const controller = new AbortController();
    const facetCache = globalFacetCacheRef.current;

    if (facetCache.status === 'success' || facetCache.status === 'loading') return undefined;
    facetCache.status = 'loading';

    const loadGlobalFacets = async () => {
      try {
        await loadFacetUniverse(facetCache, { search: '', filters: {}, sort: 'relevance', page: 1 }, controller.signal, () => cancelled);
        if (cancelled) return;
        const activeFacetCache = facetKeyRef.current === globalFacetKey
          ? facetCache
          : facetCachesRef.current.get(facetKeyRef.current) || createFacetCache();
        setData((current) => ({ ...current, facets: getFacets(cacheRef.current, activeFacetCache, facetCache, queryRef.current) || current.facets }));
      } catch {
        if (cancelled || controller.signal.aborted) return;
        facetCache.status = 'error';
      }
    };

    void loadGlobalFacets();
    return () => {
      cancelled = true;
      controller.abort();
      if (facetCache.status === 'loading') facetCache.status = 'idle';
    };
  }, [globalFacetKey, retry]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const cache = cacheRef.current;
    const facetCache = facetKey === globalFacetKey
      ? globalFacetCacheRef.current
      : facetCachesRef.current.get(facetKey) || createFacetCache();
    const currentQuery = parseCatalogQuery(queryString);
    const targetPage = currentQuery.page;
    const missingPages = Array.from({ length: targetPage }, (_, index) => index + 1).filter((page) => !cache.pages.has(page));
    const isInitial = cache.items.size === 0;

    if (missingPages.length === 0) {
      setData(toDiscoveryData(cache, facetCache, globalFacetCacheRef.current, currentQuery));
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
           if (hasRequiredFacets(response.facets, currentQuery)) cache.serverFacets = response.facets;
          const items = sortItems([...cache.items.values()], cache.sort);
          const facets = getFacets(cache, facetCache, globalFacetCacheRef.current, currentQuery);
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
  }, [facetKey, globalFacetKey, queryKey, queryString, retry]);

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
