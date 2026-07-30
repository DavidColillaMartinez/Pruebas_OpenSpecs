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

  it('normalizes optional images attached to a variant', () => {
    const product = normalizeProductDetail({
      id: 'variant-product',
      name: 'Producto con acabado',
      slug: 'variant-product',
      images: [],
      variants: [{ id: 'variant-1', finish: 'Roble', image: 'images/variant.webp', attributes: {} }],
    }, { asset_base_url: 'https://assets.example/catalog', catalog_version: null, api_contract_version: null, source_catalog_base_url: null, database_ready_for_public_api: true });

    expect(product.variants[0].images?.[0].url).toBe('https://assets.example/catalog/images/variant.webp');
  });

  it('preserves API distribution values, Cromo display names, and variant image URLs', () => {
    const product = normalizeProductDetail({
      id: 'gme-mamparas-ducha-open',
      name: 'Open',
      slug: 'gme-mamparas-ducha-open',
      supplier_id: 'gme',
      category_id: 'mamparas',
      available_distributions: ['2 abatibles'],
      variants: [{
        id: 'open-cromo-2-abatibles',
        finish: 'Cromo',
        finish_code: 'cr',
        distribution: '2 abatibles',
        image: 'https://assets.example/open-cromo.webp',
        reference: 'OPEN-CR-2A',
        attributes: { technical_width: '1200' },
      }],
    });

    expect(product.availableDistributions).toEqual(['2 abatibles']);
    expect(product.variants[0]).toMatchObject({ finish: 'Cromo', distribution: '2 abatibles', finishCode: 'cr' });
    expect(product.variants[0].images?.[0].url).toBe('https://assets.example/open-cromo.webp');
    expect(product.variants[0].attributes).toEqual({ technical_width: '1200' });
  });

  it('normalizes optional images attached to commercial offers', () => {
    const product = normalizeProductDetail({
      id: 'offer-product',
      name: 'Producto con conjunto',
      slug: 'offer-product',
      images: [],
      commercial_offers: [{
        id: 'offer-1',
        offer_type: 'Conjunto premium',
        image: 'images/offer.webp',
        variants: [{ id: 'offer-variant-1', reference: 'REF-1', finish_name: 'Roble' }],
      }],
    }, { asset_base_url: 'https://assets.example/catalog', catalog_version: null, api_contract_version: null, source_catalog_base_url: null, database_ready_for_public_api: true });

    expect(product.commercialOffers[0].images?.[0].url).toBe('https://assets.example/catalog/images/offer.webp');
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

  it('normalizes distribution facets and card distributions from API fields', () => {
    const response = normalizeProductList({
      items: [{
        id: 'gme-model',
        name: 'Open',
        slug: 'gme-mamparas-ducha-open',
        images: [],
        category_id: 'mamparas',
        category_name: 'Mamparas',
        available_distributions: ['2 abatibles'],
      }],
      pagination: { limit: 24, offset: 0, total: 1 },
      facets: { distributions: [{ value: '2 abatibles', label: '2 abatibles', count: 1 }] },
      sort: { supported: ['relevance'] },
    });

    expect(response.items[0].distributions).toEqual(['2 abatibles']);
    expect(response.facets.distribution).toEqual([{ value: '2 abatibles', label: '2 abatibles', count: 1 }]);
  });

  it('rejects an unusable list payload instead of treating it as an empty catalog', () => {
    expect(() => normalizeProductList({ pagination: { total: 0 } })).toThrow('PRODUCT_LIST_CONTRACT_INVALID');
  });
});
