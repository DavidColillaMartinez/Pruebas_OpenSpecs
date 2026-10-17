// Sitemap del catálogo público. Enumera el listado publicado del upstream con
// offset/limit y falla de forma explícita si el inventario no es consistente:
// nunca publica un sitemap vacío o parcial.

export const SITE_ORIGIN = 'https://arealrmq.es';
export const SITEMAP_STATIC_PATHS = Object.freeze(['/', '/productos']);
export const SITEMAP_PAGE_SIZE = 60;
export const SITEMAP_MAX_PAGES = 50;
export const SITEMAP_PAGE_TIMEOUT_MS = 8000;
export const SITEMAP_RETRY_AFTER_SECONDS = 300;

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const XML_ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };

export class SitemapInventoryError extends Error {
  constructor(code, status = null) {
    super(code);
    this.name = 'SitemapInventoryError';
    this.code = code;
    this.status = status;
  }
}

export function isPublicCatalogItem(item) {
  return item?.publication_status === 'publishable' && item?.quality_status === 'approved';
}

export function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, (char) => XML_ENTITIES[char]);
}

export function buildSitemapXml(slugs) {
  const paths = [...SITEMAP_STATIC_PATHS, ...slugs.map((slug) => `/productos/${encodeURIComponent(slug)}`)];
  const entries = paths.map((path) => `  <url>\n    <loc>${escapeXml(`${SITE_ORIGIN}${path}`)}</loc>\n  </url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;
}

function productsPageUrl(upstreamBase, offset) {
  const url = new URL(upstreamBase);
  url.pathname = `${url.pathname.replace(/\/$/, '')}/products`;
  url.search = new URLSearchParams({ limit: String(SITEMAP_PAGE_SIZE), offset: String(offset) }).toString();
  return url;
}

async function fetchPage(url, { fetchImpl, timeoutMs }) {
  let response;
  try {
    response = await fetchImpl(url, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(timeoutMs) });
  } catch (error) {
    const timedOut = error?.name === 'TimeoutError' || error?.name === 'AbortError';
    throw new SitemapInventoryError(timedOut ? 'UPSTREAM_TIMEOUT' : 'UPSTREAM_ERROR');
  }
  if (response.status !== 200) throw new SitemapInventoryError('UPSTREAM_STATUS', response.status);
  try {
    return await response.json();
  } catch {
    throw new SitemapInventoryError('INVALID_JSON');
  }
}

export async function enumeratePublicSlugs({
  upstreamBase,
  fetchImpl = fetch,
  maxPages = SITEMAP_MAX_PAGES,
  timeoutMs = SITEMAP_PAGE_TIMEOUT_MS,
}) {
  if (!upstreamBase) throw new SitemapInventoryError('NOT_CONFIGURED');
  const slugs = new Set();
  let excluded = 0;
  let offset = 0;

  for (let pages = 1; pages <= maxPages; pages += 1) {
    const json = await fetchPage(productsPageUrl(upstreamBase, offset), { fetchImpl, timeoutMs });
    const items = json?.items;
    const pagination = json?.pagination;
    if (!Array.isArray(items) || items.length > SITEMAP_PAGE_SIZE) throw new SitemapInventoryError('INVALID_PAGE');
    if (!pagination || pagination.offset !== offset || typeof pagination.has_more !== 'boolean') {
      throw new SitemapInventoryError('PAGINATION_MISMATCH');
    }

    let known = 0;
    for (const item of items) {
      const slug = item?.slug;
      if (typeof slug === 'string' && slugs.has(slug)) {
        known += 1;
        continue;
      }
      if (!isPublicCatalogItem(item) || typeof slug !== 'string' || !SLUG_PATTERN.test(slug)) {
        excluded += 1;
        continue;
      }
      slugs.add(slug);
    }

    // A full page of already-known slugs while more pages are announced means the
    // upstream ignored the offset. A final page can legitimately repeat one item
    // if the inventory shifted between requests, so only the "more" case fails.
    if (pagination.has_more && items.length > 0 && known === items.length) throw new SitemapInventoryError('REPEATED_PAGE');

    if (!pagination.has_more) {
      if (slugs.size === 0) throw new SitemapInventoryError('EMPTY_INVENTORY');
      return { slugs: [...slugs], pages, excluded };
    }
    if (items.length === 0) throw new SitemapInventoryError('EMPTY_PAGE_WITH_MORE');
    offset += items.length;
  }

  throw new SitemapInventoryError('PAGE_LIMIT');
}

const SUCCESS_HEADERS = Object.freeze({
  'content-type': 'application/xml; charset=utf-8',
  // Short fresh lifetime; a stale copy may answer when a later regeneration fails.
  'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400, stale-if-error=86400',
});

const FAILURE_HEADERS = Object.freeze({
  'content-type': 'text/plain; charset=utf-8',
  'cache-control': 'no-store',
  'retry-after': String(SITEMAP_RETRY_AFTER_SECONDS),
});

function defaultLog(event, details) {
  // Codes and counts only: never URLs, query strings or response bodies.
  console.info(JSON.stringify({ event, ...details }));
}

export async function buildSitemapResponse({ env = process.env, fetchImpl = fetch, log = defaultLog, ...options } = {}) {
  try {
    const { slugs, pages, excluded } = await enumeratePublicSlugs({
      upstreamBase: env.N8N_CATALOG_PRODUCTS_UPSTREAM_BASE_URL,
      fetchImpl,
      ...options,
    });
    log('seo.sitemap.built', { pages, products: slugs.length, excluded });
    return { status: 200, headers: SUCCESS_HEADERS, body: buildSitemapXml(slugs) };
  } catch (error) {
    const code = error instanceof SitemapInventoryError ? error.code : 'UNEXPECTED';
    log('seo.sitemap.failed', { code, upstreamStatus: error?.status ?? null });
    return { status: 503, headers: FAILURE_HEADERS, body: 'Sitemap temporalmente no disponible.\n' };
  }
}
