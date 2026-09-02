import { afterEach, describe, expect, it, vi } from 'vitest';
import alba from './fixtures/product-detail.mt-espejos-alba.json';
import { catalogQueryToRequest, parseCatalogQuery } from '../model/catalogQuery';
import type { QuoteRequestPayload } from '../../quote/model/types';
import {
  createQuoteRequest,
  getProductBySlug,
  getProducts,
  prefetchCatalogFirstPage,
  prefetchProductBySlug,
  resetCatalogApiCacheForTests,
} from './client';

describe('catalog API client', () => {
  it('requests the public relative route and normalizes a real product response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(alba), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }));
    vi.stubGlobal('fetch', fetchMock);

    const product = await getProductBySlug('mt-espejos-alba');

    expect(fetchMock).toHaveBeenCalledWith('/api/catalog/products/mt-espejos-alba', expect.objectContaining({ method: 'GET' }));
    expect(String(fetchMock.mock.calls[0][0])).not.toContain('webhook');
    expect(product).toMatchObject({ id: 'mt-espejos-alba', name: 'Alba', variants: expect.any(Array) });
    expect(product.variants[0]).not.toHaveProperty('source_page');
    expect(product).not.toHaveProperty('search_text');
  });

  it('preserves the API not-found error even when the status is 200', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      error: 'PRODUCT_NOT_FOUND',
      message: 'Producto no encontrado',
    }), { status: 200 }))); 

    await expect(getProductBySlug('no-existe-lrmq')).rejects.toMatchObject({
      code: 'PRODUCT_NOT_FOUND',
      status: 200,
    });
  });

  it('handles the public proxy 404 normalization for PRODUCT_NOT_FOUND', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      error: 'PRODUCT_NOT_FOUND',
      message: 'Producto no encontrado',
    }), { status: 404 })));

    await expect(getProductBySlug('no-existe-lrmq')).rejects.toMatchObject({
      code: 'PRODUCT_NOT_FOUND',
      status: 404,
    });
  });

  it('classifies invalid JSON as a contract transport error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('not-json', { status: 200 })));

    await expect(getProductBySlug('mt-espejos-alba')).rejects.toMatchObject({ code: 'INVALID_JSON' });
  });

  it.each([
    [400, 'VALIDATION_ERROR'],
    [429, 'RATE_LIMITED'],
    [503, 'SERVER_ERROR'],
  ])('classifies HTTP %s as %s', async (status, code) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: code, message: 'Error de prueba' }), { status })));

    await expect(getProductBySlug('mt-espejos-alba')).rejects.toMatchObject({ code, status });
  });

  it('classifies network failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    await expect(getProductBySlug('mt-espejos-alba')).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
  });

  it('classifies an unusable successful contract', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'only-id' }), { status: 200 })));

    await expect(getProductBySlug('mt-espejos-alba')).rejects.toMatchObject({ code: 'CONTRACT_ERROR' });
  });

  it('classifies an aborted request as timeout', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn().mockImplementation((_url, options) => new Promise((_, reject) => {
      options.signal.addEventListener('abort', () => reject(new DOMException('Timeout', 'AbortError')), { once: true });
    })));

    const request = getProductBySlug('mt-espejos-alba', null, { timeoutMs: 10 });
    vi.advanceTimersByTime(10);
    await expect(request).rejects.toMatchObject({ code: 'TIMEOUT' });
    vi.useRealTimers();
  });

  it('serializes repeated catalog filters and facets without leaving the public route', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      items: [], pagination: { limit: 24, offset: 0, total: 0 },
      facets: { categories: [] }, sort: { supported: ['name_asc'] },
    }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await getProducts({ category: ['cat-a', 'cat-b'], supplier: ['supplier-1'], include_facets: true, limit: 24, offset: 0 });

    expect(fetchMock.mock.calls[0][0]).toBe('/api/catalog/products?category=cat-a&category=cat-b&supplier=supplier-1&include_facets=true&limit=24&offset=0');
  });

  it('propagates an external abort so route cleanup does not become an error state', async () => {
    const controller = new AbortController();
    vi.stubGlobal('fetch', vi.fn().mockImplementation((_url, options) => new Promise((_, reject) => {
      options.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
    })));

    const request = getProducts({}, null, { signal: controller.signal });
    controller.abort();

    await expect(request).rejects.toMatchObject({ name: 'AbortError' });
  });
});

function jsonResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), { status: 200, headers: { 'content-type': 'application/json' } });
}

function listPayload(name: string): unknown {
  return {
    items: [{ id: 'x', name, slug: 'x', images: [] }],
    pagination: { limit: 24, offset: 0, total: 1 },
    facets: {},
    sort: { supported: ['relevance'] },
  };
}

describe('catalog api cache', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('serves a fresh duplicate from cache without a second fetch', async () => {
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(jsonResponse(listPayload('V1'))));
    vi.stubGlobal('fetch', fetchMock);
    const first = await getProducts({ limit: 24, offset: 0, include_facets: '1' });
    const second = await getProducts({ limit: 24, offset: 0, include_facets: '1' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(second.items[0].name).toBe(first.items[0].name);
  });

  it('deduplicates concurrent identical requests', async () => {
    let release!: (response: Response) => void;
    const fetchMock = vi.fn().mockImplementation(() => new Promise<Response>((resolve) => { release = resolve; }));
    vi.stubGlobal('fetch', fetchMock);
    const a = getProducts({ limit: 24, offset: 0 });
    const b = getProducts({ limit: 24, offset: 0 });
    release(jsonResponse(listPayload('V1')));
    const [ra, rb] = await Promise.all([a, b]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(ra.items[0].name).toBe('V1');
    expect(rb.items[0].name).toBe('V1');
  });

  it('returns the stale entry immediately and revalidates in the background', async () => {
    const start = Date.now();
    let clock = start;
    vi.spyOn(Date, 'now').mockImplementation(() => clock);
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(listPayload('V1')))
      .mockResolvedValueOnce(jsonResponse(listPayload('V2')));
    vi.stubGlobal('fetch', fetchMock);
    const params = { limit: 24, offset: 0 };
    await getProducts(params);
    clock = start + 61_000;
    const stale = await getProducts(params);
    expect(stale.items[0].name).toBe('V1');
    await vi.waitFor(async () => {
      const fresh = await getProducts(params);
      expect(fresh.items[0].name).toBe('V2');
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not cache quote submissions', async () => {
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(jsonResponse({ id: 'q1', status: 'received' })));
    vi.stubGlobal('fetch', fetchMock);
    await createQuoteRequest({} as QuoteRequestPayload);
    await createQuoteRequest({} as QuoteRequestPayload);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('prefetches fill the exact request paths the pages will use', async () => {
    const listMock = vi.fn().mockImplementation(() => Promise.resolve(jsonResponse(listPayload('V1'))));
    vi.stubGlobal('fetch', listMock);
    prefetchCatalogFirstPage();
    await vi.waitFor(() => expect(listMock).toHaveBeenCalledTimes(1));
    expect(String(listMock.mock.calls[0][0])).toBe('/api/catalog/products?limit=24&offset=0&include_facets=1');
    await getProducts(catalogQueryToRequest(parseCatalogQuery(''), true));
    expect(listMock).toHaveBeenCalledTimes(1);

    resetCatalogApiCacheForTests();
    const detailMock = vi.fn().mockImplementation(() => Promise.resolve(jsonResponse({ id: 'p', name: 'Alfa', slug: 'alfa', images: [] })));
    vi.stubGlobal('fetch', detailMock);
    prefetchProductBySlug('alfa');
    await vi.waitFor(() => expect(detailMock).toHaveBeenCalledTimes(1));
    expect(String(detailMock.mock.calls[0][0])).toBe('/api/catalog/products/alfa');
    await getProductBySlug('alfa');
    expect(detailMock).toHaveBeenCalledTimes(1);
  });

  it('silently swallows prefetch failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    expect(() => prefetchProductBySlug('alfa')).not.toThrow();
    expect(() => prefetchCatalogFirstPage()).not.toThrow();
    await Promise.resolve();
    await Promise.resolve();
  });
});
