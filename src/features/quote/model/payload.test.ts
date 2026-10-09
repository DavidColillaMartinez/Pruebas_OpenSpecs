import { describe, expect, it } from 'vitest';
import alba from '../../catalog/api/fixtures/product-detail.mt-espejos-alba.json';
import { normalizeProductDetail } from '../../catalog/model/normalize';
import { getSelectableUnits, selectInitialUnit } from '../../catalog/model/selection';
import { buildQuoteRequestItem, validateQuoteRequest } from './payload';
import { duplachStonePlusFixture } from '../../catalog/api/fixtures/duplach-platos-contract';

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

  it('maps a Royo variant to the generic public line without prices', () => {
    const product = normalizeProductDetail({
      id: 'royo-normal-types',
      name: 'Normal types',
      slug: 'royo-normal-types',
      supplier_id: 'royo',
      category_id: 'muebles-y-lavabos',
      main_image_url: 'https://assets.example/royo-cover.webp',
      variants: [{
        id: 'normal-suspended-white',
        measure: '80',
        finish: 'Blanco',
        reference: 'R-1',
        presentation_type: 'Suspendido',
        module_type: '2 cajones',
        price_eur: 100,
        attributes: { handle_finish: 'Inox', source_price: 100 },
      }],
    });
    const item = buildQuoteRequestItem(product, selectInitialUnit(getSelectableUnits(product)), 2);

    expect(item).toMatchObject({
      productId: 'royo-normal-types',
      variantId: 'normal-suspended-white',
      supplier: 'royo',
      category: 'muebles-y-lavabos',
      imageUrl: 'https://assets.example/royo-cover.webp',
      quantity: 2,
      selectedAttributes: { measure: '80', finish: 'Blanco', presentation_type: 'Suspendido', module_type: '2 cajones', handle_finish: 'Inox' },
    });
    expect(JSON.stringify(item)).not.toMatch(/price|precio|coste|importe/i);
  });

  it('never sends variantId and commercialOfferVariantId together', () => {
    const product = normalizeProductDetail(alba);
    const initial = selectInitialUnit(getSelectableUnits(product));
    if (!initial) throw new Error('fixture without selectable units');
    const unit = { ...initial, commercialOfferVariantId: 'offer-v9' };
    const item = buildQuoteRequestItem(product, unit, 1);
    expect(item.commercialOfferVariantId).toBe('offer-v9');
    expect(item.variantId).toBeUndefined();
  });

  it('rejects payloads over 64 KiB measured in UTF-8 bytes, never truncating content', () => {
    const items = Array.from({ length: 20 }, (_, index) => ({
      productId: `gme-byte-demo-${index}`,
      variantId: `v-${index}`,
      quantity: 1,
      productName: 'Multibyte',
      supplier: 'GME',
      category: 'Grifería',
      notes: '\u00d7'.repeat(2000),
    }));
    const payload = { customerName: 'Ana', email: 'ana@example.test', consentPrivacy: true as const, items };
    const serialized = JSON.stringify(payload);
    // Character count stays under the old 65536-character check while the
    // UTF-8 byte count crosses the 64 KiB limit (× is two bytes).
    expect(serialized.length).toBeLessThanOrEqual(65536);
    expect(new TextEncoder().encode(serialized).length).toBeGreaterThan(65536);
    const errors = validateQuoteRequest(payload);
    expect(errors.payload).toBeTruthy();
    // Content was measured, not truncated.
    expect(items[19]?.notes).toHaveLength(2000);
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
describe('duplach quote payload', () => {
  it('accepts a compact Duplach selection without inventing a variant identity', () => {
    const product = normalizeProductDetail(duplachStonePlusFixture());
    const unit = {
      productId: product.id,
      quantity: 1,
      productName: product.name,
      variantSnapshot: { measure: '100x100', texture: 'Pizarra', color: 'Blanco', grille: 'Color' },
      attributes: { measure: '100x100', texture: 'Pizarra', color: 'Blanco', grille: 'Color' },
      sourceOrder: 0,
    };
    const item = buildQuoteRequestItem(product, unit, 1);

    expect(item.variantId).toBeUndefined();
    expect(item.selectedAttributes).toMatchObject(unit.attributes);
    expect(validateQuoteRequest({ customerName: 'Cliente', email: 'cliente@example.test', consentPrivacy: true, items: [item] })).toEqual({});
  });

  it('sends real variant identity with public attributes and excludes prices and absent references', () => {
    const product = normalizeProductDetail(duplachStonePlusFixture());
    const units = getSelectableUnits(product);
    const unit = units.find((item) => item.variantId === 'duplach-stone-plus--v00005');
    const item = buildQuoteRequestItem(product, unit ?? null, 2);

    expect(item).toMatchObject({
      productId: 'duplach-stone-plus',
      variantId: 'duplach-stone-plus--v00005',
      quantity: 2,
      productName: 'Stone Plus',
      supplier: 'Duplach',
      category: 'Platos de ducha',
    });
    expect(item.reference).toBeUndefined();
    expect(item.selectedAttributes).toMatchObject({ measure: '100x100', texture: 'Pizarra', color: 'Blanco', grille: 'Color', valve_type: 'Sifón' });
    expect(JSON.stringify(item)).not.toMatch(/price_status|min_price|no_prices|show_price/i);
    const errors = validateQuoteRequest({
      customerName: 'Cliente',
      email: 'cliente@example.test',
      consentPrivacy: true,
      sourcePage: '/productos/duplach-stone-plus',
      items: [item],
    });
    expect(errors).toEqual({});
  });

  it('rejects an incomplete duplach selection without a real variant', () => {
    const product = normalizeProductDetail(duplachStonePlusFixture());
    const item = buildQuoteRequestItem(product, null, 1);
    const errors = validateQuoteRequest({
      customerName: 'Cliente',
      email: 'cliente@example.test',
      consentPrivacy: true,
      items: [item],
    });
    expect(errors['items.0.variantId']).toBeTruthy();
  });
});

describe('GME IO quote integration', () => {
  const ioProductFixture = {
    id: 'gme-persio',
    name: 'Persio',
    slug: 'gme-persio',
    supplier_name: 'GME',
    supplier_id: 'gme',
    category_id: 'griferia',
    category_name: 'Grifería',
    model: 'Persio',
    main_image_url: 'https://assets.test/covers/persio/cover-candidate.webp',
    specs: { gme_io_2026: true },
    images: [{ url: 'https://assets.test/covers/persio/cover-candidate.webp' }],
    variants: [
      { id: 'gme-persio-v1', attributes: { tap_type: 'lavabo_alto', finish: 'Níquel' }, images: [{ url: 'https://assets.test/gallery/faucets/persio/niquel.webp' }] },
      { id: 'gme-persio-v2', attributes: { tap_type: 'lavabajo_x', finish: 'Acero cepillado', selector_image_url: 'https://assets.test/faucets/persio/acero.webp' } },
    ],
  };

  it('keeps product, variant identity and full commercial attributes without prices', () => {
    const product = normalizeProductDetail(ioProductFixture);
    const units = getSelectableUnits(product);
    const item = buildQuoteRequestItem(product, units[0], 2);
    expect(item.productId).toBe('gme-persio');
    expect(item.variantId).toBe('gme-persio-v1');
    expect(item.productName).toBe('Persio');
    expect(item.quantity).toBe(2);
    expect(item.variantSnapshot).toEqual(expect.objectContaining({
      tap_type: 'lavabo_alto',
      finish: 'Níquel',
      supplier: 'GME',
      supplier_id: 'gme',
      category: 'Grifería',
      category_id: 'griferia',
      model: 'Persio',
      image: 'https://assets.test/gallery/faucets/persio/niquel.webp',
    }));
    expect(Object.values(item.variantSnapshot ?? {}).some((value) => typeof value === 'number')).toBe(false);
    expect(JSON.stringify(item)).not.toMatch(/precio|price|importe|puntos|Points/i);
    expect(item.variantSnapshot).not.toHaveProperty('selector_image_url');
  });

  it('never uses the Duplach compact mode for GME selections', () => {
    const product = normalizeProductDetail(ioProductFixture);
    const units = getSelectableUnits(product);
    const item = buildQuoteRequestItem(product, units[0], 1);
    const errors = validateQuoteRequest({
      customerName: 'Prueba', consentPrivacy: true,
      items: [{ ...item, productId: 'gme-persio-without-variant', variantId: undefined } as never, item],
    } as never);
    expect(errors['items.0.variantId']).toContain('obligatoria');
    expect(errors['items.1']).toBeUndefined();
  });
});
