import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import configHandler from '../../api/catalog/config.js';
import productsHandler from '../../api/catalog/products.js';
import productDetailHandler from '../../api/catalog/products/[slug].js';
import quoteRequestsHandler from '../../api/catalog/quote-requests.js';

const RESOURCE_ENV = {
  N8N_CATALOG_CONFIG_UPSTREAM_BASE_URL: 'https://config.example/catalog',
  N8N_CATALOG_PRODUCTS_UPSTREAM_BASE_URL: 'https://products.example/catalog',
  N8N_CATALOG_PRODUCT_DETAIL_UPSTREAM_BASE_URL: 'https://detail.example/catalog',
  N8N_CATALOG_QUOTE_REQUESTS_UPSTREAM_BASE_URL: 'https://quotes.example/catalog',
};

const originalEnv = Object.fromEntries(Object.keys(RESOURCE_ENV).map((key) => [key, process.env[key]]));

function createResponse() {
  const result = { statusCode: 200, headers: {}, body: undefined };
  return {
    result,
    setHeader(name, value) { result.headers[name] = value; },
    status(code) { result.statusCode = code; return this; },
    json(body) { result.body = body; return this; },
    send(body) { result.body = body; return this; },
  };
}

function restoreEnvironment() {
  Object.entries(originalEnv).forEach(([key, value]) => {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  });
}

function responseBody(body, status = 200) {
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  restoreEnvironment();
});

describe('explicit Vercel catalog entrypoints', () => {
  it('routes static config requests without query.path', async () => {
    Object.assign(process.env, RESOURCE_ENV);
    const fetchMock = vi.fn().mockResolvedValue(responseBody({ api_contract_version: '1' }));
    vi.stubGlobal('fetch', fetchMock);
    const response = createResponse();

    await configHandler({ method: 'GET', query: { locale: 'es' } }, response);

    expect(response.result.statusCode).toBe(200);
    expect(String(fetchMock.mock.calls[0][0])).toBe('https://config.example/catalog/config?locale=es');
    expect(fetchMock.mock.calls[0][1].method).toBe('GET');
  });

  it('routes static product-list requests and forwards query strings', async () => {
    Object.assign(process.env, RESOURCE_ENV);
    const fetchMock = vi.fn().mockResolvedValue(responseBody({ items: [] }));
    vi.stubGlobal('fetch', fetchMock);
    const response = createResponse();

    await productsHandler({ method: 'GET', query: { limit: '24', category: ['muebles', 'espejos'] } }, response);

    expect(response.result.statusCode).toBe(200);
    expect(String(fetchMock.mock.calls[0][0])).toBe('https://products.example/catalog/products?limit=24&category=muebles&category=espejos');
  });

  it('routes dynamic detail requests from query.slug without duplicating the slug', async () => {
    Object.assign(process.env, RESOURCE_ENV);
    const fetchMock = vi.fn().mockResolvedValue(responseBody({ id: 'alba' }));
    vi.stubGlobal('fetch', fetchMock);
    const response = createResponse();

    await productDetailHandler({ method: 'GET', query: { slug: 'mt/espejos-alba', locale: 'es' } }, response);

    expect(response.result.statusCode).toBe(200);
    expect(String(fetchMock.mock.calls[0][0])).toBe('https://detail.example/catalog/products/mt%2Fespejos-alba?locale=es');
    expect(String(fetchMock.mock.calls[0][0])).not.toContain('slug=');
  });

  it('normalizes upstream 200 PRODUCT_NOT_FOUND to public 404', async () => {
    Object.assign(process.env, RESOURCE_ENV);
    const body = { error: 'PRODUCT_NOT_FOUND', message: 'Producto no encontrado' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(responseBody(body)));
    const response = createResponse();

    await productDetailHandler({ method: 'GET', query: { slug: 'no-existe-lrmq' } }, response);

    expect(response.result.statusCode).toBe(404);
    expect(response.result.body).toBe(JSON.stringify(body));
  });

  it('forwards quote request bodies only through the mocked fetch', async () => {
    Object.assign(process.env, RESOURCE_ENV);
    const fetchMock = vi.fn().mockResolvedValue(responseBody({ id: 'quote-1', status: 'received' }));
    vi.stubGlobal('fetch', fetchMock);
    const response = createResponse();
    const body = { name: 'Test', email: 'test@example.com' };

    await quoteRequestsHandler({ method: 'POST', query: {}, body }, response);

    expect(response.result.statusCode).toBe(200);
    expect(String(fetchMock.mock.calls[0][0])).toBe('https://quotes.example/catalog/quote-requests');
    expect(fetchMock.mock.calls[0][1].body).toBe(JSON.stringify(body));
  });

  it('rejects methods not allowed without contacting upstream', async () => {
    Object.assign(process.env, RESOURCE_ENV);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const response = createResponse();

    await configHandler({ method: 'POST', query: {} }, response);

    expect(response.result.statusCode).toBe(405);
    expect(response.result.headers.Allow).toBe('GET');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns public errors for missing configuration and upstream failures', async () => {
    Object.assign(process.env, RESOURCE_ENV);
    delete process.env.N8N_CATALOG_CONFIG_UPSTREAM_BASE_URL;
    const missingResponse = createResponse();
    const fetchMock = vi.fn().mockRejectedValue(Object.assign(new Error('timeout'), { name: 'TimeoutError' }));
    vi.stubGlobal('fetch', fetchMock);

    await configHandler({ method: 'GET', query: {} }, missingResponse);
    expect(missingResponse.result.statusCode).toBe(500);
    expect(missingResponse.result.body).toEqual({ error: 'CATALOG_PROXY_NOT_CONFIGURED' });

    process.env.N8N_CATALOG_CONFIG_UPSTREAM_BASE_URL = RESOURCE_ENV.N8N_CATALOG_CONFIG_UPSTREAM_BASE_URL;
    const timeoutResponse = createResponse();
    await configHandler({ method: 'GET', query: {} }, timeoutResponse);
    expect(timeoutResponse.result.statusCode).toBe(502);
    expect(timeoutResponse.result.body).toEqual({ error: 'CATALOG_UPSTREAM_TIMEOUT', message: 'No se pudo consultar el catálogo.' });
  });

  it('keeps only the four physical Vercel catalog entrypoints under api/catalog', () => {
    const catalogDirectory = resolve(process.cwd(), 'api/catalog');
    const names = readdirSync(catalogDirectory);

    expect(names).toEqual(expect.arrayContaining(['config.js', 'products.js', 'quote-requests.js', 'products']));
    expect(existsSync(resolve(catalogDirectory, '[...path].js'))).toBe(false);
    expect(existsSync(resolve(catalogDirectory, 'response.js'))).toBe(false);
  });
});
