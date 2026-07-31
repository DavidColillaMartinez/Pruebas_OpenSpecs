import { describe, expect, it } from 'vitest';
import {
  catalogQueryKey,
  catalogQueryToRequest,
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
    const query = parseCatalogQuery('distribution=2+abatibles&distribution=Fijo+%2B+abatible');

    expect(query.filters.distribution).toEqual(['2 abatibles', 'Fijo + abatible']);
    expect(serializeCatalogQuery(query).toString()).toBe('distribution=2+abatibles&distribution=Fijo+%2B+abatible');
    expect(catalogQueryToRequest(query, true).distribution).toEqual(['2 abatibles', 'Fijo + abatible']);
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

  it('resets page when a discovery criterion changes and keys criteria without page', () => {
    const query = { search: '', filters: {}, sort: 'relevance' as const, page: 4 };
    const changed = withCatalogQueryChange(query, { search: 'alba' });

    expect(changed.page).toBe(1);
    expect(catalogQueryKey(query)).toBe(catalogQueryKey({ ...query, page: 1 }));
  });
});
