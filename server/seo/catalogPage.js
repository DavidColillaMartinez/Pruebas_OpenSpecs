import { CATALOG_ROUTES } from '../catalog/proxy.js';
import { renderInitialDocument } from './head.js';

const TIMEOUT_MS = 8000;
const MAX_INITIAL_PAGES = 100;
const MAX_RESPONSE_BYTES = 8 * 1024 * 1024;

export async function loadCatalogPages(search, { catalogRequestForPage }, { env = process.env, fetchImpl = fetch, timeoutMs = TIMEOUT_MS } = {}) {
  const route = CATALOG_ROUTES.products;
  let base;
  try {
    base = new URL(env[route.envKey]);
    if (!['http:', 'https:'].includes(base.protocol)) throw new Error('configuration');
  } catch { return { statusCode: 503, pages: [] }; }
  const { targetPage } = catalogRequestForPage(search, 1);
  if (!Number.isSafeInteger(targetPage) || targetPage > MAX_INITIAL_PAGES) return { statusCode: 503, pages: [] };
  const pages = [];
  const seen = new Set();
  const signal = AbortSignal.timeout(timeoutMs);
  try {
    for (let page = 1; page <= targetPage; page += 1) {
      const { params } = catalogRequestForPage(search, page);
      const url = new URL(base);
      url.pathname = `${url.pathname.replace(/\/$/, '')}${route.path()}`;
      url.search = '';
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined || !route.queryKeys.includes(key)) continue;
        for (const item of Array.isArray(value) ? value : [value]) url.searchParams.append(key, String(item));
      }
      const response = await fetchImpl(url, { method: 'GET', headers: { accept: 'application/json' }, signal });
      if (response.status !== 200) throw new Error('upstream');
      const text = await response.text();
      if (Buffer.byteLength(text) > MAX_RESPONSE_BYTES) throw new Error('response-limit');
      const data = JSON.parse(text);
      const pagination = data?.pagination;
      if (!Array.isArray(data?.items) || typeof pagination?.has_more !== 'boolean'
        || pagination.offset !== Number(params.offset || 0) || pagination.limit !== Number(params.limit)
        || data.items.length > pagination.limit || (pagination.has_more && data.items.length === 0)) throw new Error('contract');
      for (const item of data.items) {
        if (!item || typeof item.id !== 'string' || seen.has(item.id)
          || ('publication_status' in item && item.publication_status !== 'publishable')
          || ('quality_status' in item && item.quality_status !== 'approved')) throw new Error('inventory');
        seen.add(item.id);
      }
      pages.push(data);
      if (!pagination.has_more && page < targetPage) return { statusCode: 404, pages: [] };
    }
    return { statusCode: 200, pages };
  } catch { return { statusCode: 503, pages: [] }; }
}

export async function handleCatalogPageRequest(request, response, deps = {}) {
  const method = request.method || 'GET';
  if (method !== 'GET' && method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    response.status(405);
    return response.end();
  }
  let statusCode;
  let html;
  try {
    const [template, renderer] = await Promise.all([deps.readShell(), deps.loadRenderer()]);
    const input = new URL(request.url || '/productos', 'https://arealrmq.es');
    // Drop tracking and unknown query fields before serializing public state.
    const search = renderer.normalizeCatalogSearch(input.search);
    const result = await loadCatalogPages(search, renderer, deps);
    statusCode = result.statusCode;
    html = renderInitialDocument(template, renderer.renderCatalogPage(result.pages, search, statusCode));
  } catch {
    statusCode = 503;
    html = '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Catálogo no disponible · AREA LRMQ</title></head><body><main><h1>Catálogo no disponible temporalmente</h1><p><a href="/productos">Reintentar</a></p></main></body></html>';
  }
  console.info(JSON.stringify({ event: 'catalog_page.result', status: statusCode }));
  response.status(statusCode);
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.setHeader('Cache-Control', statusCode === 200 ? 'public, max-age=0, s-maxage=60, stale-while-revalidate=120' : 'no-store');
  if (statusCode === 503) response.setHeader('Retry-After', '300');
  if (statusCode === 404) response.setHeader('X-Robots-Tag', 'noindex, follow');
  return method === 'HEAD' ? response.end() : response.send(html);
}
