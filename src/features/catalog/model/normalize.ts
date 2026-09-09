import type {
  CatalogPublicConfig,
  CatalogFacetKey,
  CatalogFacetOption,
  CatalogFacets,
  CatalogModularity,
  CatalogSortMetadata,
  CatalogSortValue,
  CommercialOffer,
  CommercialOfferVariant,
  DuplachFinishFamily,
  ProductCard,
  ProductDetail,
  ProductImage,
  ProductListResponse,
  ProductVariant,
  PublicAttributes,
  ProductSpecs,
} from './types';

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : {};
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim().toLocaleLowerCase();
  if (['true', 'yes', 'sí', 'si'].includes(normalized)) return true;
  if (['false', 'no'].includes(normalized)) return false;
  return undefined;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];
}

function asModularity(value: unknown): CatalogModularity | undefined {
  return value === 'modular' || value === 'normal' ? value : undefined;
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
    Object.entries(record).filter(([key, item]) => ['string', 'number', 'boolean'].includes(typeof item) && !/(?:price|precio|importe|cost|coste|source_page|source_price|quality|hash|publication|raw_data|internal)/i.test(key))
  ) as PublicAttributes;
}

const VARIANT_ATTRIBUTE_METADATA = /^(?:id|label|reference|measure|dimension|finish|version|has_led|hasled|lighting_type|lightingtype|lighting_technology|lightingtechnology|light_temp|lighttemp|light_temperature|distribution|finish_code|sort_order|images?|image_url|image_path|image_mapping_status)$/i;

function publicVariantAttributes(record: UnknownRecord): PublicAttributes {
  const nested = publicAttributes(record.attributes);
  const direct = Object.fromEntries(Object.entries(record).filter(([key, item]) => (
    ['string', 'number', 'boolean'].includes(typeof item)
      && !VARIANT_ATTRIBUTE_METADATA.test(key)
      && !/(?:price|precio|importe|cost|coste|source_page|source_price|quality|hash|publication|raw_data|internal)/i.test(key)
  ))) as PublicAttributes;
  return { ...direct, ...nested };
}

