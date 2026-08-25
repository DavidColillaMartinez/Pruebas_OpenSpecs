import { describe, expect, it } from 'vitest';
import alba from '../../catalog/api/fixtures/product-detail.mt-espejos-alba.json';
import { normalizeProductDetail } from '../../catalog/model/normalize';
import { getSelectableUnits, selectInitialUnit } from '../../catalog/model/selection';
import { buildQuoteRequestItem, validateQuoteRequest } from './payload';

describe('quote request payload', () => {
  it('builds the minimal item from the selected real variant', () => {
    const product = normalizeProductDetail(alba);
    const unit = selectInitialUnit(getSelectableUnits(product));
    const item = buildQuoteRequestItem(product, unit, 2, 'Consultar plazo');

    expect(item).toMatchObject({
      productId: 'mt-espejos-alba',
      variantId: 'mt-espejos-alba--v0001',
      quantity: 2,
      productName: 'Alba',
      notes: 'Consultar plazo',
    });
    expect(item.reference).toBe('7195');
    expect(item).toMatchObject({ supplier: 'Manillons Torrent', category: 'Espejos', imageUrl: expect.stringContaining('mt26-esp-alba-i01.webp') });
    expect(item.selectedAttributes).toMatchObject({ dimension: 'Ø 60', finish: 'Terracota' });
    expect(item.variantSnapshot).toMatchObject({ reference: '7195', dimension: 'Ø 60' });
    expect(item.selectedAttributes).not.toHaveProperty('source_page');
  });

  it('preserves multiple complete items without reducing the payload to one line', () => {
    const product = normalizeProductDetail(alba);
    const units = getSelectableUnits(product);
    const first = buildQuoteRequestItem(product, units[0], 1);
    const second = buildQuoteRequestItem(product, units[5], 2);
    const errors = validateQuoteRequest({
      customerName: 'Ana',
      email: 'ana@example.com',
      consentPrivacy: true,
      items: [first, second],
    });

    expect(errors).toEqual({});
    expect([first, second]).toHaveLength(2);
    expect(second.selectedAttributes).toMatchObject({ dimension: 'Ø 70', finish: 'Azul atlántico' });
  });

  it('keeps GME variants selectable without inventing a missing reference and prefers variant media', () => {
    const product = normalizeProductDetail({
      id: 'gme-mamparas-ducha-akt',
      name: 'Aktual',
      slug: 'gme-mamparas-ducha-aktual',
      supplier_id: 'gme',
      supplier_name: 'GME',
      category_id: 'mamparas',
      category_name: 'Mamparas',
      images: [{ url: 'https://assets.example/aktual-product.webp' }],
      configuration_fields: ['distribution', 'finish'],
      variants: [{
        id: 'gme-mamparas-ducha-akt--ang-cr',
        finish: 'Cromo',
        images: [{ url: 'https://assets.example/aktual-variant.webp' }],
        attributes: { distribution: 'Angular al vértice' },
      }],
    });
    const item = buildQuoteRequestItem(product, selectInitialUnit(getSelectableUnits(product)), 1);

    expect(item).toMatchObject({
      productId: 'gme-mamparas-ducha-akt',
      variantId: 'gme-mamparas-ducha-akt--ang-cr',
      imageUrl: 'https://assets.example/aktual-variant.webp',
      selectedAttributes: { finish: 'Cromo', distribution: 'Angular al vértice' },
    });
    expect(item.reference).toBeUndefined();
    expect(validateQuoteRequest({ customerName: 'Ana', email: 'ana@example.com', consentPrivacy: true, items: [item] })).toEqual({});
  });

  it('keeps a published variant whose API exposes no additional attributes', () => {
    const product = normalizeProductDetail({
      id: 'royo-simple-product',
      name: 'Mueble sencillo',
      slug: 'royo-simple-product',
      supplier_id: 'royo',
      supplier_name: 'Royo',
      category_id: 'muebles-y-lavabos',
      category_name: 'Muebles y lavabos',
      variants: [{ id: 'royo-simple-product--v0001', reference: 'C0074654', attributes: {} }],
    });
    const item = buildQuoteRequestItem(product, selectInitialUnit(getSelectableUnits(product)), 1);

    expect(item).toMatchObject({ productId: 'royo-simple-product', variantId: 'royo-simple-product--v0001', reference: 'C0074654' });
    expect(item.selectedAttributes).toBeUndefined();
    expect(validateQuoteRequest({ customerName: 'Ana', email: 'ana@example.com', consentPrivacy: true, items: [item] })).toEqual({});
  });

  it('rejects missing contact, invalid quantity and oversized fields', () => {
    const errors = validateQuoteRequest({
      customerName: '',
      consentPrivacy: true,
      items: [{ productId: 'bad id', quantity: 0, productName: '' }],
    });

    expect(errors).toMatchObject({
      customerName: expect.any(String),
      contact: expect.any(String),
      'items.0.productId': expect.any(String),
      'items.0.quantity': expect.any(String),
      'items.0.productName': expect.any(String),
    });
  });
});
