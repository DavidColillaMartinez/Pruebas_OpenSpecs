import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CatalogApiError, getProducts } from '../api/client';
import { deriveCatalogFacets } from './normalize';
import type { CatalogFacetKey, CatalogFacets, CatalogSortMetadata, ProductCard, ProductListResponse } from './types';
import {
  catalogQueryKey,
  catalogQueryToRequest,
  parseCatalogQuery,
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

type PageCache = {
  key: string;
  pages: Map<number, ProductListResponse>;
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

function mergePages(pages: Map<number, ProductListResponse>): { items: ProductCard[]; first?: ProductListResponse; loadedPage: number } {
  const sortedPages = [...pages.entries()].sort(([a], [b]) => a - b);
  const first = sortedPages[0]?.[1];
  const seen = new Set<string>();
  const items: ProductCard[] = [];
  let loadedPage = 0;

  sortedPages.forEach(([page, response]) => {
    if (page !== loadedPage + 1) return;
    loadedPage = page;
    response.items.forEach((item) => {
      if (seen.has(item.id)) return;
      seen.add(item.id);
      items.push(item);
    });
  });

  return { items, first, loadedPage };
}

function errorMessage(error: unknown): string {
  return error instanceof CatalogApiError ? error.message : 'No se pudo cargar el catálogo.';
}

function getFacets(first: ProductListResponse | undefined, items: ProductCard[], total: number): CatalogFacets {
  if (first && Object.keys(first.facets).length > 0) return first.facets;
  return items.length >= total ? deriveCatalogFacets(items) : {};
}

export function useCatalogDiscovery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = parseCatalogQuery(searchParams);
  const queryString = searchParams.toString();
  const queryKey = catalogQueryKey(query);
  const [searchInput, setSearchInput] = useState(query.search);
  const [retry, setRetry] = useState(0);
  const [data, setData] = useState<DiscoveryData>(emptyData);
  const cacheRef = useRef<PageCache>({ key: queryKey, pages: new Map() });

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
    let cancelled = false;
    const currentQuery = parseCatalogQuery(queryString);
    const currentQueryKey = catalogQueryKey(currentQuery);
    if (cacheRef.current.key !== currentQueryKey) cacheRef.current = { key: currentQueryKey, pages: new Map() };

    const load = async () => {
      const targetPage = currentQuery.page;
      const pages = cacheRef.current.pages;
      const missingPages = Array.from({ length: targetPage }, (_, index) => index + 1).filter((page) => !pages.has(page));
      if (missingPages.length === 0) {
        const snapshot = mergePages(pages);
        const total = snapshot.first?.pagination.total ?? 0;
        setData((current) => ({ ...current, ...snapshot, status: 'success', loadingMore: false, error: undefined, additionalError: undefined, total, facets: getFacets(snapshot.first, snapshot.items, total), sort: snapshot.first?.sort ?? current.sort }));
        return;
      }

      const loadingInitial = !pages.has(1);
      setData((current) => ({ ...current, status: loadingInitial ? 'loading' : current.status, loadingMore: !loadingInitial, error: loadingInitial ? undefined : current.error, additionalError: undefined }));
      try {
        for (const page of missingPages) {
          const pageQuery: CatalogQueryState = { ...currentQuery, page };
          const response = await getProducts(catalogQueryToRequest(pageQuery, page === 1), null, { signal: controller.signal });
          if (cancelled) return;
          pages.set(page, response);
          const snapshot = mergePages(pages);
          setData({
            status: 'success',
            items: snapshot.items,
            total: response.pagination.total,
            facets: getFacets(snapshot.first, snapshot.items, response.pagination.total),
            sort: snapshot.first?.sort ?? { supported: [] },
            loadedPage: snapshot.loadedPage,
            loadingMore: page < targetPage,
          });
        }
      } catch (error) {
        if (cancelled || controller.signal.aborted) return;
        const loadingInitialError = !pages.has(1);
        setData((current) => ({
          ...current,
          status: loadingInitialError ? 'error' : 'success',
          loadingMore: false,
          error: loadingInitialError ? errorMessage(error) : current.error,
          additionalError: loadingInitialError ? undefined : errorMessage(error),
        }));
      }

    };

    const controller = new AbortController();
    void load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [queryString, retry]);

  const updateQuery = (next: CatalogQueryState) => {
    setSearchParams(serializeCatalogQuery(next), { replace: false });
  };

  const setFilter = (key: CatalogFacetKey, value: string, checked: boolean) => {
    const current = query.filters[key] || [];
    const values = checked ? [...current, value] : current.filter((item) => item !== value);
    const filters: CatalogFilters = { ...query.filters, [key]: [...new Set(values)] };
    if (filters[key]?.length === 0) delete filters[key];
    updateQuery(withCatalogQueryChange(query, { filters }));
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
