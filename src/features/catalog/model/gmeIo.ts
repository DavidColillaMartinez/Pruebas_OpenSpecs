import { resolveAssetUrl } from './normalize';
import type { ProductCard, ProductDetail, ProductImage, ProductSpecs } from './types';

export type GmeIoScope = Pick<ProductDetail, 'supplierId' | 'categoryId' | 'specs'>;

export function isGmeIoProduct(product: GmeIoScope): boolean {
  return product.supplierId?.toLocaleLowerCase() === 'gme'
    && product.categoryId?.toLocaleLowerCase() === 'griferia'
    && product.specs?.gme_io_2026 === true;
}

export function isGmeIoCard(card: Pick<ProductCard, 'supplierId' | 'categoryId' | 'io2026'>): boolean {
  return card.supplierId?.toLocaleLowerCase() === 'gme'
    && card.categoryId?.toLocaleLowerCase() === 'griferia'
    && card.io2026 === true;
}

// finish first: compatibility checks over earlier axes must guard against
// combinations that do not exist in variants[].
const IO_SELECTION_KEYS = ['finish', 'tap_type', 'installation', 'mechanism'] as const;
export type GmeIoSelectionKey = typeof IO_SELECTION_KEYS[number];

const IO_ATTRIBUTE_LABELS: Record<GmeIoSelectionKey, string> = {
  tap_type: 'Tipo de grifo',
  finish: 'Acabado',
  installation: 'Instalación',
  mechanism: 'Mecanismo',
};

function ioAttributeValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

export type GmeIoSelectorImages = Partial<Record<GmeIoSelectionKey, Record<string, ProductImage>>>;

function selectorImageFrom(value: unknown, alt: string, assetBaseUrl?: string | null): ProductImage | null {
  if (typeof value === 'string') {
    const url = resolveAssetUrl(value, assetBaseUrl);
    return url ? { alt, url } : null;
  }
  const record = value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
  const url = resolveAssetUrl(record?.url ?? record?.selector_image_url ?? (typeof record?.path === 'string' ? record.path : undefined), assetBaseUrl);
  return url ? { alt, url } : null;
}

// Selector swatches come only from API selector metadata; they are never gallery
// photos and never map back onto the commercial finish identifier.
export function getGmeIoSelectorImages(product: ProductDetail, assetBaseUrl?: string | null): GmeIoSelectorImages {
  const result: { finish: Record<string, ProductImage>; tap_type: Record<string, ProductImage> } = { finish: {}, tap_type: {} };

  product.variants.forEach((variant) => {
    const variantImage = selectorImageFrom(variant.attributes?.selector_image_url, product.name, assetBaseUrl);
    const finish = ioAttributeValue(variant.finish) ?? ioAttributeValue(variant.attributes?.finish);
    if (finish && variantImage && !result.finish[finish]) result.finish[finish] = variantImage;
  });

  const finishOptions = Array.isArray(product.specs?.finish_options) ? product.specs?.finish_options : [];
  finishOptions.forEach((option) => {
    const record = option as Record<string, unknown>;
    const name = ioAttributeValue(record.name) ?? ioAttributeValue(record.value);
    const image = selectorImageFrom(record.selector_image_url ?? record, product.name, assetBaseUrl);
    if (name && image && !result.finish[name]) result.finish[name] = image;
  });

  const tapTypeOptions = Array.isArray(product.specs?.tap_type_options) ? product.specs?.tap_type_options : [];
  tapTypeOptions.forEach((option) => {
    const record = option as Record<string, unknown>;
    const name = ioAttributeValue(record.name) ?? ioAttributeValue(record.value);
    const image = selectorImageFrom(record.selector_image_url ?? record, product.name, assetBaseUrl);
    if (name && image && !result.tap_type[name]) result.tap_type[name] = image;
  });

  return result;
}

export type GmeIoGalleryImages = { images: ProductImage[]; selectorUrls: Set<string> };

function gmeIoSelectorUrls(product: ProductDetail, assetBaseUrl?: string | null): Set<string> {
  const urls = new Set<string>();
  const collect = (value: unknown, alt: string) => {
    const image = selectorImageFrom(value, alt, assetBaseUrl);
    if (image) urls.add(image.url);
  };
  collect(product.specs?.selector_images, product.name);
  ([product.specs?.tap_type_options, product.specs?.finish_options] as unknown[]).forEach((list) => {
    if (!Array.isArray(list)) return;
    list.forEach((option) => collect((option as Record<string, unknown>).selector_image_url, product.name));
  });
  product.variants.forEach((variant) => collect(variant.attributes?.selector_image_url, product.name));
  return urls;
}

function collectProductImages(value: unknown, productName: string, assetBaseUrl?: string | null, seenUrls?: Set<string>): ProductImage[] {
  const seen = seenUrls;
  const push = (image: ProductImage | null): ProductImage | null => {
    if (image && (!seen || !seen.has(image.url))) {
      seen?.add(image.url);
      return image;
    }
    return null;
  };
  if (typeof value === 'string') return [push(selectorImageFrom(value, productName, assetBaseUrl))].filter((item): item is ProductImage => item !== null);
  if (Array.isArray(value)) return value.flatMap((item) => collectProductImages(item, productName, assetBaseUrl, seen));
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.values(value as Record<string, unknown>).flatMap((item) => collectProductImages(item, productName, assetBaseUrl, seen));
  }
  return [];
}

