import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest';
import quoteHandler from '../../api/catalog/quote-requests.js';
import { isJsonContentType, quoteValidationErrors } from '../../server/catalog/quoteBody.js';

const RESOURCE_ENV = {
  N8N_CATALOG_QUOTE_REQUESTS_UPSTREAM_BASE_URL: 'https://quotes.example/catalog',
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

const VALID_QUOTE_BODY = {
  customerName: 'Ana',
  email: 'ana@example.com',
  consentPrivacy: true,
  items: [{ productId: 'prod-1', variantId: 'v-1', quantity: 1, productName: 'Plato de ducha a medida', supplier: 'Duplach', category: 'Platos de ducha' }],
};

beforeAll(() => {
  vi.spyOn(console, 'info').mockImplementation(() => {});
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('quote request server-side validation', () => {
  it('accepts a body matching the public contract', () => {
    expect(quoteValidationErrors(VALID_QUOTE_BODY)).toEqual([]);
  });

  it('rejects missing consent, wrong types and forbidden attribute keys', () => {
    expect(quoteValidationErrors({ ...VALID_QUOTE_BODY, consentPrivacy: false })).toContain('consentPrivacy');
    expect(quoteValidationErrors({ ...VALID_QUOTE_BODY, customerName: '' })).toContain('customerName');
    expect(quoteValidationErrors({ ...VALID_QUOTE_BODY, items: [] })).toContain('items');
    const poisoned = {
      ...VALID_QUOTE_BODY,
      items: [{ ...VALID_QUOTE_BODY.items[0], selectedAttributes: { internal_price: 10 } }],
    };
    expect(quoteValidationErrors(poisoned)).toContain('items.0.selectedAttributes');
    expect(quoteValidationErrors('not-an-object')).toEqual(['payload']);
  });

  it('rejects a direct POST reaching the upstream with an invalid body', async () => {
    Object.assign(process.env, RESOURCE_ENV);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const response = createResponse();

    await quoteHandler({ method: 'POST', query: {}, headers: { 'content-type': 'application/json' }, body: { customerName: 'Spam', consentPrivacy: true, items: [{ text: 'x'.repeat(4096) }] } }, response);

    expect(response.result.statusCode).toBe(400);
    expect(response.result.body.error).toBe('VALIDATION_ERROR');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects POST without the JSON content-type with 415 and without upstream calls', async () => {
    Object.assign(process.env, RESOURCE_ENV);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const response = createResponse();

    await quoteHandler({ method: 'POST', query: {}, headers: { 'content-type': 'text/plain' }, body: VALID_QUOTE_BODY }, response);

    expect(response.result.statusCode).toBe(415);
    expect(fetchMock).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('still accepts legitimate accented, multiline and symbolic text within limits', () => {
    const legit = {
      ...VALID_QUOTE_BODY,
      customerName: 'Ángel Río-Garza & Hijos',
      message: 'Hola,\nnecesito medidas 80×120 (esquina) —¡con urgencia!',
    };
    expect(quoteValidationErrors(legit)).toEqual([]);
  });

  it('classifies the JSON content-type contract', () => {
    expect(isJsonContentType('application/json')).toBe(true);
    expect(isJsonContentType('application/json; charset=utf-8')).toBe(true);
    expect(isJsonContentType('application/vnd.api+json')).toBe(true);
    expect(isJsonContentType('text/html')).toBe(false);
    expect(isJsonContentType('text/plain')).toBe(false);
  });
});
