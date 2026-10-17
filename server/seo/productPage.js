// Documento HTML de las fichas públicas /productos/:slug. Distingue dos casos que
// nunca deben confundirse: la ficha confirmada como inexistente o no pública
// (404 de documento) y cualquier fallo del servicio de catálogo (503 recuperable).

import { CATALOG_ROUTES } from '../catalog/proxy.js';
import { SLUG_PATTERN } from './sitemap.js';
import { applyHead, escapeAttribute, injectRoot, ROBOTS_INDEX, ROBOTS_NOINDEX } from './head.js';

export const PRODUCT_PAGE_TIMEOUT_MS = 8000;
export const PRODUCT_PAGE_RETRY_AFTER_SECONDS = 300;
const MAX_SLUG_LENGTH = 200;

const NOT_FOUND_BODY = '<main id="contenido"><h1>Producto no encontrado</h1><p>No hemos encontrado una ficha pública para este producto.</p><p><a href="/productos">Volver al catálogo completo</a></p></main>';
const UNAVAILABLE_BODY = '<main id="contenido"><h1>Catálogo no disponible temporalmente</h1><p>Inténtalo de nuevo en unos minutos.</p><p><a href="/productos">Ir al catálogo</a></p></main>';

const FALLBACK_TEMPLATE = '<!doctype html><html lang="es"><head><meta charset="UTF-8" /><title>AREA LRMQ</title><meta name="description" content="" /><link rel="canonical" href="https://arealrmq.es/productos" /><meta name="robots" content="noindex, follow" /><meta property="og:title" content="" /><meta property="og:description" content="" /><meta property="og:url" content="https://arealrmq.es/productos" /><meta name="twitter:title" content="" /><meta name="twitter:description" content="" /></head><body><div id="root"></div></body></html>';

export function isValidProductSlug(value) {
  return typeof value === 'string' && value.length > 0 && value.length <= MAX_SLUG_LENGTH && SLUG_PATTERN.test(value);
}

export function decodeSlug(raw) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== 'string') return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

function isAbortLike(error) {
  return error?.name === 'TimeoutError' || error?.name === 'AbortError';
}

