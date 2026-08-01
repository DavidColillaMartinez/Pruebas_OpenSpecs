import { describe, expect, it } from 'vitest';
import alba from '../api/fixtures/product-detail.mt-espejos-alba.json';
import royo from '../api/fixtures/product-detail.royo-alfa-compact-100.json';
import { MANILLONS_TORRENT_REQUIRED_MODELS } from '../api/fixtures/manillons-torrent-contract';
import { deriveCatalogFacets, normalizeProductDetail, normalizeProductList, resolveAssetUrl } from './normalize';

describe('product normalization', () => {
  it('keeps public identity, variants and absolute assets', () => {
    const product = normalizeProductDetail(alba);

    expect(product.images[0].url).toMatch(/^https:\/\//);
    expect(product.variants).toHaveLength(16);
    expect(product.variants[0]).toMatchObject({ dimension: 'Ø 60', finish: 'Terracota', reference: '7195' });
    expect(product).toMatchObject({ hasLed: false, lightingType: 'Sin luz', lightingTechnology: 'Sin LED' });
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

  it('normalizes Espejos shape, LED and lighting facets from API values', () => {
    const response = normalizeProductList({
      items: [{ id: 'mt-espejos-hula', name: 'Hula', slug: 'mt-espejos-hula', images: [], show_price: false }],
      pagination: { limit: 24, offset: 0, total: 1 },
      facets: {
        shapes: [{ value: 'Semicircular', label: 'Semicircular', count: 1 }],
        has_led: [{ value: true, label: 'Sí', count: 1 }, { value: false, label: 'No', count: 0 }],
        lighting_types: [{ value: 'Integrada', label: 'Integrada', count: 1 }],
        finishes: [{ value: 'Negro mate', label: 'Negro mate', count: 1 }],
        measures: [{ value: '80 x 100', label: '80 x 100', count: 1 }],
      },
      sort: { supported: ['relevance'] },
    });

    expect(response.facets.shape).toEqual([{ value: 'Semicircular', label: 'Semicircular', count: 1 }]);
    expect(response.facets.has_led).toEqual([
      { value: 'true', label: 'Sí', count: 1 },
      { value: 'false', label: 'No', count: 0 },
    ]);
    expect(response.facets.lighting_type).toEqual([{ value: 'Integrada', label: 'Integrada', count: 1 }]);
    expect(response.facets.finish).toEqual([{ value: 'Negro mate', label: 'Negro mate', count: 1 }]);
    expect(response.facets.measure).toEqual([{ value: '80 x 100', label: '80 x 100', count: 1 }]);
  });

  it('uses explicit list specs for contextual mirror fields without inventing absent values', () => {
    const response = normalizeProductList({
      items: [{
        id: 'mt-espejos-alba',
        name: 'Alba',
        slug: 'mt-espejos-alba',
        category_id: 'espejos',
        category_name: 'Espejos',
        specs: { LED: 'No', Forma: 'Circular', 'Tipo de iluminación': 'Sin luz' },
        images: [],
      }, {
        id: 'mt-espejos-unknown',
        name: 'Sin campos',
        slug: 'mt-espejos-unknown',
        category_id: 'espejos',
        images: [],
      }],
      pagination: { limit: 24, offset: 0, total: 2 },
      facets: {},
      sort: { supported: ['relevance'] },
    });

    expect(response.items[0]).toMatchObject({ shape: 'Circular', hasLed: false, lightingType: 'Sin luz' });
    expect(response.items[1].hasLed).toBeUndefined();
  });

  it('derives fallback Espejos facets from complete normalized items without turning absent LED into false', () => {
    const response = normalizeProductList({
      items: [
        { id: 'mirror-led', name: 'LED', slug: 'mirror-led', category_id: 'espejos', specs: { LED: 'Sí', Forma: 'Oval', 'Tipo de iluminación': 'Retroiluminada' }, images: [] },
        { id: 'mirror-no-led', name: 'No LED', slug: 'mirror-no-led', category_id: 'espejos', specs: { LED: 'No', Forma: 'Circular' }, images: [] },
        { id: 'mirror-unknown', name: 'Unknown', slug: 'mirror-unknown', category_id: 'espejos', images: [] },
      ],
      pagination: { limit: 60, offset: 0, total: 3 },
      facets: {},
      sort: { supported: ['relevance'] },
    });
    const facets = deriveCatalogFacets(response.items);

    expect(facets.shape?.map((option) => option.value)).toEqual(['Circular', 'Oval']);
    expect(facets.has_led?.map((option) => option.value)).toEqual(['false', 'true']);
  });

  it('excludes prices and technical source fields from public specs', () => {
    const product = normalizeProductDetail({
      id: 'mt-espejos-nova',
      name: 'Nova',
      slug: 'mt-espejos-nova',
      specs: { LED: 'Sí', Precio: '100 €', source_page: 57 },
      variants: [{ id: 'nova-1', reference: 'NOVA-1', attributes: { source_page: 57, price_eur: 100, version: 'Básica' } }],
    });

    expect(product.specs).toEqual({ LED: 'Sí' });
    expect(product.variants[0].attributes).toEqual({ version: 'Básica' });
  });

  it('normalizes variant-specific lighting data without inventing missing values', () => {
    const product = normalizeProductDetail({
      id: 'mt-espejos-retro',
      name: 'Retro',
      slug: 'mt-espejos-retro',
      shape: 'Oval',
      has_led: true,
      lighting_type: 'Retroiluminada',
      lighting_technology: 'LED estándar',
      supplier_id: 'manillons-torrent',
      category_id: 'espejos',
      specs: { LED: 'Sí', 'Tipo de iluminación': 'Retroiluminada' },
      variants: [
        { id: 'retro-basic', measure: '60 x 80', version: 'Básica', has_led: true, lighting_type: 'Retroiluminada', lighting_technology: 'LED estándar', light_temp: '3000 K' },
        { id: 'retro-plus', measure: '80 x 100', version: 'Plus', has_led: true, lighting_type: 'Retroiluminada', lighting_technology: 'TRILED', light_temp: '3000/4200/6400 K' },
      ],
    });

    expect(product.variants).toMatchObject([
      { measure: '60 x 80', dimension: '60 x 80', version: 'Básica', lightingTechnology: 'LED estándar', lightTemp: '3000 K' },
      { measure: '80 x 100', dimension: '80 x 100', version: 'Plus', lightingTechnology: 'TRILED', lightTemp: '3000/4200/6400 K' },
    ]);
    expect(product).toMatchObject({ shape: 'Oval', hasLed: true, lightingType: 'Retroiluminada', lightingTechnology: 'LED estándar' });
    expect(normalizeProductDetail({ id: 'missing-light', name: 'Missing', slug: 'missing', variants: [{ id: 'v1' }] }).lightingTechnology).toBeUndefined();
  });

  it('rejects an unusable list payload instead of treating it as an empty catalog', () => {
    expect(() => normalizeProductList({ pagination: { total: 0 } })).toThrow('PRODUCT_LIST_CONTRACT_INVALID');
  });

  it('keeps the required model contract from the Manillons Torrent manifest', () => {
    expect(MANILLONS_TORRENT_REQUIRED_MODELS).toHaveLength(7);
    expect(MANILLONS_TORRENT_REQUIRED_MODELS.find((model) => model.slug === 'basic')).toMatchObject({ mirrorType: 'Canto recto', hasLed: false, finishCount: 1, measureCount: 5, imageCount: 2 });
    expect(MANILLONS_TORRENT_REQUIRED_MODELS.find((model) => model.slug === 'alba')).toMatchObject({ mirrorType: 'Circular', hasLed: false, finishCount: 4, measureCount: 4, imageCount: 2 });
    expect(MANILLONS_TORRENT_REQUIRED_MODELS.find((model) => model.slug === 'retro')).toMatchObject({ lighting: 'Retroiluminada', versions: ['Básica', 'Plus'] });
    expect(MANILLONS_TORRENT_REQUIRED_MODELS.find((model) => model.slug === 'nova')).toMatchObject({ lighting: 'Frontal', finishCount: 3, measureCount: 4, imageCount: 4 });
    expect(MANILLONS_TORRENT_REQUIRED_MODELS.find((model) => model.slug === 'tango')).toMatchObject({ lighting: 'Integrada', finishCount: 3, measureCount: 4, imageCount: 4 });
    expect(MANILLONS_TORRENT_REQUIRED_MODELS.find((model) => model.slug === 'hula')).toMatchObject({ mirrorType: 'Circular', shape: 'Semicircular' });
    expect(MANILLONS_TORRENT_REQUIRED_MODELS.find((model) => model.slug === 'swing')).toMatchObject({ pages: [158, 159] });
  });
});
