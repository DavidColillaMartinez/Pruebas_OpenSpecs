import { afterEach, describe, expect, it, vi } from 'vitest';
import chatHandler from '../../api/chat/messages.js';
import { sanitizeChatBody } from '../../server/chat/proxy.js';

const RESOURCE_ENV = { CHAT_UPSTREAM_BASE_URL: 'https://chat.example/lrmq/chat' };

const VALID_BODY = {
  version: 1,
  conversationId: null,
  requestId: '8cfa0eaa1c2d4b5a9e01f2b34cd5e6a7',
  message: 'Busco un mueble de baño de 80 cm',
  context: { pagePath: '/productos', productSlug: null, filters: {}, locale: 'es' },
};

const originalEnv = { CHAT_UPSTREAM_BASE_URL: process.env.CHAT_UPSTREAM_BASE_URL };

function createResponse() {
  const result = { statusCode: 200, headers: {}, body: undefined };
  return {
    result,
    setHeader(name, value) { result.headers[name] = value; },
    status(code) { result.statusCode = code; return this; },
    json(body) { result.body = body; return this; },
    end(body) { result.body = body; return this; },
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (originalEnv.CHAT_UPSTREAM_BASE_URL === undefined) delete process.env.CHAT_UPSTREAM_BASE_URL;
  else process.env.CHAT_UPSTREAM_BASE_URL = originalEnv.CHAT_UPSTREAM_BASE_URL;
});

describe('chat proxy sanitizer', () => {
  it('accepts a valid contract body', () => {
    expect(sanitizeChatBody(VALID_BODY)).toEqual(VALID_BODY);
  });

  it('rejects unknown keys, wrong version and invalid context', () => {
    expect(sanitizeChatBody({ ...VALID_BODY, extra: 'x' })).toBeNull();
    expect(sanitizeChatBody({ ...VALID_BODY, version: 2 })).toBeNull();
    expect(sanitizeChatBody({ ...VALID_BODY, context: { ...VALID_BODY.context, locale: 'en' } })).toBeNull();
    expect(sanitizeChatBody({ ...VALID_BODY, context: { pagePath: 'otros', productSlug: null, filters: {}, locale: 'es' } })).toBeNull();
    expect(sanitizeChatBody({ ...VALID_BODY, message: '' })).toBeNull();
    expect(sanitizeChatBody({ ...VALID_BODY, requestId: 'short' })).toBeNull();
  });

  it('allows filters to be empty and product slug to be present', () => {
    expect(sanitizeChatBody({ ...VALID_BODY, conversationId: 'opaque-session-id', context: { pagePath: '/productos/mt-espejos-alba', productSlug: 'mt-espejos-alba', filters: {}, locale: 'es' } })).not.toBeNull();
  });
});

describe('chat server endpoint', () => {
  it('rejects GET requests', async () => {
    const response = createResponse();
    await chatHandler({ method: 'GET', body: null }, response);
    expect(response.result.statusCode).toBe(405);
  });

  it('returns INVALID_REQUEST for bodies outside the contract', async () => {
    const response = createResponse();
    await chatHandler({ method: 'POST', body: { hello: 'world' } }, response);
    expect(response.result.statusCode).toBe(400);
    expect(response.result.body.error.code).toBe('INVALID_REQUEST');
  });

  it('answers CHAT_UNAVAILABLE retryable=false when no upstream is configured', async () => {
    delete process.env.CHAT_UPSTREAM_BASE_URL;
    const response = createResponse();
    await chatHandler({ method: 'POST', body: VALID_BODY }, response);
    expect(response.result.statusCode).toBe(502);
    expect(response.result.body.error.code).toBe('CHAT_UNAVAILABLE');
    expect(response.result.body.error.retryable).toBe(false);
  });

  it('forwards the sanitized body and proxies a valid upstream reply', async () => {
    Object.assign(process.env, RESOURCE_ENV);
    const upstreamReply = { version: 1, conversationId: 'opaque-session-id', requestId: VALID_BODY.requestId, message: 'Hola', products: [], actions: [] };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(upstreamReply), { status: 200, headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchMock);
    const response = createResponse();

    await chatHandler({ method: 'POST', body: VALID_BODY }, response);

    expect(response.result.statusCode).toBe(200);
    expect(String(fetchMock.mock.calls[0][0])).toBe(RESOURCE_ENV.CHAT_UPSTREAM_BASE_URL);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual(VALID_BODY);
    expect(JSON.parse(String(response.result.body))).toEqual(upstreamReply);
  });

  it('maps upstream timeouts to retryable CHAT_UNAVAILABLE without leaking internals', async () => {
    Object.assign(process.env, RESOURCE_ENV);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(Object.assign(new Error('timeout'), { name: 'TimeoutError' })));
    const response = createResponse();

    await chatHandler({ method: 'POST', body: VALID_BODY }, response);

    expect(response.result.statusCode).toBe(502);
    expect(response.result.body.error.code).toBe('CHAT_UNAVAILABLE');
    expect(response.result.body.error.retryable).toBe(true);
  });
});
