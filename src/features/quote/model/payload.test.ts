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
    expect(item.variantSnapshot).not.toHaveProperty('source_page');
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
