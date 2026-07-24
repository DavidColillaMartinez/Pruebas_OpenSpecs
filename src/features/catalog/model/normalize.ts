import type {
  CatalogPublicConfig,
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
      categoryName: product.categoryName,
      supplierName: product.supplierName,
    };
  } catch {
    return null;
  }
}

export function normalizeProductList(value: unknown, config?: CatalogPublicConfig | null): ProductListResponse {
  const record = asRecord(value);
  const pagination = asRecord(record.pagination);
  const items = Array.isArray(record.items)
    ? record.items.map((item) => normalizeProductCard(item, config)).filter((item): item is ProductCard => item !== null)
    : [];

  return {
    items,
    pagination: {
      limit: asNumber(pagination.limit) ?? items.length,
      offset: asNumber(pagination.offset) ?? 0,
      total: asNumber(pagination.total) ?? items.length,
    },
  };
}
