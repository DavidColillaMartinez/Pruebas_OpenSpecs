import { normalizeProductDetail, normalizeProductList } from '../model/normalize';
import { catalogQueryToRequest, parseCatalogQuery } from '../model/catalogQuery';
import type { CatalogPublicConfig, CatalogRequestParams, ProductDetail, ProductListResponse } from '../model/types';
import type { QuoteRequestCreated, QuoteRequestPayload } from '../../quote/model/types';

export const PUBLIC_CATALOG_BASE_PATH = '/api/catalog';

const CATALOG_CACHE_TTL_MS = 60_000;
const CATALOG_CACHE_MAX_ENTRIES = 60;

type CacheEntry = { raw: unknown; expiresAt: number };
const responseCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<unknown>>();

export function resetCatalogApiCacheForTests(): void {
  responseCache.clear();
  inFlightRequests.clear();
}

function storeInCache(path: string, raw: unknown): void {
  responseCache.delete(path);
  responseCache.set(path, { raw, expiresAt: Date.now() + CATALOG_CACHE_TTL_MS });
  while (responseCache.size > CATALOG_CACHE_MAX_ENTRIES) {
    const oldest = responseCache.keys().next().value;
    if (oldest === undefined) break;
    responseCache.delete(oldest);
  }
}

function withAbort<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(new DOMException('Request aborted', 'AbortError'));
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(new DOMException('Request aborted', 'AbortError'));
    signal.addEventListener('abort', onAbort, { once: true });
    promise.then(resolve, reject).finally(() => signal.removeEventListener('abort', onAbort));
  });
}

function scheduleRevalidation(path: string): void {
  if (inFlightRequests.has(path)) return;
  const promise: Promise<unknown> = performRequest(path).then((raw) => {
    storeInCache(path, raw);
    return raw;
  });
  inFlightRequests.set(path, promise);
  void promise.catch(() => undefined).finally(() => {
    if (inFlightRequests.get(path) === promise) inFlightRequests.delete(path);
  });
}

export class CatalogApiError extends Error {
  code: string;
  status: number;
  details: unknown;

  constructor(code: string, message: string, status = 0, details: unknown = null) {
    super(message);
    this.name = 'CatalogApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

type RequestOptions = {
  signal?: AbortSignal;
  method?: 'GET' | 'POST';
  body?: unknown;
  timeoutMs?: number;
};

function getUrl(path: string): string {
  return `${PUBLIC_CATALOG_BASE_PATH}${path}`;
}

async function parseResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    throw new CatalogApiError('INVALID_JSON', 'La respuesta del catálogo no es válida.', response.status);
  }
}

