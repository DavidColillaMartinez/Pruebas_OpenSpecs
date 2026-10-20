import { describe, expect, it, vi } from 'vitest';
import { SITEMAP_PAGE_SIZE, buildSitemapResponse, buildSitemapXml, enumeratePublicSlugs, escapeXml } from './sitemap.js';
import kitchen from '../../src/features/catalog/api/fixtures/gme-kitchen-contract.json';

const UPSTREAM = 'https://upstream.example/catalog';
const quiet = () => {};

const item = (slug, overrides = {}) => ({ slug, publication_status: 'publishable', quality_status: 'approved', ...overrides });
const range = (from, to) => Array.from({ length: to - from }, (_, index) => `slug-${from + index}`);
const pageOf = (items, offset, hasMore) => ({
  status: 200,
  json: async () => ({ items, pagination: { limit: SITEMAP_PAGE_SIZE, offset, total: null, has_more: hasMore } }),
});
const sequentialFetch = (pages) => {
  let index = 0;
  return vi.fn(async () => pages[index++]);
};

describe('buildSitemapXml', () => {
  it('lists the public static routes and product detail URLs without the legacy catalog slash', () => {
    const xml = buildSitemapXml(['mt-espejos-alba']);
    expect(xml).toContain('<loc>https://arealrmq.es/</loc>');
    expect(xml).toContain('<loc>https://arealrmq.es/productos</loc>');
    expect(xml).toContain('<loc>https://arealrmq.es/productos/mt-espejos-alba</loc>');
    expect(xml).not.toContain('/productos/</loc>');
  });

  it('escapes XML special characters', () => {
    expect(escapeXml(`a&b<"'>`)).toBe('a&amp;b&lt;&quot;&apos;&gt;');
  });
});

