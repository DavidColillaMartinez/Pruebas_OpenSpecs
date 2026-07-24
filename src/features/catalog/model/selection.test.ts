import { describe, expect, it } from 'vitest';
import alba from '../api/fixtures/product-detail.mt-espejos-alba.json';
import royo from '../api/fixtures/product-detail.royo-alfa-compact-100.json';
import { normalizeProductDetail } from './normalize';
import { findMatchingUnit, getAttributeOptions, getSelectableUnits, selectInitialUnit } from './selection';

describe('catalog variant selection', () => {
  it('uses the first real Alba variant without generating combinations', () => {
    const product = normalizeProductDetail(alba);
    const units = getSelectableUnits(product);

    expect(units).toHaveLength(4);
    expect(selectInitialUnit(units)?.variantId).toBe('mt-espejos-alba--v0001');
    expect(getAttributeOptions(units, units[0].attributes).dimension).toEqual(['Ø60', 'Ø70', 'Ø80', 'Ø100']);
  });

  it('keeps commercial offer variant IDs persistent', () => {
    const product = normalizeProductDetail(royo);
    const units = getSelectableUnits(product);
    const initial = selectInitialUnit(units);

    expect(units.length).toBeGreaterThan(product.variants.length);
    expect(initial?.commercialOfferVariantId).toContain('--offer001--v0001');
    expect(findMatchingUnit(units, initial?.attributes || {})).toMatchObject({ commercialOfferVariantId: initial?.commercialOfferVariantId });
  });

  it('removes incompatible values instead of creating impossible combinations', () => {
    const product = normalizeProductDetail({
      id: 'paired',
      name: 'Paired',
      slug: 'paired',
      variants: [
        { id: 'paired-a', dimension: 'A', finish: 'Rojo', reference: 'A1' },
        { id: 'paired-b', dimension: 'B', finish: 'Azul', reference: 'B1' },
      ],
    });
    const units = getSelectableUnits(product);

    expect(getAttributeOptions(units, { finish: 'Rojo' }).dimension).toEqual(['A']);
    expect(findMatchingUnit(units, { finish: 'Rojo', dimension: 'B' })).toBeNull();
  });
});
