import { normalizeProductDetail, normalizeProductList } from '../model/normalize';
import type { CatalogPublicConfig, ProductDetail, ProductListResponse } from '../model/types';
import type { QuoteRequestCreated, QuoteRequestPayload } from '../../quote/model/types';

export const PUBLIC_CATALOG_BASE_PATH = '/api/catalog';

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

async function request(path: string, { signal, method = 'GET', body, timeoutMs = 10000 }: RequestOptions = {}): Promise<unknown> {
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
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new CatalogApiError('TIMEOUT', 'La consulta del catálogo ha tardado demasiado.');
    }
    throw new CatalogApiError('NETWORK_ERROR', 'No se pudo conectar con el catálogo.');
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}

export async function getCatalogConfig(options?: RequestOptions): Promise<CatalogPublicConfig> {
  const data = await request('/config', options);
  if (!data || typeof data !== 'object' || !('api_contract_version' in data)) {
    throw new CatalogApiError('CONTRACT_ERROR', 'La configuración pública del catálogo no es válida.');
  }
  return data as CatalogPublicConfig;
}

export async function getProductBySlug(slug: string, config?: CatalogPublicConfig | null, options?: RequestOptions): Promise<ProductDetail> {
  if (!slug) throw new CatalogApiError('INVALID_SLUG', 'Falta el identificador del producto.');
  const data = await request(`/products/${encodeURIComponent(slug)}`, options);
  try {
    return normalizeProductDetail(data, config);
  } catch {
    throw new CatalogApiError('CONTRACT_ERROR', 'La respuesta del producto no tiene una estructura válida.');
  }
}

export async function getProducts(params: Record<string, string | number | undefined> = {}, config?: CatalogPublicConfig | null, options?: RequestOptions): Promise<ProductListResponse> {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) search.set(key, String(value));
  });
  const data = await request(`/products${search.size ? `?${search}` : ''}`, options);
  return normalizeProductList(data, config);
}

export async function createQuoteRequest(payload: QuoteRequestPayload, options?: RequestOptions): Promise<QuoteRequestCreated> {
  const data = await request('/quote-requests', { ...options, method: 'POST', body: payload });
  if (!data || typeof data !== 'object' || !('id' in data) || !('status' in data)) {
    throw new CatalogApiError('CONTRACT_ERROR', 'La confirmación del presupuesto no es válida.');
  }
  return data as QuoteRequestCreated;
}