describe('enumeratePublicSlugs', () => {
  it('follows offset pages until has_more is false and deduplicates shifted items', async () => {
    const fetchImpl = sequentialFetch([
      pageOf(range(0, 60).map((slug) => item(slug)), 0, true),
      pageOf([item('slug-59'), ...range(60, 119).map((slug) => item(slug))], 60, true),
      pageOf(range(119, 121).map((slug) => item(slug)), 120, false),
    ]);

    const result = await enumeratePublicSlugs({ upstreamBase: UPSTREAM, fetchImpl });

    expect(result.slugs).toHaveLength(121);
    expect(new Set(result.slugs).size).toBe(121);
    expect(result.pages).toBe(3);
    expect(result.excluded).toBe(0);
    const requested = fetchImpl.mock.calls.map(([url]) => new URL(url).searchParams.get('offset'));
    expect(requested).toEqual(['0', '60', '120']);
    expect(new URL(fetchImpl.mock.calls[0][0]).pathname).toBe('/catalog/products');
    expect(new URL(fetchImpl.mock.calls[0][0]).searchParams.get('limit')).toBe(String(SITEMAP_PAGE_SIZE));
  });

  it('excludes unpublished, unapproved and malformed slugs without failing', async () => {
    const fetchImpl = sequentialFetch([
      pageOf([item('ok-one'), item('draft', { publication_status: 'draft' }), item('pending', { quality_status: 'pending' }), item('Bad Slug'), item('ok-two')], 0, false),
    ]);

    const result = await enumeratePublicSlugs({ upstreamBase: UPSTREAM, fetchImpl });

    expect(result.slugs).toEqual(['ok-one', 'ok-two']);
    expect(result.excluded).toBe(3);
  });

  it('fails when the upstream does not honour the requested offset', async () => {
    const fetchImpl = sequentialFetch([pageOf(range(0, 60).map((slug) => item(slug)), 0, true), pageOf(range(60, 120).map((slug) => item(slug)), 0, false)]);
    await expect(enumeratePublicSlugs({ upstreamBase: UPSTREAM, fetchImpl })).rejects.toMatchObject({ code: 'PAGINATION_MISMATCH' });
  });

  it('fails when a full page announced as incomplete only repeats known slugs', async () => {
    const same = range(0, 60).map((slug) => item(slug));
    const fetchImpl = sequentialFetch([pageOf(same, 0, true), pageOf(same, 60, true)]);
    await expect(enumeratePublicSlugs({ upstreamBase: UPSTREAM, fetchImpl })).rejects.toMatchObject({ code: 'REPEATED_PAGE' });
  });

  it('fails explicitly on a middle-page upstream error instead of publishing a partial inventory', async () => {
    const fetchImpl = sequentialFetch([pageOf(range(0, 60).map((slug) => item(slug)), 0, true), { status: 502, json: async () => ({}) }]);
    await expect(enumeratePublicSlugs({ upstreamBase: UPSTREAM, fetchImpl })).rejects.toMatchObject({ code: 'UPSTREAM_STATUS', status: 502 });
  });

  it('maps timeouts to their own error code', async () => {
    const fetchImpl = vi.fn(async () => {
      throw Object.assign(new Error('timeout'), { name: 'TimeoutError' });
    });
    await expect(enumeratePublicSlugs({ upstreamBase: UPSTREAM, fetchImpl })).rejects.toMatchObject({ code: 'UPSTREAM_TIMEOUT' });
  });

  it('fails when there is no publishable product instead of publishing an empty sitemap', async () => {
    const fetchImpl = sequentialFetch([pageOf([item('draft', { publication_status: 'draft' })], 0, false)]);
    await expect(enumeratePublicSlugs({ upstreamBase: UPSTREAM, fetchImpl })).rejects.toMatchObject({ code: 'EMPTY_INVENTORY' });
  });

  it('fails when a page announces more items but returns none', async () => {
    const fetchImpl = sequentialFetch([pageOf([], 0, true)]);
    await expect(enumeratePublicSlugs({ upstreamBase: UPSTREAM, fetchImpl })).rejects.toMatchObject({ code: 'EMPTY_PAGE_WITH_MORE' });
  });

  it('stops with an explicit error after the page limit', async () => {
    const fetchImpl = vi.fn(async (url) => {
      const offset = Number(new URL(url).searchParams.get('offset'));
      return pageOf(range(offset, offset + SITEMAP_PAGE_SIZE).map((slug) => item(slug)), offset, true);
    });
    await expect(enumeratePublicSlugs({ upstreamBase: UPSTREAM, fetchImpl, maxPages: 2 })).rejects.toMatchObject({ code: 'PAGE_LIMIT' });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('does not call the upstream when it is not configured', async () => {
    const fetchImpl = vi.fn();
    await expect(enumeratePublicSlugs({ upstreamBase: '', fetchImpl })).rejects.toMatchObject({ code: 'NOT_CONFIGURED' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe('buildSitemapResponse', () => {
  it('includes the eleven kitchen models and excludes the retired Sirio handle without a static URL list', async () => {
    const retired = 'gme-ducha-empotrable-sirio-1-funcion';
    const current = [...range(0, 150).map(slug => item(slug)),
      ...kitchen.products.map(product => item(product.slug)), item(retired, { publication_status: 'archived' })];
    const fetchImpl = vi.fn(async url => {
      const offset = Number(new URL(url).searchParams.get('offset'));
      return pageOf(current.slice(offset, offset + 60), offset, offset + 60 < current.length);
    });
    const result = await buildSitemapResponse({ env: { N8N_CATALOG_PRODUCTS_UPSTREAM_BASE_URL: UPSTREAM }, fetchImpl, log: quiet });
    expect(result.status).toBe(200);
    const urls = [...result.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
    expect(urls).toHaveLength(163);
    expect(new Set(urls).size).toBe(163);
    for (const product of kitchen.products) expect(urls).toContain(`https://arealrmq.es/productos/${product.slug}`);
    expect(result.body).not.toContain(retired);
    expect(result.body).not.toContain('tap_scope');
    expect(result.body).not.toContain('lastmod');
  });
  it('returns XML with bounded cache headers for a complete inventory', async () => {
    const fetchImpl = sequentialFetch([pageOf([item('a-1'), item('b-2')], 0, false)]);
    const result = await buildSitemapResponse({ env: { N8N_CATALOG_PRODUCTS_UPSTREAM_BASE_URL: UPSTREAM }, fetchImpl, log: quiet });

    expect(result.status).toBe(200);
    expect(result.headers['content-type']).toBe('application/xml; charset=utf-8');
    expect(result.headers['cache-control']).toContain('s-maxage=3600');
    expect(result.body).toContain('<loc>https://arealrmq.es/productos/a-1</loc>');
    expect(result.body).toContain('<loc>https://arealrmq.es/productos/b-2</loc>');
  });

  it('answers 503 with Retry-After and no sitemap body when enumeration fails', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('boom');
    });
    const result = await buildSitemapResponse({ env: { N8N_CATALOG_PRODUCTS_UPSTREAM_BASE_URL: UPSTREAM }, fetchImpl, log: quiet });

    expect(result.status).toBe(503);
    expect(result.headers['retry-after']).toBe('300');
    expect(result.headers['cache-control']).toBe('no-store');
    expect(result.body).not.toContain('<urlset');
  });

  it('logs failure codes without leaking the upstream URL', async () => {
    const log = vi.fn();
    const fetchImpl = vi.fn(async () => {
      throw new Error('boom');
    });
    await buildSitemapResponse({ env: { N8N_CATALOG_PRODUCTS_UPSTREAM_BASE_URL: UPSTREAM }, fetchImpl, log });

    expect(log).toHaveBeenCalledWith('seo.sitemap.failed', expect.objectContaining({ code: 'UPSTREAM_ERROR' }));
    expect(JSON.stringify(log.mock.calls)).not.toContain(UPSTREAM);
  });
});
