import { describe, expect, it } from 'vitest';
import { normalizeProductDetail, normalizeProductList } from './normalize';
import { getSelectableUnits, selectInitialUnit } from './selection';
import {
  buildDuplachProductGallery,
  findCompleteDuplachUnit,
  getDuplachDependentOptions,
  getDuplachFamilyImages,
  getDuplachSelectorModel,
  getDuplachSwatchImage,
  isCatalogDuplachScope,
  isDuplachShowerTrayProduct,
} from './duplach';
import { duplachStonePlusFixture, duplachStone3dFixture, duplachListFacetsFixture } from '../api/fixtures/duplach-platos-contract';

const ASSET_BASE_URL = 'https://assets.example/catalogo';

function plusProduct() {
  return normalizeProductDetail(duplachStonePlusFixture(), {
    catalog_version: 'test',
    api_contract_version: 'catalog-api-v1',
    asset_base_url: ASSET_BASE_URL,
    source_catalog_base_url: ASSET_BASE_URL,
    database_ready_for_public_api: true,
  });
}

function threeDProduct() {
  return normalizeProductDetail(duplachStone3dFixture(), {
    catalog_version: 'test',
    api_contract_version: 'catalog-api-v1',
    asset_base_url: ASSET_BASE_URL,
    source_catalog_base_url: ASSET_BASE_URL,
    database_ready_for_public_api: true,
  });
}

describe('duplach scope guards', () => {
  it('activates only for the exact supplier and shower-tray category', () => {
    expect(isCatalogDuplachScope({ supplier: ['duplach'], category: ['platos-de-ducha'] })).toBe(true);
    expect(isCatalogDuplachScope({ supplier: ['Duplach'], category: ['Platos-de-Ducha'] })).toBe(true);
    expect(isCatalogDuplachScope({ supplier: ['duplach'] })).toBe(false);
    expect(isCatalogDuplachScope({ category: ['platos-de-ducha'] })).toBe(false);
    expect(isCatalogDuplachScope({ supplier: ['duplach', 'royo'], category: ['platos-de-ducha'] })).toBe(false);
    expect(isCatalogDuplachScope({ supplier: ['duplach'], category: ['muebles-y-lavabos'] })).toBe(false);
    expect(isCatalogDuplachScope({ supplier: ['royo'], category: ['muebles-y-lavabos'] })).toBe(false);
  });

  it('identifies only exact duplach shower-tray products', () => {
    expect(isDuplachShowerTrayProduct({ supplierId: 'duplach', categoryId: 'platos-de-ducha' })).toBe(true);
    expect(isDuplachShowerTrayProduct({ supplierId: 'duplach', categoryId: 'mamparas' })).toBe(false);
    expect(isDuplachShowerTrayProduct({ supplierId: 'royo', categoryId: 'platos-de-ducha' })).toBe(false);
    expect(isDuplachShowerTrayProduct({ supplierId: 'manillons-torrent', categoryId: 'espejos' })).toBe(false);
  });
});