function publicSpecs(value: unknown): ProductSpecs {
  const record = asRecord(value);
  return Object.fromEntries(
    Object.entries(record).filter(([key, item]) => item !== undefined && item !== null && !/(?:price|precio|importe|cost|coste|source_page|source_price|quality|hash|publication|raw_data|internal)/i.test(key))
  );
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

function orderImages(images: ProductImage[]): ProductImage[] {
  return images
    .map((image, index) => ({ image, index }))
    .sort((a, b) => (a.image.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.image.sortOrder ?? Number.MAX_SAFE_INTEGER) || a.index - b.index)
    .map(({ image }) => image);
}

function normalizeVariant(value: unknown, productName: string, assetBaseUrl?: string | null): ProductVariant | null {
  const record = asRecord(value);
  const id = asString(record.id);
  if (!id) return null;
  const attributes = publicVariantAttributes(record);
  const rawData = asRecord(record.raw_data);

  const rawImages = Array.isArray(record.images)
    ? record.images
    : record.image
      ? [typeof record.image === 'string' ? { alt: productName, url: record.image, role: 'variant' } : record.image]
      : (record.image_url || record.image_path)
        ? [{ alt: productName, url: record.image_url ?? record.image_path, role: 'variant' }]
        : [];
  const images = rawImages
    .map((item) => normalizeImage(item, productName, assetBaseUrl))
    .filter((item): item is ProductImage => item !== null);

  return {
    id,
    label: asString(record.label),
    reference: asString(record.reference),
    measure: asString(record.measure),
    dimension: asString(record.dimension ?? record.measure),
    finish: asString(record.finish),
    version: asString(record.version) || asString(asRecord(record.attributes).version) || asString(asRecord(record.attributes).fixed_version) || asString(asRecord(record.raw_data).fixed_version),
    hasLed: asBoolean(record.has_led ?? record.hasLed ?? attributes.has_led),
    lightingType: asString(record.lighting_type ?? record.lightingType ?? attributes.lighting_type),
    lightingTechnology: asString(record.lighting_technology ?? record.lightingTechnology ?? attributes.lighting_technology),
    lightTemp: asString(record.light_temp ?? record.lightTemp ?? record.light_temperature ?? attributes.light_temp ?? rawData.light_temp),
    distribution: asString(record.distribution) || asString(attributes.distribution),
    finishCode: asString(record.finish_code),
    attributes,
    images: images.length > 0 ? [...new Map(images.map((item) => [item.url, item])).values()] : undefined,
    imageMappingStatus: asString(record.image_mapping_status),
    sortOrder: asNumber(record.sort_order),
  };
}

function normalizeCommercialOfferVariant(value: unknown, productName: string, assetBaseUrl?: string | null): CommercialOfferVariant | null {
  const record = asRecord(value);
  const id = asString(record.id);
  if (!id) return null;

  const rawImages = Array.isArray(record.images)
    ? record.images
    : record.image
      ? [typeof record.image === 'string' ? { alt: productName, url: record.image, role: 'offer-variant' } : record.image]
      : (record.image_url || record.image_path)
        ? [{ alt: productName, url: record.image_url ?? record.image_path, role: 'offer-variant' }]
        : [];
  const images = rawImages
    .map((item) => normalizeImage(item, productName, assetBaseUrl))
    .filter((item): item is ProductImage => item !== null);

  return {
    id,
    reference: asString(record.reference),
    finishCode: asString(record.finish_code),
    finishName: asString(record.finish_name),
    images: images.length > 0 ? [...new Map(images.map((item) => [item.url, item])).values()] : undefined,
  };
}

function normalizeCommercialOffer(value: unknown, productName: string, assetBaseUrl?: string | null): CommercialOffer | null {
  const record = asRecord(value);
  const id = asString(record.id);
  if (!id) return null;

  const rawImages = Array.isArray(record.images)
    ? record.images
    : record.image
      ? [typeof record.image === 'string' ? { alt: productName, url: record.image, role: 'offer' } : record.image]
      : (record.image_url || record.image_path)
        ? [{ alt: productName, url: record.image_url ?? record.image_path, role: 'offer' }]
        : [];
  const images = rawImages
    .map((item) => normalizeImage(item, productName, assetBaseUrl))
    .filter((item): item is ProductImage => item !== null);

  return {
    id,
    offerType: asString(record.offer_type),
    variants: Array.isArray(record.variants)
      ? record.variants.map((item) => normalizeCommercialOfferVariant(item, productName, assetBaseUrl)).filter((item): item is CommercialOfferVariant => item !== null)
      : [],
    images: images.length > 0 ? [...new Map(images.map((item) => [item.url, item])).values()] : undefined,
    sortOrder: asNumber(record.sort_order),
  };
}

export function parseDuplachFinishFamilies(value: unknown): DuplachFinishFamily[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const families = value.map((item): DuplachFinishFamily | null => {
    const record = asRecord(item);
    const key = asString(record.key);
    const name = asString(record.name);
    if (!key || !name) return null;
    const finishCount = asNumber(record.finish_count);
    return {
      key,
      name,
      demoImages: asStringArray(record.demo_images),
      ...(finishCount === undefined ? {} : { finishCount }),
    };
  }).filter((item): item is DuplachFinishFamily => item !== null);
  return families.length > 0 ? families : undefined;
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
  const mainImage = normalizeImage({ alt: name, url: record.main_image_url ?? record.main_image_path, role: 'main', sort_order: 0 }, name, config?.asset_base_url);
  const imagesWithMain = mainImage && !images.some((image) => image.url === mainImage.url) ? [mainImage, ...images] : images;
  const uniqueImages = orderImages([...new Map(imagesWithMain.map((item) => [item.url, item])).values()]);
  const specs = publicSpecs(record.specs);
  const hasLed = asBoolean(record.has_led ?? record.hasLed) ?? asBoolean(specs.LED);
  const lightingType = asString(record.lighting_type ?? record.lightingType) || asString(specs['Tipo de iluminación']);
  const lightingTechnology = asString(record.lighting_technology ?? record.lightingTechnology) || asString(specs['Tecnología de iluminación']);
  const lightTemp = asString(record.light_temp ?? record.lightTemp ?? record.light_temperature) || asString(specs['Temperatura de luz']);

  return {
    id,
    name,
    slug,
    brand: asString(record.brand),
    supplierName: asString(record.supplier_name),
    supplierId: asString(record.supplier_id),
    categoryId: asString(record.category_id),
    categoryName: asString(record.category_name),
    model: asString(record.model) || asString(record.model_name) || asString(specs.model) || asString(specs.model_name),
    subcategory: asString(record.subcategory),
    collection: asString(record.collection),
    shape: asString(record.shape) || asString(specs.shape) || asString(specs.Forma),
    description: asString(record.description),
    specs,
    productKind: asString(record.product_kind),
    showPrice: record.show_price === true,
    galleryRule: asString(record.gallery_rule) || asString(asRecord(record.raw_data).gallery_rule) || asString(asRecord(record.specs)['Regla de galería']),
    hasLed,
    lightingType,
    lightingTechnology,
    lightTemp,
    images: uniqueImages,
    mainImageUrl: asString(record.main_image_url),
    mainImagePath: asString(record.main_image_path),
    modularity: asModularity(record.modularity),
    finishFamilies: parseDuplachFinishFamilies(record.specs ? asRecord(record.specs).finish_families : undefined),
    variants: Array.isArray(record.variants)
      ? record.variants.map((item) => normalizeVariant(item, name, config?.asset_base_url)).filter((item): item is ProductVariant => item !== null)
      : [],
    commercialOffers: Array.isArray(record.commercial_offers)
      ? record.commercial_offers.map((item) => normalizeCommercialOffer(item, name, config?.asset_base_url)).filter((item): item is CommercialOffer => item !== null)
      : [],
    availableFinishes: asStringArray(record.available_finishes),
    availableDistributions: asStringArray(record.available_distributions ?? record.distributions),
    availableMeasures: asStringArray(record.available_measures),
    configurationFields: asStringArray(record.configuration_fields),
  };
}

export function normalizeProductCard(value: unknown, config?: CatalogPublicConfig | null): ProductCard | null {
  try {
    const record = asRecord(value);
    const id = asString(record.id);
    const name = asString(record.name);
    const slug = asString(record.slug);
    if (!id || !name || !slug) return null;

    // Fast path: list responses arrive per-card in high volumes, so build the
    // card shape directly instead of running the full detail parser over the
    // whole variants/commercial-offers payload and discarding the result.
    const assetBaseUrl = config?.asset_base_url;
    const specs = publicSpecs(record.specs);
    const gallery = Array.isArray(record.images)
      ? record.images.map((item) => normalizeImage(item, name, assetBaseUrl)).filter((item): item is ProductImage => item !== null)
      : [];
    const mainImage = normalizeImage({ alt: name, url: record.main_image_url ?? record.main_image_path, role: 'main', sort_order: 0 }, name, assetBaseUrl);
    const imagesWithMain = mainImage && !gallery.some((image) => image.url === mainImage.url) ? [mainImage, ...gallery] : gallery;

    return {
      id,
      name,
      slug,
      brand: asString(record.brand),
      images: orderImages([...new Map(imagesWithMain.map((item) => [item.url, item])).values()]),
      showPrice: record.show_price === true,
      categoryId: asString(record.category_id),
      categoryName: asString(record.category_name),
      model: asString(record.model) || asString(record.model_name) || asString(specs.model) || asString(specs.model_name),
      collection: asString(record.collection),
      shape: asString(record.shape) || asString(specs.shape) || asString(specs.Forma),
      finishes: asStringArray(record.available_finishes),
      distributions: asStringArray(record.available_distributions ?? record.distributions),
      measures: asStringArray(record.available_measures),
      productKind: asString(record.product_kind),
      subcategory: asString(record.subcategory),
      supplierId: asString(record.supplier_id),
      supplierName: asString(record.supplier_name),
      mainImageUrl: asString(record.main_image_url),
      mainImagePath: asString(record.main_image_path),
      modularity: asModularity(record.modularity),
      modularNotice: typeof specs.modular_notice === 'string' ? specs.modular_notice : undefined,
      galleryRule: asString(record.gallery_rule) || asString(asRecord(record.raw_data).gallery_rule) || asString(specs['Regla de galería']),
      hasLed: asBoolean(record.has_led ?? record.hasLed) ?? asBoolean(specs.LED),
      lightingType: asString(record.lighting_type ?? record.lightingType) || asString(specs['Tipo de iluminación']),
      lightingTechnology: asString(record.lighting_technology ?? record.lightingTechnology) || asString(specs['Tecnología de iluminación']),
      lightTemp: asString(record.light_temp ?? record.lightTemp ?? record.light_temperature) || asString(specs['Temperatura de luz']),
    };
  } catch {
    return null;
  }
}

export const deriveCatalogFacets = (items: ProductCard[]): CatalogFacets => {
  const facets: CatalogFacets = {};
  for (const key of ['category', 'supplier', 'subcategory', 'collection', 'product_kind', 'shape', 'has_led', 'lighting_type', 'modularity'] as CatalogFacetKey[]) {
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
          case 'shape': return card.shape ? { value: card.shape, label: card.shape } : null;
          case 'has_led': return card.hasLed === undefined ? null : { value: String(card.hasLed), label: card.hasLed ? 'Sí' : 'No' };
          case 'lighting_type': return card.lightingType ? { value: card.lightingType, label: card.lightingType } : null;
          case 'modularity': return card.modularity ? { value: card.modularity, label: card.modularity === 'modular' ? 'Modular' : 'Normal' } : null;
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
  const distributions = new Map<string, CatalogFacetOption>();
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
    for (const distribution of card.distributions || []) {
      const trimmed = distribution?.trim();
      if (!trimmed) continue;
      const existing = distributions.get(trimmed);
      distributions.set(trimmed, { value: trimmed, label: trimmed, count: (existing?.count || 0) + 1 });
    }
  }
  if (finishes.size > 0) facets.finish = [...finishes.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'es'));
  if (distributions.size > 0) facets.distribution = [...distributions.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'es'));
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
  distributions: 'distribution',
  distribution: 'distribution',
  product_kinds: 'product_kind',
  productKinds: 'product_kind',
  product_kind: 'product_kind',
  finishes: 'finish',
  finish: 'finish',
  measures: 'measure',
  measure: 'measure',
  shapes: 'shape',
  shape: 'shape',
  has_led: 'has_led',
  hasLed: 'has_led',
  led: 'has_led',
  lighting_types: 'lighting_type',
  lightingType: 'lighting_type',
  lighting_type: 'lighting_type',
  modularity: 'modularity',
  modularities: 'modularity',
  models: 'model',
  model: 'model',
  textures: 'texture',
  texture: 'texture',
  colors: 'color',
  color: 'color',
  grilles: 'grille',
  grille: 'grille',
  valves: 'valve',
  valve: 'valve',
  orientations: 'orientation',
  orientation: 'orientation',
  finish_families: 'finish_family',
  finishFamilies: 'finish_family',
  finish_family: 'finish_family',
};

function normalizeFacetOption(value: unknown): CatalogFacetOption | null {
  const record = asRecord(value);
  const rawValue = record.value ?? record.id ?? record.key;
  const optionValue = typeof rawValue === 'boolean' || typeof rawValue === 'number'
    ? String(rawValue)
    : asString(rawValue);
  if (!optionValue) return null;

  return {
    value: optionValue,
    label: asString(record.label ?? record.name) || (typeof rawValue === 'boolean' ? rawValue ? 'Sí' : 'No' : optionValue),
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
  const total = asNonNegativeNumber(pagination.total) ?? null;
  const hasMore = typeof pagination.has_more === 'boolean'
    ? pagination.has_more
    : total !== null
      ? (offset ?? 0) + items.length < total
      : items.length >= (limit ?? items.length + 1);

  return {
    items,
    pagination: {
      limit: limit ?? items.length,
      offset: offset ?? 0,
      total,
      has_more: hasMore,
    },
    facets: normalizeFacets(record.facets),
    sort: normalizeSort(record.sort),
    discardedItemCount: record.items.length - items.length || undefined,
  };
}
