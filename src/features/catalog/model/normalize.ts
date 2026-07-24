import type {
  CatalogPublicConfig,
  CatalogFacetKey,
  CatalogFacetOption,
  CatalogFacets,
  CatalogSortMetadata,
  CatalogSortValue,
  CommercialOffer,
  CommercialOfferVariant,
  ProductCard,
  ProductDetail,
  ProductImage,
  ProductListResponse,
  ProductVariant,
  PublicAttributes,
} from './types';

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : {};
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function asNonNegativeNumber(value: unknown): number | undefined {
  const number = asNumber(value);
  return number !== undefined && number >= 0 ? number : undefined;
}

function publicAttributes(value: unknown): PublicAttributes {
  const record = asRecord(value);
  return Object.fromEntries(
    Object.entries(record).filter(([, item]) => ['string', 'number', 'boolean'].includes(typeof item))
  ) as PublicAttributes;
}

export function resolveAssetUrl(value: unknown, assetBaseUrl?: string | null): string | undefined {
  const raw = asString(value);
  if (!raw) return undefined;

  try {
    return new URL(raw).toString();
  } catch {
    if (!assetBaseUrl) return undefined;
    try {
      return new URL(raw.replace(/^\/+/, ''), `${assetBaseUrl.replace(/\/$/, '')}/`).toString();
    } catch {
      return undefined;
    }
  }
}

function normalizeImage(value: unknown, productName: string, assetBaseUrl?: string | null): ProductImage | null {
  const record = asRecord(value);
  const url = resolveAssetUrl(record.url ?? record.path, assetBaseUrl);
  if (!url) return null;

  return {
    alt: asString(record.alt) || productName,
    url,
    role: asString(record.role),
    width: asNumber(record.width),
    height: asNumber(record.height),
    sortOrder: asNumber(record.sort_order),
  };
}

function normalizeVariant(value: unknown): ProductVariant | null {
  const record = asRecord(value);
  const id = asString(record.id);
  if (!id) return null;

  return {
    id,
    reference: asString(record.reference),
    dimension: asString(record.dimension),
    finish: asString(record.finish),
    finishCode: asString(record.finish_code),
    attributes: publicAttributes(record.attributes),
    sortOrder: asNumber(record.sort_order),
  };
}

function normalizeCommercialOfferVariant(value: unknown): CommercialOfferVariant | null {
  const record = asRecord(value);
  const id = asString(record.id);
  if (!id) return null;

  return {
    id,
    reference: asString(record.reference),
    finishCode: asString(record.finish_code),
    finishName: asString(record.finish_name),
  };
}

function normalizeCommercialOffer(value: unknown): CommercialOffer | null {
  const record = asRecord(value);
  const id = asString(record.id);
  if (!id) return null;

  return {
    id,
    offerType: asString(record.offer_type),
    variants: Array.isArray(record.variants)
      ? record.variants.map(normalizeCommercialOfferVariant).filter((item): item is CommercialOfferVariant => item !== null)
      : [],
    sortOrder: asNumber(record.sort_order),
  };
}

export function normalizeProductDetail(value: unknown, config?: CatalogPublicConfig | null): ProductDetail {
  const record = asRecord(value);
  const id = asString(record.id);
  const name = asString(record.name);
  const slug = asString(record.slug);
  if (!id || !name || !slug) {
    throw new Error('PRODUCT_DETAIL_CONTRACT_INVALID');
  }

  const images = Array.isArray(record.images)
    ? record.images.map((item) => normalizeImage(item, name, config?.asset_base_url)).filter((item): item is ProductImage => item !== null)
    : [];
  const uniqueImages = [...new Map(images.map((item) => [item.url, item])).values()];

  return {
    id,
    name,
    slug,
    brand: asString(record.brand),
    supplierName: asString(record.supplier_name),
    supplierId: asString(record.supplier_id),
    categoryId: asString(record.category_id),
    categoryName: asString(record.category_name),
    subcategory: asString(record.subcategory),
    collection: asString(record.collection),
    description: asString(record.description),
    specs: publicAttributes(record.specs),
    productKind: asString(record.product_kind),
    showPrice: record.show_price === true,
    images: uniqueImages,
    variants: Array.isArray(record.variants)
      ? record.variants.map(normalizeVariant).filter((item): item is ProductVariant => item !== null)
      : [],
    commercialOffers: Array.isArray(record.commercial_offers)
      ? record.commercial_offers.map(normalizeCommercialOffer).filter((item): item is CommercialOffer => item !== null)
      : [],
    availableFinishes: asStringArray(record.available_finishes),
    availableMeasures: asStringArray(record.available_measures),
    configurationFields: asStringArray(record.configuration_fields),
  };
}

export function normalizeProductCard(value: unknown, config?: CatalogPublicConfig | null): ProductCard | null {
  try {
    const record = asRecord(value);
    const images = Array.isArray(record.images)
      ? record.images
      : (record.main_image_url || record.main_image_path)
        ? [{ alt: record.name, url: record.main_image_url ?? record.main_image_path, role: 'main' }]
        : [];
    const product = normalizeProductDetail({ ...record, images }, config);
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      images: product.images.slice(0, 1),
      showPrice: product.showPrice,
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      collection: product.collection,
      finishes: product.availableFinishes,
      measures: product.availableMeasures,
      productKind: product.productKind,
      subcategory: product.subcategory,
      supplierId: product.supplierId,
      supplierName: product.supplierName,
    };
  } catch {
    return null;
  }
}