async function performRequest(path: string, { signal, method = 'GET', body, timeoutMs = 10000 }: RequestOptions = {}): Promise<unknown> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });

  try {
    const response = await fetch(getUrl(path), {
      method,
      signal: controller.signal,
      headers: { accept: 'application/json', ...(body ? { 'content-type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data = await parseResponse(response);

    if (response.status === 404 || (data && typeof data === 'object' && 'error' in data && data.error === 'PRODUCT_NOT_FOUND')) {
      throw new CatalogApiError('PRODUCT_NOT_FOUND', data && typeof data === 'object' && 'message' in data && typeof data.message === 'string' ? data.message : 'Producto no encontrado', response.status, data);
    }
    if (response.status === 429) {
      throw new CatalogApiError('RATE_LIMITED', data && typeof data === 'object' && 'message' in data && typeof data.message === 'string' ? data.message : 'Espera unos minutos antes de volver a intentarlo.', response.status, data);
    }
    if (response.status >= 400 && response.status < 500) {
      throw new CatalogApiError('VALIDATION_ERROR', data && typeof data === 'object' && 'message' in data && typeof data.message === 'string' ? data.message : 'La solicitud no es válida.', response.status, data);
    }
    if (response.status >= 500) {
      throw new CatalogApiError('SERVER_ERROR', 'El catálogo no está disponible temporalmente.', response.status, data);
    }

    return data;
  } catch (error) {
    if (error instanceof CatalogApiError) throw error;
    if (signal?.aborted) throw new DOMException('Request aborted', 'AbortError');
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new CatalogApiError('TIMEOUT', 'La consulta del catálogo ha tardado demasiado.');
    }
    throw new CatalogApiError('NETWORK_ERROR', 'No se pudo conectar con el catálogo.');
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}

async function request(path: string, { signal, method = 'GET', body, timeoutMs = 10000 }: RequestOptions = {}): Promise<unknown> {
  if (method !== 'GET') return performRequest(path, { signal, method, body, timeoutMs });

  const cached = responseCache.get(path);
  if (cached) {
    if (cached.expiresAt <= Date.now()) scheduleRevalidation(path);
    return cached.raw;
  }

  const inFlight = inFlightRequests.get(path);
  if (inFlight) return withAbort(inFlight, signal);

  const leader = performRequest(path, { timeoutMs });
  inFlightRequests.set(path, leader);
  void leader.then(
    (raw) => {
      storeInCache(path, raw);
      if (inFlightRequests.get(path) === leader) inFlightRequests.delete(path);
    },
    () => {
      if (inFlightRequests.get(path) === leader) inFlightRequests.delete(path);
    },
  );
  return withAbort(leader, signal);
}

export async function getCatalogConfig(options?: RequestOptions): Promise<CatalogPublicConfig> {
  const data = await request('/config', options);
  if (!data || typeof data !== 'object' || !('api_contract_version' in data)) {
    throw new CatalogApiError('CONTRACT_ERROR', 'La configuración pública del catálogo no es válida.');
  }
  return data as CatalogPublicConfig;
}

function detailPath(slug: string): string {
  return `/products/${encodeURIComponent(slug)}`;
}

function listPath(params: CatalogRequestParams): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((item) => search.append(key, item));
      return;
    }
    search.set(key, String(value));
  });
  return `/products${search.size ? `?${search}` : ''}`;
}

export function catalogFirstPagePath(): string {
  return listPath(catalogQueryToRequest(parseCatalogQuery(''), true));
}

export async function getProductBySlug(slug: string, config?: CatalogPublicConfig | null, options?: RequestOptions): Promise<ProductDetail> {
  if (!slug) throw new CatalogApiError('INVALID_SLUG', 'Falta el identificador del producto.');
  const data = await request(detailPath(slug), options);
  try {
    return normalizeProductDetail(data, config);
  } catch {
    throw new CatalogApiError('CONTRACT_ERROR', 'La respuesta del producto no tiene una estructura válida.');
  }
}

export async function getProducts(params: CatalogRequestParams = {}, config?: CatalogPublicConfig | null, options?: RequestOptions): Promise<ProductListResponse> {
  const data = await request(listPath(params), options);
  try {
    return normalizeProductList(data, config);
  } catch {
    throw new CatalogApiError('CONTRACT_ERROR', 'La respuesta del listado no tiene una estructura válida.');
  }
}

async function warmCache(path: string): Promise<void> {
  try {
    await request(path);
  } catch {
    /* silent: real navigation requests retry on their own */
  }
}

export function prefetchProductBySlug(slug: string): void {
  if (slug) void warmCache(detailPath(slug));
}

export function prefetchCatalogFirstPage(): void {
  void warmCache(catalogFirstPagePath());
}

export async function createQuoteRequest(payload: QuoteRequestPayload, options?: RequestOptions): Promise<QuoteRequestCreated> {
  const data = await request('/quote-requests', { ...options, method: 'POST', body: payload });
  if (!data || typeof data !== 'object' || !('id' in data) || !('status' in data)) {
    throw new CatalogApiError('CONTRACT_ERROR', 'La confirmación del presupuesto no es válida.');
  }
  return data as QuoteRequestCreated;
}
