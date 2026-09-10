import { randomUUID } from 'node:crypto';
import { normalizeCatalogResponseStatus } from './response.js';
import { isJsonContentType, quoteValidationErrors } from './quoteBody.js';

export { isJsonContentType };

export const CATALOG_BODY_BYTE_LIMIT = 65536;
// One deadline below the browser's 10s budget, including any transport retry.
const CATALOG_UPSTREAM_GET_TIMEOUT_MS = 8000;
const CATALOG_UPSTREAM_MAX_GET_ATTEMPTS = 2;
const CATALOG_PRODUCT_QUERY_KEYS = Object.freeze([
  'limit',
  'offset',
  'include_facets',
  'search',
  'sort',
  'category',
  'category_id',
  'supplier',
  'supplier_id',
  'locale',
  'subcategory',
  'collection',
  'distribution',
  'shape',
  'has_led',
  'lighting_type',
  'product_kind',
  'finish',
  'measure',
  'modularity',
  'model',
  'texture',
  'color',
  'grille',
  'valve',
  'orientation',
  'finish_family',
]);

export const CATALOG_ROUTES = Object.freeze({
  config: Object.freeze({
    methods: ['GET'],
    envKey: 'N8N_CATALOG_CONFIG_UPSTREAM_BASE_URL',
    path: () => '/config',
    queryKeys: Object.freeze(['locale']),
  }),
  products: Object.freeze({
    methods: ['GET'],
    envKey: 'N8N_CATALOG_PRODUCTS_UPSTREAM_BASE_URL',
    path: () => '/products',
    queryKeys: CATALOG_PRODUCT_QUERY_KEYS,
  }),
  productDetail: Object.freeze({
    methods: ['GET'],
    envKey: 'N8N_CATALOG_PRODUCT_DETAIL_UPSTREAM_BASE_URL',
    identifierQuery: 'slug',
    path: (slug) => `/products/${encodeURIComponent(slug)}`,
    queryKeys: Object.freeze(['locale']),
  }),
  quoteRequests: Object.freeze({
    methods: ['POST'],
    envKey: 'N8N_CATALOG_QUOTE_REQUESTS_UPSTREAM_BASE_URL',
    path: () => '/quote-requests',
    queryKeys: Object.freeze([]),
  }),
});

export function catalogQueryKeysForPath(publicPath) {
  if (publicPath.startsWith('/api/catalog/products/')) return CATALOG_ROUTES.productDetail.queryKeys;
  if (publicPath.startsWith('/api/catalog/products')) return CATALOG_ROUTES.products.queryKeys;
  if (publicPath.startsWith('/api/catalog/config')) return CATALOG_ROUTES.config.queryKeys;
  if (publicPath.startsWith('/api/catalog/quote-requests')) return CATALOG_ROUTES.quoteRequests.queryKeys;
  return [];
}

export function pickAllowedSearchParams(searchParams, allowedKeys) {
  const picked = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (allowedKeys.includes(key)) picked.append(key, value);
  });
  return picked;
}

function getIdentifier(request, route) {
  if (!route.identifierQuery) return null;
  const value = request.query?.[route.identifierQuery];
  return Array.isArray(value) ? value[0] : value;
}

function appendQuery(upstreamUrl, request, route, excludedKey) {
  Object.entries(request.query || {}).forEach(([key, value]) => {
    if (key === excludedKey) return;
    if (!route.queryKeys.includes(key)) return;
    (Array.isArray(value) ? value : [value]).forEach((item) => {
      if (item !== undefined) upstreamUrl.searchParams.append(key, String(item));
    });
  });
}

function requestBodyBytes(body) {
  const text = typeof body === 'string' ? body : JSON.stringify(body ?? {});
  return new TextEncoder().encode(text).length;
}

function getRequestContentType(request) {
  const raw = request.headers?.['content-type'];
  return Array.isArray(raw) ? raw[0] : raw;
}

function getUpstreamUrl(request, route, identifier) {
  const base = process.env[route.envKey];
  if (!base) return null;

  const upstreamUrl = new URL(base);
  upstreamUrl.pathname = `${upstreamUrl.pathname.replace(/\/$/, '')}${route.path(identifier)}`;
  appendQuery(upstreamUrl, request, route, route.identifierQuery);
  return upstreamUrl;
}

function isRetryableUpstreamError(error) {
  // An aborted wait does not cancel the workflow/query. Repeating it amplifies load.
  return error?.name === 'TypeError';
}

function logUpstream(event, context, details = {}) {
  // Never log URLs, query strings, bodies, error messages or stacks: they may contain secrets or PII.
  console.info(JSON.stringify({ event, ...context, ...details }));
}

function safeErrorLabel(value) {
  return typeof value === 'string' && /^[A-Za-z0-9_]{1,64}$/.test(value) ? value : 'unknown';
}

