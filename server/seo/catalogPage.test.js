// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { loadCatalogPages, handleCatalogPageRequest } from './catalogPage.js';
import { catalogRequestForPage, normalizeCatalogSearch, renderCatalogPage } from '../../src/entry-server.jsx';
import { readFile } from 'node:fs/promises';

const env = { N8N_CATALOG_PRODUCTS_UPSTREAM_BASE_URL: 'https://upstream.example.test/catalog' };
const renderer = { catalogRequestForPage, normalizeCatalogSearch, renderCatalogPage };
const template = await readFile(new URL('../../index.html', import.meta.url), 'utf8');
const item = { id: 'public', slug: 'public', name: 'Ficha pública', category_id: 'mamparas', category_name: 'Mamparas' };
const page = (items, offset = 0, hasMore = false) => ({ items, pagination: { limit: 24, offset, has_more: hasMore, total: null } });
const answer = (body, status = 200) => new Response(JSON.stringify(body), { status });

describe('catalog document public data loading', () => {
  it('uses the existing GET query contract without cookies or unknown parameters', async () => {
    const fetchImpl = vi.fn(async () => answer(page([item])));
    const result = await loadCatalogPages('search=baño&unknown=secret', renderer, { env, fetchImpl });
    expect(result.statusCode).toBe(200);
    const [url, options] = fetchImpl.mock.calls[0];
    expect(url.searchParams.get('search')).toBe('baño');
    expect(url.searchParams.has('unknown')).toBe(false);
    expect(options).toMatchObject({ method: 'GET', headers: { accept: 'application/json' } });
    expect(options.headers).not.toHaveProperty('cookie');
  });

  it('accumulates the same pages as Cargar más and confirms an out-of-range page only at the end', async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(answer(page([item], 0, true)))
      .mockResolvedValueOnce(answer(page([{ ...item, id: 'second', slug: 'second' }], 24)));
    const result = await loadCatalogPages('page=2', renderer, { env, fetchImpl });
    expect(result.statusCode).toBe(200);
    expect(result.pages).toHaveLength(2);
    expect((await loadCatalogPages('page=2', renderer, { env, fetchImpl: async () => answer(page([item])) })).statusCode).toBe(404);
  });

  it('reports timeout, response and contract failures as classified recoverable 503s', async () => {
    const cases = {
      timeout: async () => { throw new DOMException('timeout', 'TimeoutError'); },
      invalidBody: async () => new Response('not JSON'),
      upstream: async () => answer({}, 502),
      nonPublic: async () => answer(page([{ ...item, publication_status: 'draft' }])),
      duplicate: async () => answer(page([item, item])),
    };
    expect(await loadCatalogPages('', renderer, { env, fetchImpl: cases.timeout })).toEqual({ statusCode: 503, pages: [], reason: 'timeout' });
    expect(await loadCatalogPages('', renderer, { env, fetchImpl: cases.invalidBody })).toEqual({ statusCode: 503, pages: [], reason: 'invalid-body' });
    expect(await loadCatalogPages('', renderer, { env, fetchImpl: cases.upstream })).toEqual({ statusCode: 503, pages: [], reason: 'upstream-status' });
    expect(await loadCatalogPages('', renderer, { env, fetchImpl: cases.nonPublic })).toEqual({ statusCode: 503, pages: [], reason: 'inventory' });
    expect(await loadCatalogPages('', renderer, { env, fetchImpl: cases.duplicate })).toEqual({ statusCode: 503, pages: [], reason: 'inventory' });
  });

  it('reports a network failure as a recoverable 503 without invoking upstream twice', async () => {
    const fetchImpl = async () => { throw new TypeError('fetch failed'); };
    expect(await loadCatalogPages('', renderer, { env, fetchImpl })).toEqual({ statusCode: 503, pages: [], reason: 'network' });
  });

  it('reports a missing upstream configuration as not-configured without fetching', async () => {
    const fetchImpl = vi.fn();
    expect(await loadCatalogPages('', renderer, { env: {}, fetchImpl })).toEqual({ statusCode: 503, pages: [], reason: 'not-configured' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('bounds pathological page requests without allocating or fetching an unbounded number of pages', async () => {
    const fetchImpl = vi.fn();
    expect(await loadCatalogPages('page=999999999999999999999', renderer, { env, fetchImpl })).toEqual({ statusCode: 503, pages: [], reason: 'request-limit' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('serves the renderer error view with cache policy from the compiled-document adapter contract', async () => {
    const res = { headers: {}, status(code) { this.statusCode = code; return this; }, setHeader(key, value) { this.headers[key] = value; }, send(body) { this.body = body; }, end() {} };
    await handleCatalogPageRequest({ method: 'GET', url: '/productos?search=baño&utm_source=private-canary' }, res, {
      readShell: async () => template, loadRenderer: async () => renderer, env, fetchImpl: async () => answer({}, 502),
    });
    expect(res.statusCode).toBe(503);
    expect(res.headers['Cache-Control']).toBe('no-store');
    expect(res.headers['Retry-After']).toBe('300');
    expect(res.headers['X-LRMQ-Diag']).toBe('upstream-status');
    expect(res.body).toContain('Reintentar');
    expect(res.body).not.toContain('private-canary');
    expect(res.body).not.toContain('content="noindex');
  });

  it('classifies a missing shell with a diagnostic phase and serves the emergency document', async () => {
    const res = { headers: {}, status(code) { this.statusCode = code; return this; }, setHeader(key, value) { this.headers[key] = value; }, send(body) { this.body = body; }, end() {} };
    await handleCatalogPageRequest({ method: 'GET', url: '/productos' }, res, {
      readShell: async () => { throw Object.assign(new Error('hidden path'), { seoPhase: 'shell-missing', seoErrorClass: 'ENOENT' }); },
      loadRenderer: async () => renderer, env,
    });
    expect(res.statusCode).toBe(503);
    expect(res.headers['X-LRMQ-Diag']).toBe('shell-missing:ENOENT');
    expect(res.headers['Retry-After']).toBe('300');
    expect(res.body).toContain('Reintentar');
    expect(res.body).not.toContain('hidden path');
  });

  it('classifies a failing renderer import as renderer-import instead of blaming the catalog service', async () => {
    const res = { headers: {}, status(code) { this.statusCode = code; return this; }, setHeader(key, value) { this.headers[key] = value; }, send(body) { this.body = body; }, end() {} };
    await handleCatalogPageRequest({ method: 'GET', url: '/productos' }, res, {
      readShell: async () => template,
      loadRenderer: async () => { throw Object.assign(new Error('hidden path'), { seoPhase: 'renderer-import', seoErrorClass: 'ERR_MODULE_NOT_FOUND' }); },
      env,
    });
    expect(res.statusCode).toBe(503);
    expect(res.headers['X-LRMQ-Diag']).toBe('renderer-import:ERR_MODULE_NOT_FOUND');
  });
});
