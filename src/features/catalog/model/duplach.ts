import type { DuplachFinishFamily, ProductDetail, ProductImage, ProductVariant } from './types';
import { parseDuplachFinishFamilies, resolveAssetUrl } from './normalize';
import type { SelectableUnit } from './selection';

export const DUPLACH_SUPPLIER_ID = 'duplach';
export const DUPLACH_SHOWER_TRAY_CATEGORY_ID = 'platos-de-ducha';

export const DUPLACH_FILTER_LABELS: Record<string, string> = {
  measure: 'Medida',
  texture: 'Textura',
  color: 'Color',
  grille: 'Rejilla',
  valve: 'Válvula',
  orientation: 'Orientación',
  finish_family: 'Familia de acabado',
  finish: 'Acabado',
};

const SWATCH_PATH_PATTERN = /(?:^|\/)swatches\//i;

function normalizedId(value: unknown): string {
  return String(value ?? '').trim().toLocaleLowerCase();
}

export function isDuplachShowerTrayProduct(product: { supplierId?: string | null; categoryId?: string | null }): boolean {
  return normalizedId(product.supplierId) === DUPLACH_SUPPLIER_ID
    && normalizedId(product.categoryId) === DUPLACH_SHOWER_TRAY_CATEGORY_ID;
}

export function isCatalogDuplachScope(filters: { supplier?: string[]; category?: string[] }): boolean {
  const suppliers = filters.supplier || [];
  const categories = filters.category || [];
  return suppliers.length === 1
    && categories.length === 1
    && normalizedId(suppliers[0]) === DUPLACH_SUPPLIER_ID
    && normalizedId(categories[0]) === DUPLACH_SHOWER_TRAY_CATEGORY_ID;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function stringValues(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];
}

function stringListMap(value: unknown): Record<string, string[]> {
  const record = asRecord(value);
  const entries = Object.entries(record)
    .map(([key, item]): [string, string[]] => [key, Array.isArray(item) ? stringValues(item) : typeof item === 'string' && item.trim() ? [item] : []])
    .filter(([, paths]) => paths.length > 0);
  return Object.fromEntries(entries);
}

export type DuplachColorSwatch = {
  name: string;
  code?: string;
  filename?: string;
};

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function parseDuplachColorSwatches(value: unknown): DuplachColorSwatch[] {
  const colors = Array.isArray(asRecord(value).colors) ? asRecord(value).colors as unknown[] : [];
  return colors.map((item): DuplachColorSwatch | null => {
    const entry = asRecord(item);
    const name = optionalString(entry.name);
    if (!name) return null;
    const code = optionalString(entry.code);
    const filename = optionalString(entry.filename);
    return { name, ...(code ? { code } : {}), ...(filename ? { filename } : {}) };
  }).filter((item): item is DuplachColorSwatch => item !== null);
}

export type DuplachSelectorModel = {
  selectorType: string;
  configurationKeys: string[];
  familyFirst: boolean;
  families: DuplachFinishFamily[];
  familyDemoImages: Record<string, string[]>;
  familyNames: Record<string, string>;
  finishSwatchImages: Record<string, string[]>;
  colorSwatches: DuplachColorSwatch[];
  compactOptions: Record<string, string[]>;
  measureTextures: Record<string, string[]>;
  finishesByFamily: Record<string, string[]>;
};

function compactMeasureOptions(value: unknown): { measures: string[]; textures: Record<string, string[]> } {
  const rows = Array.isArray(value) ? value : [];
  const measures: string[] = [];
  const textures: Record<string, string[]> = {};
  rows.forEach((item) => {
    const row = asRecord(item);
    const length = Number(row.length_cm);
    const width = Number(row.width_cm);
    if (!Number.isFinite(length) || !Number.isFinite(width)) return;
    const measure = `${length}x${width}`;
    if (!measures.includes(measure)) measures.push(measure);
    const allowedTextures = stringValues(row.textures);
    if (allowedTextures.length > 0) textures[measure] = allowedTextures;
  });
  return { measures, textures };
}

function compactFinishOptions(value: unknown): { families: string[]; finishes: Record<string, string[]> } {
  const rows = Array.isArray(value) ? value : [];
  const families: string[] = [];
  const finishes: Record<string, string[]> = {};
  rows.forEach((item) => {
    const row = asRecord(item);
    const family = optionalString(row.family_key);
    const finish = optionalString(row.name);
    if (!family || !finish) return;
    if (!families.includes(family)) families.push(family);
    finishes[family] = finishes[family] || [];
    if (!finishes[family].includes(finish)) finishes[family].push(finish);
  });
  return { families, finishes };
}

export function getDuplachSelectorModel(product: ProductDetail): DuplachSelectorModel {
  const specs = product.specs;
  const families = product.finishFamilies || parseDuplachFinishFamilies(specs.finish_families) || [];
  const measures = compactMeasureOptions(specs.size_options);
  const finishes = compactFinishOptions(specs.finish_options);
  const colorOptions = Array.isArray(specs.color_options)
    ? specs.color_options.map((item) => optionalString(asRecord(item).name)).filter((item): item is string => Boolean(item))
    : [];
  const valve = optionalString(asRecord(specs.valve).type);
  const configurationKeys = product.configurationFields.length > 0
    ? product.configurationFields
    : [...new Set(product.variants.flatMap((variant: ProductVariant) => Object.keys(variant.attributes)))];
  return {
    selectorType: typeof specs.selector_type === 'string' ? specs.selector_type : '',
    configurationKeys,
    familyFirst: configurationKeys.includes('finish_family'),
    families,
    familyDemoImages: stringListMap(specs.family_image_map),
    familyNames: Object.fromEntries(families.map((family) => [family.key, family.name])),
    finishSwatchImages: stringListMap(specs.finish_image_map),
    colorSwatches: parseDuplachColorSwatches(specs.selector_images),
    compactOptions: {
      measure: measures.measures,
      texture: stringValues(specs.texture_options),
      color: colorOptions,
      grille: stringValues(specs.grille_options),
      orientation: stringValues(specs.orientation_options),
      finish_family: finishes.families,
      finish: Object.values(finishes.finishes).flat(),
      ...(valve ? { valve: [valve] } : {}),
    },
    measureTextures: measures.textures,
    finishesByFamily: finishes.finishes,
  };
}