async function fetchUpstream(upstreamUrl, options, context) {
  const maxAttempts = options.method === 'GET' ? CATALOG_UPSTREAM_MAX_GET_ATTEMPTS : 1;
  const signal = AbortSignal.timeout(options.method === 'GET' ? CATALOG_UPSTREAM_GET_TIMEOUT_MS : 10000);
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const startedAt = Date.now();
    let phase = 'headers';
    logUpstream('catalog.upstream.start', context, { attempt });
    try {
      const upstreamResponse = await fetch(upstreamUrl, {
        ...options,
        signal,
      });
      const headersMs = Date.now() - startedAt;
      phase = 'body';
      const body = await upstreamResponse.text();
      logUpstream('catalog.upstream.complete', context, {
        attempt, headersMs, durationMs: Date.now() - startedAt, status: upstreamResponse.status,
      });
      return { upstreamResponse, body };
    } catch (error) {
      lastError = error;
      logUpstream('catalog.upstream.failure', context, {
        attempt, phase, durationMs: Date.now() - startedAt,
        errorName: safeErrorLabel(error?.name),
        errorCode: safeErrorLabel(error?.cause?.code ?? error?.code),
      });
      if (signal.aborted || attempt === maxAttempts || !isRetryableUpstreamError(error)) throw error;
    }
  }

  throw lastError;
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

  if (method === 'POST') {
    if (!isJsonContentType(getRequestContentType(request))) {
      return response.status(415).json({ error: 'UNSUPPORTED_MEDIA_TYPE', message: 'La solicitud debe enviarse como application/json.' });
    }
    if (requestBodyBytes(request.body) > CATALOG_BODY_BYTE_LIMIT) {
      return response.status(413).json({ error: 'PAYLOAD_TOO_LARGE' });
    }
  }

  if (method === 'POST' && route === CATALOG_ROUTES.quoteRequests) {
    const fields = quoteValidationErrors(request.body);
    if (fields.length > 0) {
      return response.status(400).json({ error: 'VALIDATION_ERROR', message: 'La solicitud de presupuesto no es válida.', fields });
    }
  }

  const upstreamUrl = getUpstreamUrl(request, route, identifier);
  if (!upstreamUrl) {
    return response.status(500).json({ error: 'CATALOG_PROXY_NOT_CONFIGURED' });
  }

  try {
    const headers = { accept: 'application/json' };
    const options = { method, headers };

    if (method === 'POST') {
      headers['content-type'] = 'application/json';
      options.body = typeof request.body === 'string' ? request.body : JSON.stringify(request.body ?? {});
    }

    const { upstreamResponse, body } = await fetchUpstream(upstreamUrl, options, {
      requestId: randomUUID(), method,
      route: Object.keys(CATALOG_ROUTES).find((key) => CATALOG_ROUTES[key] === route) ?? 'unknown',
    });
    const contentType = upstreamResponse.headers.get('content-type');
    const cacheControl = upstreamResponse.headers.get('cache-control');
    const status = normalizeCatalogResponseStatus(upstreamResponse.status, body);

    if (contentType) response.setHeader('content-type', contentType);
    if (method === 'GET' && status === 200) {
      if (cacheControl) response.setHeader('cache-control', cacheControl);
      // Only explicitly public JSON reads are eligible. Never extend the origin's freshness lifetime.
      const maxAge = cacheControl?.match(/(?:^|,)\s*max-age=(\d+)\s*(?:,|$)/i)?.[1];
      if (contentType?.includes('application/json') && /(?:^|,)\s*public\s*(?:,|$)/i.test(cacheControl ?? '')
        && !/(?:private|no-store|no-cache)/i.test(cacheControl ?? '') && Number(maxAge) > 0) {
        const staleWindow = cacheControl.match(/(?:^|,)\s*stale-while-revalidate=(\d+)\s*(?:,|$)/i)?.[1];
        const mustRevalidate = /(?:^|,)\s*must-revalidate\s*(?:,|$)/i.test(cacheControl);
        const staleSeconds = mustRevalidate
          ? 0 : Math.min(Number(staleWindow) || 0, 300);
        const staleIfError = staleSeconds > 0 ? ', stale-if-error=300' : '';
        response.setHeader('Vercel-CDN-Cache-Control', `public, max-age=${Math.min(Number(maxAge), 60)}${staleSeconds > 0 ? `, stale-while-revalidate=${staleSeconds}` : ''}${staleIfError}`);
      }
    } else {
      response.setHeader('cache-control', 'no-store');
      response.setHeader('Vercel-CDN-Cache-Control', 'no-store');
    }

    return response.status(status).send(body);
  } catch (error) {
    response.setHeader('cache-control', 'no-store');
    response.setHeader('Vercel-CDN-Cache-Control', 'no-store');
    const isTimeout = error?.name === 'TimeoutError' || error?.name === 'AbortError';
    return response.status(502).json({
      error: isTimeout ? 'CATALOG_UPSTREAM_TIMEOUT' : 'CATALOG_UPSTREAM_ERROR',
      message: 'No se pudo consultar el catálogo.',
    });
  }
}