// Full IO gallery: cover first, then product images, then every variant's large
// photos, deduplicated by URL. Selector swatches are excluded by URL.
export function buildGmeIoGallery(product: ProductDetail, assetBaseUrl?: string | null): ProductImage[] {
  const selectorUrls = gmeIoSelectorUrls(product, assetBaseUrl);
  const ordered: ProductImage[] = [];
  const seen = new Set<string>();
  const push = (image: ProductImage | null | undefined) => {
    if (!image || seen.has(image.url) || selectorUrls.has(image.url)) return;
    seen.add(image.url);
    ordered.push(image);
  };

  const mainImage = resolveAssetUrl(product.mainImageUrl ?? product.mainImagePath, assetBaseUrl);
  push(mainImage ? { alt: product.name, url: mainImage, role: 'main' } : product.images[0]);
  product.images.forEach((image) => {
    if (!mainImage || image.url !== mainImage) push(image);
  });
  product.variants.forEach((variant) => (variant.images ?? []).forEach(push));

  const finishUrls = collectProductImages(product.specs?.finish_image_urls, product.name, assetBaseUrl);
  finishUrls.forEach(push);

  return ordered;
}

// Large photo for a manually selected finish: the selected variant's own photo
// first, then any other variant photo of the same finish, then the API's
// per-finish fallback keyed by the exact finish name. Never a selector swatch;
// undefined keeps the current image.
export function getGmeIoFinishImageUrl(product: ProductDetail, finish: string | undefined, assetBaseUrl?: string | null): string | undefined {
  const finishName = ioAttributeValue(finish)?.toLocaleLowerCase();
  if (!finishName) return undefined;
  const selectorUrls = gmeIoSelectorUrls(product, assetBaseUrl);
  const candidates = product.variants
    .filter((variant) => ((ioAttributeValue(variant.finish) ?? ioAttributeValue(variant.attributes?.finish)) || '').toLocaleLowerCase() === finishName)
    .flatMap((variant) => variant.images ?? []);
  const fromVariant = candidates.find((image) => !selectorUrls.has(image.url))?.url;
  if (fromVariant) return fromVariant;
  const fallbackMap = product.specs?.finish_image_urls;
  if (fallbackMap && typeof fallbackMap === 'object' && !Array.isArray(fallbackMap)) {
    const entry = Object.entries(fallbackMap as Record<string, unknown>).find(([key]) => key.toLocaleLowerCase() === finishName)
      ?? Object.entries(fallbackMap as Record<string, unknown>).find(([key]) => key.toLocaleLowerCase().replace(/_/g, ' ') === finishName.replace(/_/g, ' '));
    if (entry) {
      const image = selectorImageFrom(entry[1], product.name, assetBaseUrl);
      if (image && !selectorUrls.has(image.url)) return image.url;
    }
  }
  return undefined;
}

const IO_VALUE_LABELS: Record<string, string> = {
  lavabo_bajo: 'Grifo bajo',
  lavabo_alto: 'Grifo alto',
  bide: 'Bidé',
  vista: 'Vista',
  empotrable: 'Empotrable',
  columna: 'Columna',
  monomando: 'Monomando',
  termostatico: 'Termostático',
};

// Buttons show friendly names for technical API values; finish names arrive
// commercial already ("Níquel", "Oro") and pass through unchanged.
export function getGmeIoValueLabel(key: string, value: string): string {
  if (key === 'finish') return value;
  return IO_VALUE_LABELS[value.toLocaleLowerCase()] ?? value.replace(/_/g, ' ').replace(/^./, (first) => first.toLocaleUpperCase());
}

export type GmeIoFact = { key: GmeIoSelectionKey; label: string; value: string };

// Axes with a single possible value become facts, not buttons: installation and
// mechanism describe this shower product and must not invent cross-product
// combinations.
export function getGmeIoFacts(product: ProductDetail): GmeIoFact[] {
  const variants = product.variants;
  return IO_SELECTION_KEYS.flatMap((key) => {
    const distinct = [...new Set(variants
      .map((variant) => ioAttributeValue(variant.attributes?.[key])) // variant-level
      .filter(Boolean))] as string[];
    const specValue = ioAttributeValue(product.specs?.[key]) ?? ioAttributeValue((product.specs?.[key] as Record<string, unknown> | undefined)?.[key === 'mechanism' ? 'type' : 'value']);
    if (distinct.length === 1) return [{ key, label: IO_ATTRIBUTE_LABELS[key], value: distinct[0] }];
    if (distinct.length === 0 && specValue && key !== 'finish') return [{ key, label: IO_ATTRIBUTE_LABELS[key], value: specValue }];
    return [];
  });
}

export function getGmeIoSelectionKeys(product: ProductDetail): GmeIoSelectionKey[] {
  const facts = new Set(getGmeIoFacts(product).map((fact) => fact.key));
  return IO_SELECTION_KEYS.filter((key) => !facts.has(key) && product.variants.some((variant) => ioAttributeValue(variant.attributes?.[key])));
}

export type { ProductSpecs };
