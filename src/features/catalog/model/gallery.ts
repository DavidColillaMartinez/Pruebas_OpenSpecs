import type { ProductDetail, ProductImage } from './types';
import { isRoyoFurnitureScope } from './royo';
import type { SelectableUnit } from './selection';

function apiUrl(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function imageValues(value: unknown): unknown[] {
  const values = Array.isArray(value) ? value : value === undefined || value === null ? [] : [value];
  return values.flatMap((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return [item];
    const record = item as Record<string, unknown>;
    return record.url || record.path ? [record.url ?? record.path] : [];
  });
}

function toImages(values: unknown[], product: ProductDetail, label: string): ProductImage[] {
  return values.map((value): ProductImage | null => {
    const url = apiUrl(value);
    return url ? { url, alt: `${product.name}, ${label}`, role: 'variant' } : null;
  }).filter((image): image is ProductImage => image !== null);
}

function mappedImages(mapValue: unknown, product: ProductDetail, label: string): ProductImage[] {
  return toImages(imageValues(mapValue), product, label);
}

function finishMapImages(product: ProductDetail, unit: SelectableUnit | null): ProductImage[] {
  if (!unit) return [];
  const finish = unit.attributes.finish || unit.attributes.furniture_finish;
  if (!finish) return [];
  const map = product.specs.finish_image_map;
  if (!map || typeof map !== 'object' || Array.isArray(map)) return [];
  const mapped = (map as Record<string, unknown>)[finish];
  return mappedImages(mapped, product, finish);
}

function typeMapImages(product: ProductDetail, unit: SelectableUnit | null): ProductImage[] {
  if (!unit) return [];
  const type = unit.attributes.presentation_type || unit.attributes.furniture_type || unit.attributes.module_type || unit.attributes.type;
  const finish = unit.attributes.finish || unit.attributes.furniture_finish;
  if (!type) return [];
  const map = product.specs.type_image_map;
  if (!map || typeof map !== 'object' || Array.isArray(map)) return [];
  const typeValue = (map as Record<string, unknown>)[type];
  if (typeValue && typeof typeValue === 'object' && !Array.isArray(typeValue) && finish) {
    const finishValue = (typeValue as Record<string, unknown>)[finish];
    if (finishValue !== undefined) return mappedImages(finishValue, product, `${type}, ${finish}`);
  }
  return mappedImages(typeValue, product, type);
}

export function buildRoyoProductGallery(product: ProductDetail, unit: SelectableUnit | null): ProductImage[] {
  if (!isRoyoFurnitureScope({ supplierId: product.supplierId, categoryId: product.categoryId })) return product.images;
  const quickImages = unit?.images?.length ? unit.images : [...finishMapImages(product, unit), ...typeMapImages(product, unit)];
  if (quickImages.length === 0) return product.images;
  return [...new Map([...quickImages, ...product.images].map((image) => [image.url, image])).values()];
}
