import { describe, expect, it } from 'vitest';
import alba from '../api/fixtures/product-detail.mt-espejos-alba.json';
import royo from '../api/fixtures/product-detail.royo-alfa-compact-100.json';
import { normalizeProductDetail, resolveAssetUrl } from './normalize';

describe('product normalization', () => {
  it('keeps public identity, variants and absolute assets', () => {
    const product = normalizeProductDetail(alba);

    expect(product.images[0].url).toMatch(/^https:\/\//);
    expect(product.variants).toHaveLength(4);
    expect(product.variants[0]).toMatchObject({ dimension: 'Ø60', reference: '7195' });
    expect(product).not.toHaveProperty('source_page');
    expect(product).not.toHaveProperty('quality_status');
  });

  it('preserves real offer and finish data without technical fields', () => {
    const product = normalizeProductDetail(royo);

    expect(product.availableFinishes).toContain('Roble Nórdico');
    expect(product.commercialOffers[0]).toMatchObject({ offerType: 'Conjunto completo' });
    expect(product.commercialOffers[0].variants[0]).toMatchObject({ finishCode: 'RO5' });
    expect(product.variants[0]).not.toHaveProperty('source_page');
  });

  it('handles missing optional arrays and resolves relative assets from public config', () => {
    const product = normalizeProductDetail({ id: 'p', name: 'Producto', slug: 'p', images: null, variants: null, commercial_offers: null });

    expect(product.images).toEqual([]);
    expect(product.variants).toEqual([]);
    expect(product.commercialOffers).toEqual([]);
    expect(resolveAssetUrl('images/p.webp', 'https://assets.example/catalog')).toBe('https://assets.example/catalog/images/p.webp');
    expect(resolveAssetUrl('images/p.webp')).toBeUndefined();
  });
});
