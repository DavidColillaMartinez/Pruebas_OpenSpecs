import { describe, expect, it } from 'vitest';
import fixture from '../api/fixtures/gme-kitchen-contract.json';
import { normalizeProductDetail } from './normalize';
import { buildGmeIoGallery, getGmeIoFinishImageUrl, getGmeIoSelectorImages, isGmeIoProduct } from './gmeIo';
import { getSelectableUnits } from './selection';
import { buildQuoteRequestItem } from '../../quote/model/payload';

const products = fixture.products.map((raw) => normalizeProductDetail(raw));

describe('GME kitchen catalogue public-detail contract', () => {
  it('contains eleven models and the 23 exact manufacturer references', () => {
    expect(products).toHaveLength(11);
    const units = products.flatMap(getSelectableUnits);
    expect(units).toHaveLength(23);
    expect(new Set(units.map((unit) => unit.variantId)).size).toBe(23);
    expect(units.map((unit) => unit.variantSnapshot?.reference).sort()).toEqual([
      '3184', '3183', '3185', '3187', '3186', '3142', '3138', '3143', '3181',
      '3144', '3180', '3180NG', '3180OR', '3180CB', '3180T', '3141', '3188',
      '3145', '3140', '3230', '3231', '3137', '3233',
    ].sort());
  });

  it.each(products)('keeps $name cover first, with an image for every finish', (product) => {
    expect(isGmeIoProduct(product)).toBe(true);
    const gallery = buildGmeIoGallery(product);
    const selectors = getGmeIoSelectorImages(product).finish ?? {};
    expect(gallery[0].url).toBe(product.mainImageUrl);
    expect(new Set(gallery.map((image) => image.url)).size).toBe(gallery.length);
    for (const unit of getSelectableUnits(product)) {
      const finish = unit.attributes.finish;
      expect(selectors[finish]?.url).toBeTruthy();
      expect(gallery.some((image) => image.url === selectors[finish].url)).toBe(false);
      const activePhoto = getGmeIoFinishImageUrl(product, finish);
      expect(activePhoto).toBe(unit.images?.[0].url);
      expect(gallery.some((image) => image.url === activePhoto)).toBe(true);
      const line = buildQuoteRequestItem(product, unit, 1);
      expect(line.variantId).toBe(unit.variantId);
      expect(line.reference).toBe(unit.variantSnapshot?.reference);
      expect(line.imageUrl).toBe(activePhoto);
      expect(Object.keys(line.variantSnapshot ?? {}).some((key) => /selector|price|points/i.test(key))).toBe(false);
    }
  });

  it('keeps Silver chrome, the two Osmosis extractable variants and Alexia detail', () => {
    const silver = products.find((product) => product.id === 'gme-cocina-silver')!;
    expect(silver.availableFinishes).toEqual(['Cromo']);
    const osmosis = products.find((product) => product.id === 'gme-cocina-osmosis-extraible')!;
    expect(osmosis.variants.map((variant) => variant.reference).sort()).toEqual(['3230', '3231']);
    const alexia = products.find((product) => product.id === 'gme-cocina-alexia-abatible')!;
    expect(buildGmeIoGallery(alexia)).toHaveLength(2);
  });
});
