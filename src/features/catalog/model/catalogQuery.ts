import type {
  CatalogFacetKey,
  CatalogRequestParams,
  CatalogSortMetadata,
  CatalogSortValue,
} from './types';

export const CATALOG_PAGE_SIZE = 24;
export const CATALOG_RETURN_STORAGE_KEY = 'catalog:return-state';
export const CATALOG_FILTER_KEYS: CatalogFacetKey[] = [
  'category',
  'supplier',
  'subcategory',
  'collection',
  'distribution',
  'shape',
  'has_led',
  'lighting_type',
  'product_kind',
  'finish',
  'measure',
];

export const ROOT_CATALOG_FILTER_KEYS: CatalogFacetKey[] = ['category', 'supplier'];
export const MAMPARAS_CATALOG_FILTER_KEYS: CatalogFacetKey[] = ['subcategory', 'collection', 'distribution', 'finish'];
export const ESPEJOS_CATALOG_FILTER_KEYS: CatalogFacetKey[] = ['subcategory', 'collection', 'shape', 'has_led', 'lighting_type', 'finish'];
export const DEPENDENT_CATALOG_FILTER_KEYS: CatalogFacetKey[] = [...new Set([...MAMPARAS_CATALOG_FILTER_KEYS, ...ESPEJOS_CATALOG_FILTER_KEYS])];

export type CatalogFamilyId = 'mamparas' | 'espejos';
export type CatalogFilterProfile = 'root' | CatalogFamilyId | 'mixed';

export type CatalogFamilyProfile = {
  id: CatalogFamilyId;
  categories: string[];
  suppliers: string[];
  facetKeys: CatalogFacetKey[];
  labels: Partial<Record<CatalogFacetKey, string>>;
};

export const CATALOG_FAMILY_PROFILES: CatalogFamilyProfile[] = [
  {
    id: 'mamparas',
    categories: ['mamparas'],
    suppliers: ['gme'],
    facetKeys: MAMPARAS_CATALOG_FILTER_KEYS,
    labels: { subcategory: 'Tipo', collection: 'Modelo' },
  },
  {
    id: 'espejos',
    categories: ['espejos'],
    suppliers: ['manillons-torrent'],
    facetKeys: ESPEJOS_CATALOG_FILTER_KEYS,
    labels: {
      subcategory: 'Tipo de espejo',
      collection: 'Modelo',
      shape: 'Forma',
      has_led: 'LED',
      lighting_type: 'Tipo de iluminación',
      finish: 'Acabado',
    },
  },
];

const requestFilterKeys: Partial<Record<CatalogFacetKey, string>> = {
  category: 'category_id',
  supplier: 'supplier_id',
};

export type CatalogFilters = Partial<Record<CatalogFacetKey, string[]>>;

export type CatalogQueryState = {
  search: string;
  filters: CatalogFilters;
  sort: CatalogSortValue;
  page: number;
};

export const DEFAULT_CATALOG_QUERY: CatalogQueryState = {
  search: '',
  filters: {},
  sort: 'relevance',
  page: 1,
};

const knownSorts = new Set<CatalogSortValue>([
  'relevance',
  'name_asc',
  'name_desc',
  'recent',
  'new',
  'best_selling',
]);

