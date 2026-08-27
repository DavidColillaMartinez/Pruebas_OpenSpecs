import { describe, expect, it } from 'vitest';
import {
  catalogQueryKey,
  catalogQueryToRequest,
  getCatalogFacetLabel,
  getCatalogFilterKeys,
  getCatalogFilterProfile,
  parseCatalogQuery,
  serializeCatalogQuery,
  withCatalogQueryChange,
} from './catalogQuery';

describe('catalog query state', () => {
  it('resolves root and developed dependent filter profiles', () => {
    expect(getCatalogFilterProfile({ filters: {} })).toBe('root');
    expect(getCatalogFilterProfile({ filters: { category: ['mamparas'] } })).toBe('mamparas');
    expect(getCatalogFilterProfile({ filters: { supplier: ['gme'] } })).toBe('mamparas');
    expect(getCatalogFilterProfile({ filters: { category: ['espejos'] } })).toBe('espejos');
    expect(getCatalogFilterProfile({ filters: { supplier: ['manillons-torrent'] } })).toBe('espejos');
    expect(getCatalogFilterProfile({ filters: { category: ['muebles-y-lavabos'] } })).toBe('royo');
    expect(getCatalogFilterProfile({ filters: { category: ['muebles-y-lavabos'], supplier: ['royo'] } })).toBe('royo');
    expect(getCatalogFilterProfile({ filters: { category: ['muebles-y-lavabos'], supplier: ['royo', 'gme'] } })).toBe('mamparas');
    expect(getCatalogFilterKeys('royo')[0]).toBe('modularity');
    expect(getCatalogFilterKeys('royo')).toEqual([
      'modularity', 'collection', 'subcategory', 'finish', 'measure', 'product_kind', 'category', 'supplier',
    ]);
  });

  it('parses repeated filters and rejects unsupported sort values', () => {
    const query = parseCatalogQuery('search=alba&category=cat-a&category=cat-b&supplier=supplier-1&sort=made-up&page=3');

    expect(query).toEqual({
      search: 'alba',
      filters: { category: ['cat-a'], supplier: ['supplier-1'] },
      sort: 'relevance',
      page: 3,
    });
  });

  it('serializes only meaningful URL state and preserves repeated values', () => {
    const params = serializeCatalogQuery({
      search: '  alba ',
      filters: { category: ['cat-a', 'cat-a'], supplier: ['supplier-1'] },
      sort: 'name_desc',
      page: 2,
    });

    expect(params.toString()).toBe('search=alba&category=cat-a&supplier=supplier-1&sort=name_desc&page=2');
  });

  it('round-trips repeated distribution filters and sends them to the API', () => {
    const query = parseCatalogQuery('category=mamparas&distribution=2+abatibles&distribution=Fijo+%2B+abatible');

    expect(query.filters.distribution).toEqual(['2 abatibles', 'Fijo + abatible']);
    expect(serializeCatalogQuery(query).toString()).toBe('category=mamparas&distribution=2+abatibles&distribution=Fijo+%2B+abatible');
    expect(catalogQueryToRequest(query, true).distribution).toEqual(['2 abatibles', 'Fijo + abatible']);
  });

  it('sends modularity for category-only and exact Royo furniture scope', () => {
    const categoryOnlyQuery = parseCatalogQuery('category=muebles-y-lavabos&modularity=modular');
    expect(categoryOnlyQuery.filters).toEqual({ category: ['muebles-y-lavabos'], modularity: ['modular'] });
    expect(serializeCatalogQuery(categoryOnlyQuery).toString()).toBe('category=muebles-y-lavabos&modularity=modular');
    expect(catalogQueryToRequest(categoryOnlyQuery, true)).toMatchObject({
      category_id: ['muebles-y-lavabos'],
      modularity: ['modular'],
    });

    const royoQuery = parseCatalogQuery('category=muebles-y-lavabos&supplier=royo&modularity=modular');
    expect(royoQuery.filters).toEqual({ category: ['muebles-y-lavabos'], supplier: ['royo'], modularity: ['modular'] });
    expect(serializeCatalogQuery(royoQuery).toString()).toBe('category=muebles-y-lavabos&supplier=royo&modularity=modular');
    expect(catalogQueryToRequest(royoQuery, true)).toMatchObject({
      category_id: ['muebles-y-lavabos'],
      supplier_id: ['royo'],
      modularity: ['modular'],
    });

    const otherQuery = parseCatalogQuery('category=muebles-y-lavabos&supplier=royo&supplier=gme&modularity=modular');
    expect(otherQuery.filters.modularity).toBeUndefined();
    expect(catalogQueryToRequest(otherQuery, true)).not.toHaveProperty('modularity');

    const unrelatedQuery = parseCatalogQuery('category=muebles-y-lavabos&supplier=gme&modularity=modular');
    expect(getCatalogFilterProfile(unrelatedQuery)).toBe('mamparas');
    expect(unrelatedQuery.filters.modularity).toBeUndefined();
    expect(catalogQueryToRequest(unrelatedQuery, true)).not.toHaveProperty('modularity');
  });

  it('uses Royo labels and removes incompatible values when context changes', () => {
    expect(getCatalogFacetLabel('modularity', 'royo')).toBe('Modularidad');
    expect(getCatalogFacetLabel('collection', 'royo')).toBe('Modelo');
    expect(getCatalogFacetLabel('subcategory', 'royo')).toBe('Tipo de mueble');
    expect(getCatalogFacetLabel('finish', 'royo')).toBe('Acabado');
    expect(getCatalogFacetLabel('measure', 'royo')).toBe('Medida');
    expect(getCatalogFacetLabel('product_kind', 'royo')).toBe('Tipo de producto');

    const royoQuery = parseCatalogQuery('category=muebles-y-lavabos&supplier=royo&modularity=modular&measure=80&finish=Nogal');
    const changed = withCatalogQueryChange(royoQuery, {
      filters: { category: ['muebles-y-lavabos'], supplier: ['gme'], modularity: ['normal'], measure: ['100'], finish: ['Cromo'] },
    });
    expect(changed.filters).toEqual({ category: ['muebles-y-lavabos'], supplier: ['gme'], finish: ['Cromo'] });

    const clearedCategory = withCatalogQueryChange(royoQuery, { filters: { supplier: ['royo'], modularity: ['normal'] } });
    expect(clearedCategory.filters).toEqual({ supplier: ['royo'] });

    const unsanitized = {
      search: '',
      filters: { category: ['muebles-y-lavabos'], supplier: ['gme'], modularity: ['normal'], measure: ['100'], product_kind: ['configurable_product'] },
      sort: 'relevance' as const,
      page: 1,
    };
    expect(serializeCatalogQuery(unsanitized).toString()).toBe('category=muebles-y-lavabos&supplier=gme');
    expect(catalogQueryToRequest(unsanitized, true)).not.toHaveProperty('modularity');
    expect(catalogQueryToRequest(unsanitized, true)).not.toHaveProperty('measure');
    expect(catalogQueryToRequest(unsanitized, true)).not.toHaveProperty('product_kind');
  });

  it('accepts only the closed Modular/Normal values', () => {
    const query = parseCatalogQuery('category=muebles-y-lavabos&supplier=royo&modularity=unknown&modularity=normal');

    expect(query.filters.modularity).toEqual(['normal']);
    expect(catalogQueryToRequest(query, true).modularity).toEqual(['normal']);
  });

  it('builds server-side params with only the requested page', () => {
    const request = catalogQueryToRequest({
      search: 'alba',
       filters: { category: ['cat-a', 'cat-b'] },
      sort: 'name_asc',
      page: 3,
    }, false);

    expect(request).toEqual({
      limit: 24,
      offset: 48,
      include_facets: '0',
      search: 'alba',
       category_id: ['cat-a'],
      sort: 'name_asc',
    });
  });

  it('serializes the Espejos facet contract and removes dependent URL state without context', () => {
    const query = parseCatalogQuery('shape=Semicircular&has_led=true&lighting_type=Integrada&finish=Negro+mate');
    expect(query.filters).toEqual({});

    const active = parseCatalogQuery('category=espejos&shape=Semicircular&has_led=true&lighting_type=Integrada&finish=Negro+mate');
    expect(catalogQueryToRequest(active, true)).toMatchObject({
      category_id: ['espejos'],
      shape: ['Semicircular'],
      has_led: ['true'],
      lighting_type: ['Integrada'],
      finish: ['Negro mate'],
    });
  });

  it('unions family profiles and keeps a shared dependent filter while one owner remains', () => {
    expect(getCatalogFilterProfile({ filters: { supplier: ['gme', 'manillons-torrent'] } })).toBe('mixed');
    const query = parseCatalogQuery('supplier=gme&supplier=manillons-torrent&finish=Negro+mate&shape=Semicircular');
    expect(query.filters.finish).toEqual(['Negro mate']);
    expect(query.filters.shape).toEqual(['Semicircular']);
  });

  it('resets page when a discovery criterion changes and keys criteria without page', () => {
    const query = { search: '', filters: {}, sort: 'relevance' as const, page: 4 };
    const changed = withCatalogQueryChange(query, { search: 'alba' });

    expect(changed.page).toBe(1);
    expect(catalogQueryKey(query)).toBe(catalogQueryKey({ ...query, page: 1 }));
  });
});
