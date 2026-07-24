import { normalizeCatalogResponseStatus } from './response.js';

const ALLOWED_METHODS = {
  config: ['GET'],
  products: ['GET'],
  'quote-requests': ['POST'],
};

function getUpstreamBase(resource, hasIdentifier) {
  if (resource === 'products' && hasIdentifier) {
    return process.env.N8N_CATALOG_PRODUCT_DETAIL_UPSTREAM_BASE_URL || process.env.N8N_CATALOG_UPSTREAM_BASE_URL;
  }
  if (resource === 'products') {
    return process.env.N8N_CATALOG_PRODUCTS_LIST_UPSTREAM_BASE_URL || process.env.N8N_CATALOG_UPSTREAM_BASE_URL;
  }
  if (resource === 'config') {
    return process.env.N8N_CATALOG_CONFIG_UPSTREAM_BASE_URL || process.env.N8N_CATALOG_UPSTREAM_BASE_URL;
  }
  if (resource === 'quote-requests') {
    return process.env.N8N_CATALOG_QUOTE_UPSTREAM_BASE_URL || process.env.N8N_CATALOG_UPSTREAM_BASE_URL;
  }
  return null;
}

function getPathSegments(request) {
  const value = request.query?.path;
  return Array.isArray(value) ? value : value ? [value] : [];
}

function getUpstreamUrl(request) {
  const segments = getPathSegments(request);
  const [resource, identifier, ...rest] = segments;
  const allowedMethods = ALLOWED_METHODS[resource];

  if (!allowedMethods || rest.length > 0 || (resource === 'config' && identifier)) {
    return null;
  }

  const base = getUpstreamBase(resource, Boolean(identifier));
  if (!base) return null;

  const upstreamPath = `${base.replace(/\/$/, '')}/${resource}${identifier ? `/${encodeURIComponent(identifier)}` : ''}`;
  const query = new URLSearchParams();
  Object.entries(request.query || {}).forEach(([key, value]) => {
    if (key === 'path') return;
    (Array.isArray(value) ? value : [value]).forEach((item) => query.append(key, String(item)));
  });
  return `${upstreamPath}${query.size ? `?${query}` : ''}`;
}

function getAllowedMethods(request) {
  const [resource] = getPathSegments(request);
  return ALLOWED_METHODS[resource] || [];
}

export default async function handler(request, response) {
  const allowedMethods = getAllowedMethods(request);

  if (!allowedMethods.includes(request.method)) {
    response.setHeader('Allow', allowedMethods.join(', '));
    return response.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  const upstreamUrl = getUpstreamUrl(request);
  if (!upstreamUrl) {
    return response.status(500).json({ error: 'CATALOG_PROXY_NOT_CONFIGURED' });
  }

  try {
    const headers = { accept: 'application/json' };
    const options = { method: request.method, headers, signal: AbortSignal.timeout(10000) };

    if (request.method === 'POST') {
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
