import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handleProductPageRequest, loadProductDetail, renderProductDocument } from './productPage.js';

const TEMPLATE = '<!doctype html><html lang="es"><head><title>x</title><meta name="description" content="x" /><link rel="canonical" href="https://arealrmq.es/productos" /><meta name="robots" content="index, follow" /><meta property="og:title" content="x" /><meta property="og:description" content="x" /><meta property="og:url" content="https://arealrmq.es/productos" /><meta name="twitter:title" content="x" /><meta name="twitter:description" content="x" /></head><body><div id="root"></div></body></html>';
const ENV = { N8N_CATALOG_PRODUCT_DETAIL_UPSTREAM_BASE_URL: 'https://upstream.example.test/webhook/catalog' };
const SLUG = 'gme-mamparas-ducha-akord';

function jsonResponse(status, body) {
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

function fakeResponse() {
  const headers = {};
  const res = {
    statusCode: 200,
    body: undefined,
    headers,
    status(code) { res.statusCode = code; return res; },
    setHeader(name, value) { headers[name.toLowerCase()] = value; return res; },
    send(body) { res.body = body; return res; },
    end(body) { res.body = body; return res; },
  };
  return res;
}

function request(overrides = {}) {
  return { method: 'GET', query: { slug: SLUG }, ...overrides };
}

describe('loadProductDetail', () => {
  it('returns found with normalized public fields for a publishable product', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(200, { name: ' Mamparas Akord ', brand: 'GME', description: 'Mampara a medida', publication_status: 'publishable' }));
    const result = await loadProductDetail(SLUG, { fetchImpl, env: ENV });
    expect(result).toMatchObject({ status: 'found', product: { slug: SLUG, name: 'Mamparas Akord', brand: 'GME', description: 'Mampara a medida' }, rawProduct: { publication_status: 'publishable' } });
    const [url, options] = fetchImpl.mock.calls[0];
    expect(url.toString()).toBe(`https://upstream.example.test/webhook/catalog/products/${SLUG}`);
    expect(options.method).toBe('GET');
  });

  it('maps an upstream 404 to not-found', async () => {
    expect(await loadProductDetail(SLUG, { fetchImpl: async () => new Response('', { status: 404 }), env: ENV })).toEqual({ status: 'not-found' });
  });

  it('maps PRODUCT_NOT_FOUND inside a 200 body to not-found', async () => {
    const fetchImpl = async () => jsonResponse(200, { error: 'PRODUCT_NOT_FOUND' });
    expect((await loadProductDetail(SLUG, { fetchImpl, env: ENV })).status).toBe('not-found');
  });

  it('treats a non-publishable product as not-found', async () => {
    const fetchImpl = async () => jsonResponse(200, { name: 'Borrador', publication_status: 'draft' });
    expect((await loadProductDetail(SLUG, { fetchImpl, env: ENV })).status).toBe('not-found');
  });

  it('keeps an explicitly unapproved product out of indexation consistently with the sitemap', async () => {
    const fetchImpl = async () => jsonResponse(200, { name: 'Pendiente', publication_status: 'publishable', quality_status: 'pending' });
    expect((await loadProductDetail(SLUG, { fetchImpl, env: ENV })).status).toBe('not-found');
  });

  it('reports upstream 5xx as unavailable, never as not-found', async () => {
    const result = await loadProductDetail(SLUG, { fetchImpl: async () => new Response('boom', { status: 500 }), env: ENV });
    expect(result).toEqual({ status: 'unavailable', reason: 'upstream-status' });
  });

  it('reports a timeout as unavailable with reason timeout', async () => {
    const fetchImpl = async () => { throw Object.assign(new Error('aborted'), { name: 'TimeoutError' }); };
    expect(await loadProductDetail(SLUG, { fetchImpl, env: ENV })).toEqual({ status: 'unavailable', reason: 'timeout' });
  });

  it('reports a network failure as unavailable with reason network', async () => {
    const fetchImpl = async () => { throw new TypeError('fetch failed'); };
    expect(await loadProductDetail(SLUG, { fetchImpl, env: ENV })).toEqual({ status: 'unavailable', reason: 'network' });
  });

  it('reports an invalid JSON body or missing name as unavailable invalid-body', async () => {
    expect(await loadProductDetail(SLUG, { fetchImpl: async () => jsonResponse(200, '{no json'), env: ENV })).toEqual({ status: 'unavailable', reason: 'invalid-body' });
    expect(await loadProductDetail(SLUG, { fetchImpl: async () => jsonResponse(200, { brand: 'GME' }), env: ENV })).toEqual({ status: 'unavailable', reason: 'invalid-body' });
  });

  it('does not call the upstream when the upstream URL is not configured', async () => {
    const fetchImpl = vi.fn();
    expect(await loadProductDetail(SLUG, { fetchImpl, env: {} })).toEqual({ status: 'unavailable', reason: 'not-configured' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('classifies malformed configuration as a service failure rather than throwing or returning 404', async () => {
    const fetchImpl = vi.fn();
    const result = await loadProductDetail(SLUG, { fetchImpl, env: { ...ENV, N8N_CATALOG_PRODUCT_DETAIL_UPSTREAM_BASE_URL: 'invalid URL' } });
    expect(result).toEqual({ status: 'unavailable', reason: 'not-configured' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('never calls the upstream for an invalid slug', async () => {
    const fetchImpl = vi.fn();
    expect(await loadProductDetail('../admin', { fetchImpl, env: ENV })).toEqual({ status: 'not-found' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe('renderProductDocument', () => {
  it('sets the product title, canonical and index robots and keeps #root empty for found', () => {
    const html = renderProductDocument(TEMPLATE, { status: 'found', product: { slug: SLUG, name: 'Mamparas Akord', brand: 'GME', description: null } }, SLUG);
    expect(html).toContain('<title>Mamparas Akord · AREA LRMQ</title>');
    expect(html).toContain(`<link rel="canonical" href="https://arealrmq.es/productos/${SLUG}" />`);
    expect(html).toContain('<meta name="robots" content="index, follow" />');
    expect(html).toContain('<div id="root"></div>');
  });

  it('escapes hostile product text in attributes', () => {
    const html = renderProductDocument(TEMPLATE, { status: 'found', product: { slug: SLUG, name: '<script>alert(1)</script>"x"', brand: null, description: null } }, SLUG);
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;&quot;x&quot;');
  });

  it('omits canonicals on errors and reserves noindex for confirmed absence', () => {
    const notFound = renderProductDocument(TEMPLATE, { status: 'not-found' }, SLUG);
    const unavailable = renderProductDocument(TEMPLATE, { status: 'unavailable', reason: 'timeout' }, SLUG);
    expect(notFound).toContain('<h1>Producto no encontrado</h1>');
    expect(notFound).toContain('<meta name="robots" content="noindex, follow" />');
    expect(unavailable).toContain('<h1>Catálogo no disponible temporalmente</h1>');
    expect(unavailable).toContain('<meta name="robots" content="index, follow" />');
    expect(notFound).not.toContain('rel="canonical"');
    expect(unavailable).not.toContain('rel="canonical"');
    expect(notFound).not.toBe(unavailable);
  });
});

describe('handleProductPageRequest', () => {
  let infoSpy;
  beforeEach(() => {
    infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
  });
  afterEach(() => {
    infoSpy.mockRestore();
  });

  const readShell = async () => TEMPLATE;

  it('answers 200 with an indexable document for a found product and public caching', async () => {
    const res = fakeResponse();
    const fetchImpl = async () => jsonResponse(200, { name: 'Mamparas Akord', publication_status: 'publishable' });
    await handleProductPageRequest(request(), res, { readShell, fetchImpl, env: ENV });
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/html; charset=utf-8');
    expect(res.headers['cache-control']).toContain('s-maxage=300');
    expect(res.body).toContain('<title>Mamparas Akord · AREA LRMQ</title>');
  });

  it('answers 404 with noindex when the upstream says the product does not exist', async () => {
    const res = fakeResponse();
    await handleProductPageRequest(request(), res, { readShell, fetchImpl: async () => new Response('', { status: 404 }), env: ENV });
    expect(res.statusCode).toBe(404);
    expect(res.headers['x-robots-tag']).toBe('noindex, follow');
    expect(res.body).toContain('Producto no encontrado');
  });

  it('answers 503 with Retry-After and no-store when the service fails, never 404', async () => {
    const res = fakeResponse();
    await handleProductPageRequest(request(), res, { readShell, fetchImpl: async () => new Response('', { status: 502 }), env: ENV });
    expect(res.statusCode).toBe(503);
    expect(res.headers['retry-after']).toBe('300');
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.headers['x-lrmq-diag']).toBe('upstream-status');
    expect(res.headers['x-robots-tag']).toBeUndefined();
  });

  it('answers 404 without calling the upstream for an invalid slug', async () => {
    const res = fakeResponse();
    const fetchImpl = vi.fn();
    await handleProductPageRequest({ method: 'GET', query: { slug: 'Ñandú/../x' } }, res, { readShell, fetchImpl, env: ENV });
    expect(res.statusCode).toBe(404);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('answers 503 with a shell diagnostic phase when the shell cannot be read', async () => {
    const res = fakeResponse();
    await handleProductPageRequest(request(), res, {
      readShell: async () => { throw Object.assign(new Error('hidden path'), { seoPhase: 'shell-missing', seoErrorClass: 'ENOENT' }); },
      env: ENV,
    });
    expect(res.statusCode).toBe(503);
    expect(res.headers['x-lrmq-diag']).toBe('shell-missing:ENOENT');
    expect(res.headers['retry-after']).toBe('300');
    expect(res.body).not.toContain('content="noindex');
    expect(res.body).not.toContain('hidden path');
  });

  it('fails recoverably if shared rendering fails instead of serving an empty success document', async () => {
    const res = fakeResponse();
    await handleProductPageRequest(request(), res, {
      readShell,
      fetchImpl: async () => jsonResponse(200, { name: 'Mamparas Akord', publication_status: 'publishable' }),
      renderPage: () => { throw new Error('invalid public model'); },
      env: ENV,
    });
    expect(res.statusCode).toBe(503);
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.headers['x-lrmq-diag']).toBe('render');
    expect(res.body).not.toContain('content="noindex');
  });

  it('answers 405 with Allow for unsupported methods', async () => {
    const res = fakeResponse();
    await handleProductPageRequest(request({ method: 'POST' }), res, { readShell, env: ENV });
    expect(res.statusCode).toBe(405);
    expect(res.headers.allow).toBe('GET, HEAD');
  });

  it('sends headers without a body for HEAD', async () => {
    const res = fakeResponse();
    const fetchImpl = async () => new Response('', { status: 404 });
    await handleProductPageRequest(request({ method: 'HEAD' }), res, { readShell, fetchImpl, env: ENV });
    expect(res.statusCode).toBe(404);
    expect(res.body).toBeUndefined();
  });

  it('logs only the status and a safe reason, never the slug or URL', async () => {
    const res = fakeResponse();
    await handleProductPageRequest(request(), res, { readShell, fetchImpl: async () => new Response('', { status: 500 }), env: ENV });
    const logged = infoSpy.mock.calls.map((call) => call[0]).join('\n');
    expect(logged).toContain('product_page.result');
    expect(logged).not.toContain(SLUG);
    expect(logged).not.toContain('upstream.example.test');
  });
});
