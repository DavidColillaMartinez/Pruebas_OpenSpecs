import { describe, expect, it } from 'vitest';
import alba from '../api/fixtures/product-detail.mt-espejos-alba.json';
import royo from '../api/fixtures/product-detail.royo-alfa-compact-100.json';
import { normalizeProductDetail } from './normalize';
import { findEnclosureUnit, findMatchingUnit, getAttributeOptions, getEnclosureAttributeOptions, getSelectableUnits, selectCompatibleUnit, selectEnclosureFinish, selectInitialUnit } from './selection';

describe('catalog variant selection', () => {
  it('uses the first real Alba variant without generating combinations', () => {
    const product = normalizeProductDetail(alba);
    const units = getSelectableUnits(product);

    expect(units).toHaveLength(16);
    expect(selectInitialUnit(units)?.variantId).toBe('mt-espejos-alba--v0001');
    expect(getAttributeOptions(units, units[0].attributes).dimension).toEqual(['Ø 60', 'Ø 70', 'Ø 80', 'Ø 100']);
    expect(units[0].variantSnapshot).toMatchObject({ has_led: false, lighting_type: 'Sin luz', lighting_technology: 'Sin LED' });
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

  it('keeps real dimension, finish and version combinations with sort-order fallback', () => {
    const product = normalizeProductDetail({
      id: 'mt-espejos-retro',
      name: 'Retro',
      slug: 'mt-espejos-retro',
      supplier_id: 'manillons-torrent',
      category_id: 'espejos',
      variants: [
        { id: 'retro-basic-small', dimension: 'Ø 60', finish: 'Único', version: 'Básica', reference: 'RETRO-1', sort_order: 1 },
        { id: 'retro-plus-small', dimension: 'Ø 60', finish: 'Único', version: 'Plus', reference: 'RETRO-2', sort_order: 2 },
        { id: 'retro-plus-large', dimension: 'Ø 80', finish: 'Único', version: 'Plus', reference: 'RETRO-3', sort_order: 3 },
      ],
    });
    const units = getSelectableUnits(product);

    expect(Object.keys(getAttributeOptions(units, units[0].attributes))).toEqual(['dimension', 'finish', 'version']);
    expect(selectCompatibleUnit(units, { dimension: 'Ø 80', finish: 'Único', version: 'Básica' }, 'dimension')?.variantId).toBe('retro-plus-large');
  });

  it('keeps GME finish and distribution combinations tied to real units', () => {
    const product = normalizeProductDetail({
      id: 'gme-mamparas-ducha-open',
      name: 'Open',
      slug: 'gme-mamparas-ducha-open',
      supplier_id: 'gme',
      category_id: 'mamparas',
      variants: [
        { id: 'open-cromo-2', finish: 'Cromo', finish_code: 'cr', distribution: '2 abatibles', reference: 'OPEN-CR-2', sort_order: 1 },
        { id: 'open-cromo-free', finish: 'Cromo', finish_code: 'cr', distribution: 'Free', reference: 'OPEN-CR-FREE', sort_order: 2 },
        { id: 'open-negro-2', finish: 'Negro', finish_code: 'ng', distribution: '2 abatibles', reference: 'OPEN-NG-2', sort_order: 3 },
        { id: 'open-negro-free', finish: 'Negro', finish_code: 'ng', distribution: 'Free', reference: 'OPEN-NG-FREE', sort_order: 4 },
        { id: 'open-negro-lateral', finish: 'Negro', finish_code: 'ng', distribution: 'Lateral fijo', reference: 'OPEN-NG-LATERAL', sort_order: 5 },
        { id: 'open-aluminio', finish: 'Aluminio', finish_code: 'al', distribution: 'Free', reference: 'OPEN-AL-FREE', sort_order: 6 },
      ],
    });
    const units = getSelectableUnits(product);
    const initial = selectInitialUnit(units);

    expect(initial?.variantId).toBe('open-cromo-2');
    expect(getEnclosureAttributeOptions(units, initial?.attributes || {})).toEqual({
      finish: ['Cromo', 'Negro'],
      distribution: ['2 abatibles', 'Free'],
    });
    expect(selectEnclosureFinish(units, { finish: 'Cromo', distribution: 'Free' }, 'Negro')).toMatchObject({
      variantId: 'open-negro-free',
      variantSnapshot: { reference: 'OPEN-NG-FREE' },
    });
    expect(selectEnclosureFinish(units, { finish: 'Negro', distribution: 'Lateral fijo' }, 'Cromo')).toMatchObject({
      variantId: 'open-cromo-2',
      variantSnapshot: { reference: 'OPEN-CR-2' },
    });
    expect(findEnclosureUnit(units, 'Negro', 'Lateral fijo')?.variantId).toBe('open-negro-lateral');
    expect(findEnclosureUnit(units, 'Cromo', 'Lateral fijo')).toBeNull();
  });
});
