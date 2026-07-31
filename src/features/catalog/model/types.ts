export type PublicAttributes = Record<string, string | number | boolean>;

export type ProductImage = {
  alt: string;
  url: string;
  role?: string;
  width?: number;
  height?: number;
  sortOrder?: number;
};

export type ProductVariant = {
  id: string;
  reference?: string;
  dimension?: string;
  finish?: string;
  version?: string;
  distribution?: string;
  finishCode?: string;
  attributes: PublicAttributes;
  images?: ProductImage[];
  sortOrder?: number;
};

export type CommercialOfferVariant = {
  id: string;
  reference?: string;
  finishCode?: string;
  finishName?: string;
  images?: ProductImage[];
};

export type CommercialOffer = {
  id: string;
  offerType?: string;
  variants: CommercialOfferVariant[];
  images?: ProductImage[];
  sortOrder?: number;
};

export type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  brand?: string;
  supplierName?: string;
  supplierId?: string;
  categoryId?: string;
  categoryName?: string;
  subcategory?: string;
  collection?: string;
  description?: string;
  specs: Record<string, string | number | boolean>;
  productKind?: string;
  showPrice: boolean;
  galleryRule?: string;
  images: ProductImage[];
  variants: ProductVariant[];
  commercialOffers: CommercialOffer[];
  availableFinishes: string[];
  availableDistributions: string[];
  availableMeasures: string[];
  configurationFields: string[];
};

export type ProductCard = Pick<ProductDetail, 'id' | 'name' | 'slug' | 'brand' | 'images' | 'showPrice'> & {
  categoryId?: string;
  categoryName?: string;
  collection?: string;
  finishes?: string[];
  distributions?: string[];
  measures?: string[];
  productKind?: string;
  subcategory?: string;
  galleryRule?: string;
  supplierId?: string;
  supplierName?: string;
};

export const CATALOG_FACET_KEYS = [
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
] as const;

export type CatalogFacetKey = typeof CATALOG_FACET_KEYS[number];

export type CatalogFacetOption = {
  value: string;
  label: string;
  count: number;
};

export type CatalogFacets = Partial<Record<CatalogFacetKey, CatalogFacetOption[]>>;

export type CatalogSortValue = 'relevance' | 'name_asc' | 'name_desc' | 'recent' | 'new' | 'best_selling';

export type CatalogSortMetadata = {
  applied?: CatalogSortValue;
  supported: CatalogSortValue[];
};

export type CatalogQueryValue = string | number | boolean | string[] | undefined;

export type CatalogRequestParams = Record<string, CatalogQueryValue>;

export type ProductListResponse = {
  items: ProductCard[];
  pagination: { limit: number; offset: number; total: number };
  facets: CatalogFacets;
  sort: CatalogSortMetadata;
  discardedItemCount?: number;
};

export type CatalogPublicConfig = {
  catalog_version: string | null;
  api_contract_version: string | null;
  asset_base_url: string | null;
  source_catalog_base_url: string | null;
  database_ready_for_public_api: boolean;
};

export type VariantSnapshot = Record<string, string | number | boolean | undefined>;

export type SelectedProductUnit = {
  productId: string;
  variantId?: string;
  commercialOfferVariantId?: string;
  quantity: number;
  productName: string;
  variantSnapshot?: VariantSnapshot;
};
