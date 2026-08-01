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