describe('duplach normalization', () => {
  it('preserves API attributes, image maps and finish families without inventing values', () => {
    const product = plusProduct();
    expect(product.variants[0].reference).toBeUndefined();
    expect(product.variants[0].attributes).toMatchObject({
      color: 'Antracita',
      texture: 'Liso',
      grille: 'Acero inoxidable',
      color_code: 'RAL 7011',
      valve_type: 'Sifón',
      image_path: 'images/duplach_platos/stone-plus/gallery-1.webp',
    });
    expect(product.specs.color_image_map).toEqual({
      Antracita: ['images/duplach_platos/stone-plus/gallery-1.webp'],
      Blanco: ['images/duplach_platos/stone-plus/cover.webp'],
    });
    expect(product.finishFamilies).toBeUndefined();

    const stone3d = threeDProduct();
    expect(stone3d.finishFamilies).toEqual([
      { key: 'maderas-naturales', name: 'Maderas naturales', demoImages: ['images/duplach_platos/stone-3d/maderas-naturales/demo-1.webp', 'images/duplach_platos/stone-3d/maderas-naturales/demo-2.webp'], finishCount: 2 },
      { key: 'cementos-metales-oxidos', name: 'Cementos, metales y óxidos', demoImages: ['images/duplach_platos/stone-3d/cementos-metales-oxidos/demo-1.webp'], finishCount: 1 },
    ]);
    expect(stone3d.variants[0].attributes).toMatchObject({ finish_family: 'maderas-naturales', finish_family_name: 'Maderas naturales', finish: 'Roble' });
  });

  it('excludes price-like fields from specs and variant attributes', () => {
    const priceKey = /(?:price|precio|importe|cost|coste)/i;
    const product = plusProduct();
    expect(Object.keys(product.specs).some((key) => priceKey.test(key))).toBe(false);
    expect(Object.keys(product.variants[0].attributes).some((key) => priceKey.test(key))).toBe(false);
    expect(product.showPrice).toBe(false);
  });

  it('normalizes the duplach server facets delivered by the list response', () => {
    const response = normalizeProductList(duplachListFacetsFixture);
    expect(response.facets.model).toEqual([
      { value: 'duplach-stone-plus', label: 'Stone Plus', count: 1 },
      { value: 'duplach-stone-zeus', label: 'Stone Zeus', count: 1 },
      { value: 'duplach-stone-3d', label: 'Stone 3D', count: 1 },
    ]);
    expect(response.facets.finish_family?.[0]).toEqual({ value: 'maderas-naturales', label: 'Maderas naturales', count: 1 });
    expect(response.facets.texture?.map((option) => option.value)).toEqual(['Liso', 'Pizarra']);
    expect(response.facets.valve?.[0]?.value).toBe('Sifón');
    expect(response.facets.grille).toBeDefined();
    expect(response.facets.orientation).toBeDefined();
    expect(response.facets.color).toBeDefined();
    expect(response.facets.finish).toBeDefined();
  });
});

describe('duplach dependent selection model', () => {
  it('derives options from real variants and hides incompatible dependents', () => {
    const product = plusProduct();
    const units = getSelectableUnits(product);
    const keys = product.configurationFields;
    expect(getDuplachDependentOptions(units, keys, {}, 'texture').sort()).toEqual(['Liso', 'Pizarra']);
    expect(getDuplachDependentOptions(units, keys, { measure: '100x100' }, 'texture')).toEqual(['Pizarra']);
    expect(getDuplachDependentOptions(units, keys, { measure: '70x70' }, 'texture').sort()).toEqual(['Liso', 'Pizarra']);
    expect(getDuplachDependentOptions(units, keys, { measure: '70x70', texture: 'Liso' }, 'color').sort()).toEqual(['Antracita', 'Blanco']);
    expect(getDuplachDependentOptions(units, keys, { measure: '70x70', texture: 'Pizarra' }, 'color')).toEqual(['Antracita']);
  });

  it('only completes real variant identities and never synthetic combinations', () => {
    const product = plusProduct();
    const units = getSelectableUnits(product);
    const keys = product.configurationFields;
    expect(findCompleteDuplachUnit(units, { measure: '70x70', texture: 'Liso', color: 'Antracita', grille: 'Acero inoxidable' }, keys)?.variantId).toBe('duplach-stone-plus--v00001');
    expect(findCompleteDuplachUnit(units, { measure: '70x70', texture: 'Liso', color: 'Antracita', grille: 'Color' }, keys)).toBeNull();
    expect(findCompleteDuplachUnit(units, { measure: '100x100', texture: 'Liso' }, keys)).toBeNull();
    expect(findCompleteDuplachUnit(units, { measure: '100x100' }, keys)).toBeNull();
  });

  it('keeps Stone 3D family-first with finishes scoped to the active family', () => {
    const product = threeDProduct();
    const model = getDuplachSelectorModel(product);
    const units = getSelectableUnits(product);
    const keys = product.configurationFields;
    expect(model.familyFirst).toBe(true);
    expect(getDuplachDependentOptions(units, keys, { measure: '70x70' }, 'finish_family').sort()).toEqual(['cementos-metales-oxidos', 'maderas-naturales']);
    expect(getDuplachDependentOptions(units, keys, { measure: '70x70', finish_family: 'maderas-naturales' }, 'finish').sort()).toEqual(['Olivo', 'Roble']);
    expect(getDuplachDependentOptions(units, keys, { measure: '70x70', finish_family: 'cementos-metales-oxidos' }, 'finish')).toEqual(['Cemento 01']);
    expect(findCompleteDuplachUnit(units, { measure: '70x70' }, keys)).toBeNull();
  });
});