export function getCompactDuplachOptions(model: DuplachSelectorModel, selection: Record<string, string>, key: string): string[] {
  if (key === 'texture' && selection.measure && model.measureTextures[selection.measure]?.length) {
    return model.measureTextures[selection.measure];
  }
  if (key === 'finish') {
    return selection.finish_family ? model.finishesByFamily[selection.finish_family] || [] : [];
  }
  return model.compactOptions[key] || [];
}

export function getDuplachDependentOptions(units: SelectableUnit[], configurationKeys: string[], selection: Record<string, string>, key: string): string[] {
  const keyIndex = configurationKeys.indexOf(key);
  if (keyIndex < 0) return [];
  const higherKeys = configurationKeys.slice(0, keyIndex);
  const values = new Set<string>();
  for (const unit of units) {
    if (!higherKeys.every((higherKey) => selection[higherKey] === undefined || unit.attributes[higherKey] === selection[higherKey])) continue;
    const value = unit.attributes[key];
    if (value) values.add(value);
  }
  return [...values];
}

export function findCompleteDuplachUnit(units: SelectableUnit[], selection: Record<string, string>, configurationKeys: string[]): SelectableUnit | null {
  if (configurationKeys.some((key) => selection[key] === undefined || selection[key] === '')) return null;
  return units.find((unit) => configurationKeys.every((key) => unit.attributes[key] === selection[key])) ?? null;
}

function resolvedImages(paths: string[] | undefined, productName: string, label: string, assetBaseUrl?: string | null): ProductImage[] {
  const images = stringValues(paths)
    .map((path) => resolveAssetUrl(path, assetBaseUrl))
    .filter((url): url is string => Boolean(url));
  return [...new Map(images.map((url) => [url, { url, alt: `${productName}, ${label}`, role: 'variant' }])).values()];
}

export function getDuplachColorSwatchImage(model: DuplachSelectorModel, colorValue: string, assetBaseUrl?: string | null): ProductImage | undefined {
  const swatch = model.colorSwatches.find((entry) => entry.name === colorValue)
    ?? model.colorSwatches.find((entry) => entry.code !== undefined && entry.code === colorValue);
  if (!swatch?.filename) return undefined;
  const url = resolveAssetUrl(swatch.filename, assetBaseUrl);
  return url ? { url, alt: swatch.name, role: 'swatch' } : undefined;
}

export function getDuplachFinishSwatchImage(model: DuplachSelectorModel, familyKey: string, finish: string, assetBaseUrl?: string | null): ProductImage | undefined {
  return resolvedImages(model.finishSwatchImages[`${familyKey}:${finish}`], finish, finish, assetBaseUrl)[0];
}

export function getDuplachFamilyImages(product: ProductDetail, model: DuplachSelectorModel, familyKey: string, assetBaseUrl?: string | null): ProductImage[] {
  const family = model.families.find((item) => item.key === familyKey);
  const paths = model.familyDemoImages[familyKey]?.length ? model.familyDemoImages[familyKey] : family?.demoImages || [];
  return resolvedImages(paths, product.name, `Familia ${family?.name || familyKey}`, assetBaseUrl);
}

export function buildDuplachProductGallery(
  product: ProductDetail,
  unit: SelectableUnit | null,
  options: { manualSelection: boolean; assetBaseUrl?: string | null },
): ProductImage[] {
  const gallery = product.images;
  if (!unit || !options.manualSelection) return gallery;
  const selectionMap = stringListMap(product.specs.selection_image_map);
  const finishMap = stringListMap(product.specs.finish_image_map);
  const colorMap = stringListMap(product.specs.color_image_map);
  const selectionKeys = [
    [unit.attributes.texture, unit.attributes.color].filter(Boolean).join(':'),
    [unit.attributes.finish_family, unit.attributes.finish].filter(Boolean).join(':'),
  ].filter(Boolean);
  const compactPath = selectionKeys.flatMap((key) => selectionMap[key] || [])[0]
    || (unit.attributes.finish_family && unit.attributes.finish
      ? finishMap[`${unit.attributes.finish_family}:${unit.attributes.finish}`]?.[0]
      : undefined)
    || (unit.attributes.color ? colorMap[unit.attributes.color]?.[0] : undefined);
  const rawPath = typeof unit.attributes.image_path === 'string' ? unit.attributes.image_path.trim() : compactPath || '';
  if (!rawPath || SWATCH_PATH_PATTERN.test(rawPath)) return gallery;
  const url = resolveAssetUrl(rawPath, options.assetBaseUrl);
  if (!url) return gallery;
  return [{ url, alt: product.name, role: 'variant' }, ...gallery.filter((image) => image.url !== url)];
}