export const deriveCatalogFacets = (items: ProductCard[]): CatalogFacets => {
  const facets: CatalogFacets = {};
  for (const key of ['category', 'supplier', 'subcategory', 'collection', 'product_kind'] as CatalogFacetKey[]) {
    const bucket = new Map<string, CatalogFacetOption>();
    for (const card of items) {
      const result: { value: string; label: string } | null = ((): { value: string; label: string } | null => {
        switch (key) {
          case 'category': {
            const id = card.categoryId || card.categoryName;
            return id ? { value: id, label: card.categoryName || card.categoryId || id } : null;
          }
          case 'supplier': {
            const id = card.supplierId || card.supplierName;
            return id ? { value: id, label: card.supplierName || card.supplierId || id } : null;
          }
          case 'subcategory': return card.subcategory ? { value: card.subcategory, label: card.subcategory } : null;
          case 'collection': return card.collection ? { value: card.collection, label: card.collection } : null;
          case 'product_kind': return card.productKind ? { value: card.productKind, label: card.productKind } : null;
          default: return null;
        }
      })();
      if (!result) continue;
      const { value, label } = result;
      if (!value?.trim()) continue;
      const existing = bucket.get(value);
      bucket.set(value, { value, label: label || value, count: (existing?.count || 0) + 1 });
    }
    if (bucket.size > 0) {
      const options = [...bucket.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'es'));
      facets[key] = options;
    }
  }
  const finishes = new Map<string, CatalogFacetOption>();
  const measures = new Map<string, CatalogFacetOption>();
  for (const card of items) {
    for (const finish of card.finishes || []) {
      const trimmed = finish?.trim();
      if (!trimmed) continue;
      const existing = finishes.get(trimmed);
      finishes.set(trimmed, { value: trimmed, label: trimmed, count: (existing?.count || 0) + 1 });
    }
    for (const measure of card.measures || []) {
      const trimmed = measure?.trim();
      if (!trimmed) continue;
      const existing = measures.get(trimmed);
      measures.set(trimmed, { value: trimmed, label: trimmed, count: (existing?.count || 0) + 1 });
    }
  }
  if (finishes.size > 0) facets.finish = [...finishes.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'es'));
  if (measures.size > 0) facets.measure = [...measures.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'es'));
  return facets;
};

const facetAliases: Record<string, CatalogFacetKey> = {
  categories: 'category',
  category: 'category',
  suppliers: 'supplier',
  supplier: 'supplier',
  subcategories: 'subcategory',
  subcategory: 'subcategory',
  collections: 'collection',
  collection: 'collection',
  product_kinds: 'product_kind',
  productKinds: 'product_kind',
  product_kind: 'product_kind',
  finishes: 'finish',
  finish: 'finish',
  measures: 'measure',
  measure: 'measure',
};

function normalizeFacetOption(value: unknown): CatalogFacetOption | null {
  const record = asRecord(value);
  const optionValue = asString(record.value ?? record.id ?? record.key);
  if (!optionValue) return null;

  return {
    value: optionValue,
    label: asString(record.label ?? record.name) || optionValue,
    count: asNonNegativeNumber(record.count) ?? 0,
  };
}

function normalizeFacets(value: unknown): CatalogFacets {
  const record = asRecord(value);
  const facets: CatalogFacets = {};

  Object.entries(record).forEach(([key, options]) => {
    const facetKey = facetAliases[key];
    if (!facetKey || !Array.isArray(options)) return;
    const normalized = options
      .map(normalizeFacetOption)
      .filter((option): option is CatalogFacetOption => option !== null);
    if (normalized.length > 0) facets[facetKey] = normalized;
  });

  return facets;
}

const supportedSorts = new Set<CatalogSortValue>(['relevance', 'name_asc', 'name_desc', 'recent', 'new', 'best_selling']);

function normalizeSort(value: unknown): CatalogSortMetadata {
  const record = asRecord(value);
  const supported = Array.isArray(record.supported)
    ? record.supported.filter((item): item is CatalogSortValue => typeof item === 'string' && supportedSorts.has(item as CatalogSortValue))
    : [];
  const applied = typeof record.applied === 'string' && supportedSorts.has(record.applied as CatalogSortValue)
    ? record.applied as CatalogSortValue
    : undefined;

  return { applied, supported: [...new Set(supported)] };
}

export function normalizeProductList(value: unknown, config?: CatalogPublicConfig | null): ProductListResponse {
  const record = asRecord(value);
  if (!Array.isArray(record.items)) throw new Error('PRODUCT_LIST_CONTRACT_INVALID');
  const pagination = asRecord(record.pagination);
  const items = Array.isArray(record.items)
    ? record.items.map((item) => normalizeProductCard(item, config)).filter((item): item is ProductCard => item !== null)
    : [];
  const limit = asNonNegativeNumber(pagination.limit);
  const offset = asNonNegativeNumber(pagination.offset);
  const total = asNonNegativeNumber(pagination.total);

  return {
    items,
    pagination: {
      limit: limit ?? items.length,
      offset: offset ?? 0,
      total: total ?? items.length,
    },
    facets: normalizeFacets(record.facets),
    sort: normalizeSort(record.sort),
    discardedItemCount: record.items.length - items.length || undefined,
  };
}
