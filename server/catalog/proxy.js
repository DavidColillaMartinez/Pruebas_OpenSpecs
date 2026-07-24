import { normalizeCatalogResponseStatus } from './response.js';

export const CATALOG_ROUTES = Object.freeze({
  config: Object.freeze({
    methods: ['GET'],
    envKey: 'N8N_CATALOG_CONFIG_UPSTREAM_BASE_URL',
    path: () => '/config',
  }),
  products: Object.freeze({
    methods: ['GET'],
    envKey: 'N8N_CATALOG_PRODUCTS_UPSTREAM_BASE_URL',
    path: () => '/products',
  }),
  productDetail: Object.freeze({
    methods: ['GET'],
    envKey: 'N8N_CATALOG_PRODUCT_DETAIL_UPSTREAM_BASE_URL',
    identifierQuery: 'slug',
    path: (slug) => `/products/${encodeURIComponent(slug)}`,
  }),
  quoteRequests: Object.freeze({
    methods: ['POST'],
    envKey: 'N8N_CATALOG_QUOTE_REQUESTS_UPSTREAM_BASE_URL',
    path: () => '/quote-requests',
  }),
});

function getIdentifier(request, route) {
  if (!route.identifierQuery) return null;
  const value = request.query?.[route.identifierQuery];
  return Array.isArray(value) ? value[0] : value;
}

function appendQuery(upstreamUrl, request, excludedKey) {
  Object.entries(request.query || {}).forEach(([key, value]) => {
    if (key === excludedKey) return;
    (Array.isArray(value) ? value : [value]).forEach((item) => {
      if (item !== undefined) upstreamUrl.searchParams.append(key, String(item));
    });
  });
}

function getUpstreamUrl(request, route, identifier) {
  const base = process.env[route.envKey];
  if (!base) return null;

  const upstreamUrl = new URL(base);
  upstreamUrl.pathname = `${upstreamUrl.pathname.replace(/\/$/, '')}${route.path(identifier)}`;
  appendQuery(upstreamUrl, request, route.identifierQuery);
  return upstreamUrl;
}

export async function handleCatalogRequest(request, response, route) {
  const method = request.method || 'GET';
  if (!route.methods.includes(method)) {
    response.setHeader('Allow', route.methods.join(', '));
    return response.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  const identifier = getIdentifier(request, route);
  if (route.identifierQuery && typeof identifier !== 'string') {
    return response.status(400).json({ error: 'INVALID_SLUG' });
  }

  const upstreamUrl = getUpstreamUrl(request, route, identifier);
  if (!upstreamUrl) {
    return response.status(500).json({ error: 'CATALOG_PROXY_NOT_CONFIGURED' });
  }

  try {
    const headers = { accept: 'application/json' };
    const options = { method, headers, signal: AbortSignal.timeout(10000) };

    if (method === 'POST') {
      headers['content-type'] = 'application/json';
      options.body = typeof request.body === 'string' ? request.body : JSON.stringify(request.body ?? {});
    }

    const upstreamResponse = await fetch(upstreamUrl, options);
    const body = await upstreamResponse.text();
    const contentType = upstreamResponse.headers.get('content-type');
    const cacheControl = upstreamResponse.headers.get('cache-control');

    if (contentType) response.setHeader('content-type', contentType);
    if (cacheControl) response.setHeader('cache-control', cacheControl);

    return response.status(normalizeCatalogResponseStatus(upstreamResponse.status, body)).send(body);
  } catch (error) {
    const isTimeout = error?.name === 'TimeoutError' || error?.name === 'AbortError';
    return response.status(502).json({
      error: isTimeout ? 'CATALOG_UPSTREAM_TIMEOUT' : 'CATALOG_UPSTREAM_ERROR',
      message: 'No se pudo consultar el catálogo.',
    });
  }
}