function uniqueValues(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function valuesForFilter(key: CatalogFacetKey, values: string[]): string[] {
  const unique = uniqueValues(values);
  return key === 'category' ? unique.slice(0, 1) : unique;
}

export function getCatalogFilterProfile(query: Pick<CatalogQueryState, 'filters'>): CatalogFilterProfile {
  const families = getActiveCatalogFamilies(query);
  if (families.length === 0) return 'root';
  return families.length === 1 ? families[0] : 'mixed';
}

export function getActiveCatalogFamilies(query: Pick<CatalogQueryState, 'filters'>): CatalogFamilyId[] {
  const categoryValues = (query.filters.category || []).map((value) => value.toLocaleLowerCase());
  const supplierValues = (query.filters.supplier || []).map((value) => value.toLocaleLowerCase());
  return CATALOG_FAMILY_PROFILES
    .filter((profile) => profile.categories.some((value) => categoryValues.includes(value)) || profile.suppliers.some((value) => supplierValues.includes(value)))
    .map((profile) => profile.id);
}

export function getCatalogFilterKeys(profile: CatalogFilterProfile): CatalogFacetKey[] {
  if (profile === 'root') return ROOT_CATALOG_FILTER_KEYS;
  const families = profile === 'mixed' ? CATALOG_FAMILY_PROFILES : CATALOG_FAMILY_PROFILES.filter((item) => item.id === profile);
  return [...new Set([...
    ROOT_CATALOG_FILTER_KEYS,
    ...families.flatMap((family) => family.facetKeys),
  ])];
}

export function getCatalogFacetLabel(key: CatalogFacetKey, profile: CatalogFilterProfile): string | undefined {
  const genericLabels: Partial<Record<CatalogFacetKey, string>> = {
    subcategory: 'Tipo',
    collection: 'Modelo',
    finish: 'Acabado',
  };
  const families = profile === 'mixed'
    ? CATALOG_FAMILY_PROFILES
    : CATALOG_FAMILY_PROFILES.filter((item) => item.id === profile);
  if (profile === 'mixed' && genericLabels[key]) return genericLabels[key];
  const labels = [...new Set(families.map((family) => family.labels[key]).filter((label): label is string => Boolean(label)))];
  return labels.length === 1 ? labels[0] : genericLabels[key];
}

export function pruneCatalogFilters(filters: CatalogFilters): CatalogFilters {
  const activeFamilies = getActiveCatalogFamilies({ filters });
  const ownedKeys = new Set(activeFamilies.flatMap((familyId) => CATALOG_FAMILY_PROFILES.find((profile) => profile.id === familyId)?.facetKeys || []));
  return Object.fromEntries(Object.entries(filters).filter(([key, values]) => {
    if (!values?.length) return false;
    return ROOT_CATALOG_FILTER_KEYS.includes(key as CatalogFacetKey) || ownedKeys.has(key as CatalogFacetKey);
  })) as CatalogFilters;
}

function readParams(input: URLSearchParams | string): URLSearchParams {
  return input instanceof URLSearchParams ? input : new URLSearchParams(input);
}

export function parseCatalogQuery(input: URLSearchParams | string, sortMetadata?: CatalogSortMetadata): CatalogQueryState {
  const params = readParams(input);
  const requestedSort = params.get('sort');
  const supported = sortMetadata?.supported ?? [...knownSorts];
  const sort = requestedSort && knownSorts.has(requestedSort as CatalogSortValue) && supported.includes(requestedSort as CatalogSortValue)
    ? requestedSort as CatalogSortValue
    : DEFAULT_CATALOG_QUERY.sort;
  const filters: CatalogFilters = {};

  CATALOG_FILTER_KEYS.forEach((key) => {
    const values = valuesForFilter(key, params.getAll(key));
    if (values.length > 0) filters[key] = values;
  });
  const sanitizedFilters = pruneCatalogFilters(filters);

  const pageValue = Number(params.get('page'));

  return {
    search: params.get('search')?.trim() || '',
    filters: sanitizedFilters,
    sort,
    page: Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1,
  };
}

export function serializeCatalogQuery(query: CatalogQueryState): URLSearchParams {
  const params = new URLSearchParams();
  const search = query.search.trim();
  if (search) params.set('search', search);

  CATALOG_FILTER_KEYS.forEach((key) => {
    valuesForFilter(key, query.filters[key] || []).forEach((value) => params.append(key, value));
  });

  if (query.sort !== DEFAULT_CATALOG_QUERY.sort) params.set('sort', query.sort);
  if (query.page > 1) params.set('page', String(Math.max(1, Math.floor(query.page))));
  return params;
}

export function catalogQueryKey(query: CatalogQueryState): string {
  const criteria = { ...query, page: 1 };
  return serializeCatalogQuery(criteria).toString();
}

export function catalogQueryToRequest(query: CatalogQueryState, includeFacets: boolean): CatalogRequestParams {
  const params: CatalogRequestParams = {
    limit: CATALOG_PAGE_SIZE,
    offset: (query.page - 1) * CATALOG_PAGE_SIZE,
    include_facets: includeFacets ? '1' : '0',
  };

  if (query.search) params.search = query.search;
  if (query.sort !== DEFAULT_CATALOG_QUERY.sort) params.sort = query.sort;
  CATALOG_FILTER_KEYS.forEach((key) => {
    const values = valuesForFilter(key, query.filters[key] || []);
    if (values.length > 0) params[requestFilterKeys[key] || key] = values;
  });
  return params;
}

export function withCatalogQueryChange(query: CatalogQueryState, change: Partial<Pick<CatalogQueryState, 'search' | 'sort'>> & { filters?: CatalogFilters; page?: number }): CatalogQueryState {
  return {
    ...query,
    ...change,
    filters: pruneCatalogFilters(change.filters ?? query.filters),
    page: change.page ?? 1,
  };
}
