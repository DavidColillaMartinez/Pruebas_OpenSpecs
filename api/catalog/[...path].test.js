import { afterEach, describe, expect, it, vi } from 'vitest';
import handler from './[...path].js';

const RESOURCE_ENV = {
  N8N_CATALOG_CONFIG_UPSTREAM_BASE_URL: 'https://config.example/catalog',
  N8N_CATALOG_PRODUCTS_UPSTREAM_BASE_URL: 'https://products.example/catalog',
  N8N_CATALOG_QUOTE_REQUESTS_UPSTREAM_BASE_URL: 'https://quotes.example/catalog',
  N8N_CATALOG_PRODUCT_DETAIL_UPSTREAM_BASE_URL: 'https://detail.example/catalog',
};

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

function createRequest(path, method = 'GET', query = {}) {
  return { method, query: { path: path.split('/'), ...query } };
}

afterEach(() => {
  vi.restoreAllMocks();
  Object.keys(RESOURCE_ENV).forEach((key) => { delete process.env[key]; });
});

describe('catalog server proxy', () => {
  it('routes public list GETs through the products upstream', async () => {
    Object.assign(process.env, RESOURCE_ENV);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ items: [] }), { status: 200 })));
    const response = createResponse();

    await handler(createRequest('products', 'GET', { limit: '24' }), response);

    expect(response.result.statusCode).toBe(200);
    expect(fetch).toHaveBeenCalledWith('https://products.example/catalog/products?limit=24', expect.objectContaining({ method: 'GET' }));
  });

  it('routes product detail GETs through the separate detail upstream', async () => {
    Object.assign(process.env, RESOURCE_ENV);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'alba' }), { status: 200 })));
    const response = createResponse();

    await handler(createRequest('products/mt-espejos-alba'), response);

    expect(fetch).toHaveBeenCalledWith('https://detail.example/catalog/products/mt-espejos-alba', expect.objectContaining({ method: 'GET' }));
  });

  it('normalizes an upstream 200 PRODUCT_NOT_FOUND response to public 404', async () => {
    Object.assign(process.env, RESOURCE_ENV);
    const body = JSON.stringify({ error: 'PRODUCT_NOT_FOUND', message: 'Producto no encontrado' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(body, { status: 200 })));
    const response = createResponse();

    await handler(createRequest('products/no-existe-lrmq'), response);

    expect(response.result.statusCode).toBe(404);
    expect(response.result.body).toBe(body);
  });

  it('rejects methods not allowed by the public resource contract', async () => {
    Object.assign(process.env, RESOURCE_ENV);
    const response = createResponse();

    await handler(createRequest('quote-requests', 'GET'), response);

    expect(response.result.statusCode).toBe(405);
    expect(response.result.headers.Allow).toBe('POST');
  });

  it('reports missing server-side upstream configuration without fetching', async () => {
    Object.assign(process.env, RESOURCE_ENV);
    delete process.env.N8N_CATALOG_PRODUCT_DETAIL_UPSTREAM_BASE_URL;
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const response = createResponse();

    await handler(createRequest('products/mt-espejos-alba'), response);

    expect(response.result.statusCode).toBe(500);
    expect(response.result.body).toEqual({ error: 'CATALOG_PROXY_NOT_CONFIGURED' });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
