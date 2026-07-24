import { describe, expect, it } from 'vitest';
import alba from '../api/fixtures/product-detail.mt-espejos-alba.json';
import royo from '../api/fixtures/product-detail.royo-alfa-compact-100.json';
import { normalizeProductDetail, normalizeProductList, resolveAssetUrl } from './normalize';

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

  it('normalizes dynamic facets and supported sorts without exposing technical fields', () => {
    const response = normalizeProductList({
      items: [{
        id: 'p', name: 'Producto', slug: 'p', images: [], category_id: 'cat', category_name: 'Espejos',
        supplier_id: 'supplier-1', supplier_name: 'Proveedor', search_text: 'internal',
      }, { id: 'invalid' }],
      pagination: { limit: 24, offset: 0, total: 1 },
      facets: { categories: [{ value: 'cat', label: 'Espejos', count: 1 }], suppliers: [{ id: 'supplier-1', name: 'Proveedor', count: 1 }] },
      sort: { applied: 'name_asc', supported: ['name_asc', 'name_desc', 'unknown'] },
    });

    expect(response.items[0]).toMatchObject({ categoryId: 'cat', supplierId: 'supplier-1' });
    expect(response.items[0]).not.toHaveProperty('search_text');
    expect(response.facets).toEqual({
      category: [{ value: 'cat', label: 'Espejos', count: 1 }],
      supplier: [{ value: 'supplier-1', label: 'Proveedor', count: 1 }],
    });
    expect(response.sort).toEqual({ applied: 'name_asc', supported: ['name_asc', 'name_desc'] });
    expect(response.discardedItemCount).toBe(1);
  });

  it('rejects an unusable list payload instead of treating it as an empty catalog', () => {
    expect(() => normalizeProductList({ pagination: { total: 0 } })).toThrow('PRODUCT_LIST_CONTRACT_INVALID');
  });
});