// Classifies the upstream answer. Only an explicit "does not exist" or "not
// public" answer is 'not-found'; every service failure is 'unavailable'.
export async function loadProductDetail(slug, { fetchImpl = fetch, env = process.env, timeoutMs = PRODUCT_PAGE_TIMEOUT_MS } = {}) {
  if (!isValidProductSlug(slug)) return { status: 'not-found' };
  const route = CATALOG_ROUTES.productDetail;
  const base = env[route.envKey];
  if (!base) return { status: 'unavailable', reason: 'not-configured' };

  let upstreamUrl;
  try {
    upstreamUrl = new URL(base);
    if (upstreamUrl.protocol !== 'https:' && upstreamUrl.protocol !== 'http:') throw new Error('invalid protocol');
  } catch {
    return { status: 'unavailable', reason: 'not-configured' };
  }
  upstreamUrl.pathname = `${upstreamUrl.pathname.replace(/\/$/, '')}${route.path(slug)}`;

  let upstream;
  let body;
  try {
    upstream = await fetchImpl(upstreamUrl, { method: 'GET', headers: { accept: 'application/json' }, signal: AbortSignal.timeout(timeoutMs) });
    if (upstream.status === 404) return { status: 'not-found' };
    if (upstream.status !== 200) return { status: 'unavailable', reason: 'upstream-status' };
    body = await upstream.text();
  } catch (error) {
    return { status: 'unavailable', reason: isAbortLike(error) ? 'timeout' : 'network' };
  }

  let data;
  try {
    data = JSON.parse(body);
  } catch {
    return { status: 'unavailable', reason: 'invalid-body' };
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return { status: 'unavailable', reason: 'invalid-body' };
  if (data.error === 'PRODUCT_NOT_FOUND') return { status: 'not-found' };
  if ('publication_status' in data && data.publication_status !== 'publishable') return { status: 'not-found' };
  if ('quality_status' in data && data.quality_status !== 'approved') return { status: 'not-found' };
  if (typeof data.name !== 'string' || data.name.trim() === '') return { status: 'unavailable', reason: 'invalid-body' };

  return {
    status: 'found',
    product: {
      slug,
      name: data.name.trim(),
      brand: typeof data.brand === 'string' && data.brand.trim() ? data.brand.trim() : null,
      description: typeof data.description === 'string' && data.description.trim() ? data.description.trim() : null,
    },
    rawProduct: data,
  };
}

// Builds the full HTML document from the empty-root shell and shared React view.
export function renderProductDocument(template, result, slug, rendered) {
  const finish = (html, fallbackBody = '') => {
    if (!rendered) return fallbackBody ? injectRoot(html, fallbackBody) : html;
    const document = injectRoot(html, rendered.markup);
    // An inert template is compatible with script-src 'self'. Escape as HTML
    // text, not executable JavaScript; template.content.textContent decodes it.
    const data = `<template id="lrmq-page-data">${escapeAttribute(JSON.stringify(rendered.initialPage))}</template>`;
    return document.replace('</body>', () => `${data}</body>`);
  };
  if (rendered?.meta) return finish(applyHead(template, rendered.meta));
  if (result.status === 'found') {
    const { name, brand, description } = result.product;
    const fallback = `${name} de ${brand || result.rawProduct?.supplier_name || 'AREA LRMQ'}. Solicita presupuesto.`;
    return finish(applyHead(template, {
      title: `${name} · AREA LRMQ`,
      description: description || fallback,
      canonicalPath: `/productos/${encodeURIComponent(slug)}`,
      robots: ROBOTS_INDEX,
    }));
  }
  if (result.status === 'not-found') {
    return finish(applyHead(template, {
      title: 'Producto no encontrado · AREA LRMQ',
      description: 'No hemos encontrado una ficha pública para este producto. Explora el catálogo completo de AREA LRMQ.',
      canonicalPath: null,
      robots: ROBOTS_NOINDEX,
    }), NOT_FOUND_BODY);
  }
  return finish(applyHead(template, {
    title: 'Catálogo no disponible · AREA LRMQ',
    description: 'El catálogo no está disponible en este momento. Inténtalo de nuevo en unos minutos.',
    canonicalPath: null,
    robots: ROBOTS_INDEX,
  }), UNAVAILABLE_BODY);
}

const HEADERS = Object.freeze({
  found: { 'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=600' },
  notFound: { 'Cache-Control': 'public, max-age=0, s-maxage=300', 'X-Robots-Tag': 'noindex, follow' },
  invalidSlug: { 'Cache-Control': 'public, max-age=0, s-maxage=3600', 'X-Robots-Tag': 'noindex, follow' },
  unavailable: { 'Cache-Control': 'no-store', 'Retry-After': String(PRODUCT_PAGE_RETRY_AFTER_SECONDS) },
});

function logResult(status, reason) {
  // Never log slugs, URLs, query strings, product names or upstream messages.
  console.info(JSON.stringify({ event: 'product_page.result', status, reason: reason ?? null }));
}

function logDiagnostic(phase, errorClass) {
  // Closed diagnostic vocabulary: renderer/shell phase plus a safe error class.
  console.info(JSON.stringify({ event: 'product_page.diagnostic', phase, errorClass }));
}

function sendDocument(response, method, status, html, headers, diag = null) {
  response.status(status);
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  for (const [name, value] of Object.entries(headers)) response.setHeader(name, value);
  // Every 503 carries a closed diagnostic phase:phase-class in X-LRMQ-Diag; no
  // slugs or visitor data, and only for recoverable failures.
  if (diag) response.setHeader('X-LRMQ-Diag', diag);
  return method === 'HEAD' ? response.end() : response.send(html);
}

// Closed vocabulary only; unknown classes collapse to 'unknown'.
function diagValue(phase, errorClass) {
  if (errorClass === null || errorClass === undefined) return phase;
  return /^[A-Za-z0-9_-]{1,64}$/.test(String(errorClass)) ? `${phase}:${String(errorClass)}` : `${phase}:unknown`;
}

export async function handleProductPageRequest(request, response, deps = {}) {
  const { readShell, renderPage, fetchImpl = fetch, env = process.env, timeoutMs = PRODUCT_PAGE_TIMEOUT_MS } = deps;
  const method = request.method || 'GET';
  if (method !== 'GET' && method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    response.status(405);
    return response.end();
  }

  let template;
  try {
    template = typeof readShell === 'function' ? await readShell() : FALLBACK_TEMPLATE;
  } catch (error) {
    const phase = typeof error?.seoPhase === 'string' && /^[a-z-]{3,48}$/.test(error.seoPhase) ? error.seoPhase : 'shell-unavailable';
    logDiagnostic(phase, typeof error?.seoErrorClass === 'string' ? error.seoErrorClass : error?.name ?? 'unknown');
    logResult('unavailable', 'shell-unavailable');
    return sendDocument(response, method, 503, renderProductDocument(FALLBACK_TEMPLATE, { status: 'unavailable' }, ''), HEADERS.unavailable, diagValue(phase, error?.seoErrorClass));
  }

  const slug = decodeSlug(request.query?.slug);
  if (slug === null || !isValidProductSlug(slug)) {
    logResult('not-found', 'invalid-slug');
    return sendDocument(response, method, 404, renderProductDocument(template, { status: 'not-found' }, ''), HEADERS.invalidSlug);
  }

  const result = await loadProductDetail(slug, { fetchImpl, env, timeoutMs });
  logResult(result.status, result.reason);

  let html;
  try {
    const rendered = renderPage ? await renderPage(result, slug) : undefined;
    html = renderProductDocument(template, result, slug, rendered);
  } catch (error) {
    const phase = typeof error?.seoPhase === 'string' && /^[a-z-]{3,48}$/.test(error.seoPhase) ? error.seoPhase : 'render';
    logDiagnostic(phase, typeof error?.seoErrorClass === 'string' ? error.seoErrorClass : error?.name ?? 'unknown');
    logResult('unavailable', 'template-invalid');
    return sendDocument(response, method, 503, renderProductDocument(FALLBACK_TEMPLATE, { status: 'unavailable' }, ''), HEADERS.unavailable, diagValue(phase, error?.seoErrorClass));
  }

  if (result.status === 'found') return sendDocument(response, method, 200, html, HEADERS.found);
  if (result.status === 'not-found') return sendDocument(response, method, 404, html, HEADERS.notFound);
  return sendDocument(response, method, 503, html, HEADERS.unavailable, result.reason ?? 'unknown');
}