describe('duplach gallery composer', () => {
  it('keeps the API cover first and the complete gallery before any manual change', () => {
    const product = plusProduct();
    const units = getSelectableUnits(product);
    const gallery = buildDuplachProductGallery(product, selectInitialUnit(units), { manualSelection: false, assetBaseUrl: ASSET_BASE_URL });
    expect(gallery.map((image) => image.url)).toEqual(product.images.map((image) => image.url));
    expect(gallery[0].url).toBe(`${ASSET_BASE_URL}/images/duplach_platos/stone-plus/cover.webp`);
  });

  it('prepends the API-associated quick image only on manual selection, keeping and deduplicating the originals', () => {
    const product = plusProduct();
    const units = getSelectableUnits(product);
    const blanco = units.find((unit) => unit.attributes.color === 'Blanco' && unit.attributes.texture === 'Liso');
    const gallery = buildDuplachProductGallery(product, blanco ?? null, { manualSelection: true, assetBaseUrl: ASSET_BASE_URL });
    expect(gallery[0].url).toBe(`${ASSET_BASE_URL}/images/duplach_platos/stone-plus/cover.webp`);
    expect(gallery).toHaveLength(product.images.length);
    const antracita = units.find((unit) => unit.variantId === 'duplach-stone-plus--v00001');
    const withQuick = buildDuplachProductGallery(product, antracita ?? null, { manualSelection: true, assetBaseUrl: ASSET_BASE_URL });
    expect(withQuick[0].url).toBe(`${ASSET_BASE_URL}/images/duplach_platos/stone-plus/gallery-1.webp`);
    expect(withQuick).toHaveLength(product.images.length);
    expect(new Set(withQuick.map((image) => image.url)).size).toBe(withQuick.length);
  });

  it('preserves the original gallery when a selected option has no quick image', () => {
    const product = plusProduct();
    const units = getSelectableUnits(product);
    const withoutPath = { ...units[0], attributes: { ...units[0].attributes, image_path: '' } };
    const gallery = buildDuplachProductGallery(product, withoutPath, { manualSelection: true, assetBaseUrl: ASSET_BASE_URL });
    expect(gallery.map((image) => image.url)).toEqual(product.images.map((image) => image.url));
  });

  it('never promotes swatches and keeps Stone 3D family demos out of the main gallery', () => {
    const product = threeDProduct();
    const units = getSelectableUnits(product);
    const gallery = buildDuplachProductGallery(product, selectInitialUnit(units), { manualSelection: true, assetBaseUrl: ASSET_BASE_URL });
    expect(gallery.map((image) => image.url)).toEqual(product.images.map((image) => image.url));
    expect(gallery.some((image) => image.url.includes('/swatches/'))).toBe(false);

    const model = getDuplachSelectorModel(product);
    const familyImages = getDuplachFamilyImages(product, model, 'maderas-naturales', ASSET_BASE_URL);
    expect(familyImages.map((image) => image.url)).toEqual([
      `${ASSET_BASE_URL}/images/duplach_platos/stone-3d/maderas-naturales/demo-1.webp`,
      `${ASSET_BASE_URL}/images/duplach_platos/stone-3d/maderas-naturales/demo-2.webp`,
    ]);
    expect(product.images.every((image) => !familyImages.some((family) => family.url === image.url))).toBe(true);
  });

  it('uses API swatch images for colors and finishes when associated', () => {
    const plus = plusProduct();
    const plusModel = getDuplachSelectorModel(plus);
    expect(getDuplachSwatchImage(plusModel, 'Antracita', ASSET_BASE_URL)?.url).toBe(`${ASSET_BASE_URL}/images/duplach_platos/stone-plus/gallery-1.webp`);
    expect(getDuplachSwatchImage(plusModel, 'SinImagen', ASSET_BASE_URL)).toBeUndefined();

    const stone3d = threeDProduct();
    const stone3dModel = getDuplachSelectorModel(stone3d);
    expect(getDuplachSwatchImage(stone3dModel, 'maderas-naturales:Roble', ASSET_BASE_URL)?.url).toBe(`${ASSET_BASE_URL}/images/duplach_platos/stone-3d/swatches/maderas-naturales/duplach-stone-3d-maderas-naturales-roble.webp`);
  });
});
