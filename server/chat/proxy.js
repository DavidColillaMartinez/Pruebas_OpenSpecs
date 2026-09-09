import { CATALOG_BODY_BYTE_LIMIT } from '../catalog/proxy.js';
import { normalizeCatalogResponseStatus } from '../catalog/response.js';

export const CHAT_FIRST_REQUEST_TIMEOUT_MS = 15000;
export const CHAT_CONTINUED_REQUEST_TIMEOUT_MS = 19000;
export const CHAT_DEEP_CONVERSATION_TIMEOUT_MS = 23000;
export const CHAT_MAX_REQUEST_TIMEOUT_MS = 30000;
export const CHAT_MAX_CONVERSATION_TURN = 20;
export const CHAT_UPSTREAM_AUTH_HEADER = 'LRMQ_Chat_Inbound';

export const CHAT_ALLOWED_BODY_KEYS = Object.freeze(['version', 'conversationId', 'conversationTurn', 'requestId', 'message', 'context']);
export const CHAT_ALLOWED_CONTEXT_KEYS = Object.freeze(['pagePath', 'productSlug', 'filters', 'locale']);

export function getChatConversationTurn(body) {
  if (Number.isInteger(body?.conversationTurn) && body.conversationTurn >= 0 && body.conversationTurn <= CHAT_MAX_CONVERSATION_TURN) {
    return body.conversationTurn;
  }
  return body?.conversationId ? 1 : 0;
}

export function getChatUpstreamTimeoutMs(body) {
  const turn = getChatConversationTurn(body);
  if (turn <= 0) return CHAT_FIRST_REQUEST_TIMEOUT_MS;
  if (turn === 1) return CHAT_CONTINUED_REQUEST_TIMEOUT_MS;
  if (turn === 2) return CHAT_DEEP_CONVERSATION_TIMEOUT_MS;
  return CHAT_MAX_REQUEST_TIMEOUT_MS;
}

function containsKey(record, allowedKeys, { allowEmpty = false } = {}) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return false;
  const keys = Object.keys(record);
  if (allowEmpty && keys.length === 0) return true;
  return keys.length > 0 && keys.every((key) => allowedKeys.includes(key));
}

export function sanitizeChatBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  if (!containsKey(body, CHAT_ALLOWED_BODY_KEYS)) return null;
  if (body.version !== 1) return null;
  if (body.conversationId !== null && typeof body.conversationId !== 'string') return null;
  if (typeof body.conversationId !== 'string' && body.conversationId !== null) return null;
  if (body.conversationTurn !== undefined && (!Number.isInteger(body.conversationTurn) || body.conversationTurn < 0 || body.conversationTurn > CHAT_MAX_CONVERSATION_TURN)) return null;
  if (typeof body.requestId !== 'string' || !/^[A-Za-z0-9._:-]{8,64}$/.test(body.requestId)) return null;
  if (typeof body.message !== 'string' || body.message.trim().length === 0 || body.message.length > 2000) return null;
  const context = body.context;
  if (!containsKey(context, CHAT_ALLOWED_CONTEXT_KEYS, { allowEmpty: false })) return null;
  if (typeof context.pagePath !== 'string' || !context.pagePath.startsWith('/')) return null;
  if (context.productSlug !== null && (typeof context.productSlug !== 'string' || context.productSlug.length > 128)) return null;
  const filters = context.filters;
  if (!filters || typeof filters !== 'object' || Array.isArray(filters)) return null;
  for (const [key, value] of Object.entries(filters)) {
    if (typeof key !== 'string' || key.length > 40) return null;
    if (typeof value !== 'string' || value.length > 80) return null;
  }
  if (context.locale !== 'es') return null;
  return body;
}

export async function handleChatRequest(request, response, runtimeEnv = process.env) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ version: 1, requestId: 'server', error: { code: 'INVALID_REQUEST', message: 'Método no permitido.', retryable: false } });
  }

  const sanitized = sanitizeChatBody(request.body);
  if (!sanitized) {
    return response.status(400).json({
      version: 1,
      requestId: 'server',
      error: { code: 'INVALID_REQUEST', message: 'Cuerpo fuera de contrato.', retryable: false },
    });
  }

  const base = runtimeEnv.CHAT_UPSTREAM_BASE_URL;
  const authValue = runtimeEnv.CHAT_UPSTREAM_AUTH_VALUE;
  if (!base || !authValue) {
    return response.status(502).json({
      version: 1,
      requestId: sanitized.requestId,
      error: { code: 'CHAT_UNAVAILABLE', message: 'Ahora mismo no podemos responder. Inténtalo de nuevo más tarde.', retryable: false },
    });
  }

  try {
    const upstreamResponse = await fetch(base, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        [CHAT_UPSTREAM_AUTH_HEADER]: authValue,
      },
      body: JSON.stringify(sanitized),
      signal: AbortSignal.timeout(getChatUpstreamTimeoutMs(sanitized)),
    });
    const raw = await upstreamResponse.text();
    if (raw.length > CATALOG_BODY_BYTE_LIMIT) {
      return response.status(502).json({
        version: 1,
        requestId: sanitized.requestId,
        error: { code: 'CHAT_UNAVAILABLE', message: 'Ahora mismo no podemos responder. Inténtalo de nuevo más tarde.', retryable: true },
      });
    }
    response.statusCode = normalizeCatalogResponseStatus(upstreamResponse.status, raw);
    response.setHeader('content-type', upstreamResponse.headers.get('content-type') || 'application/json');
    const cacheControl = upstreamResponse.headers.get('cache-control');
    if (cacheControl) response.setHeader('cache-control', cacheControl);
    return response.end(raw);
  } catch (error) {
    const timedOut = error?.name === 'TimeoutError' || error?.name === 'AbortError';
    return response.status(502).json({
      version: 1,
      requestId: sanitized.requestId,
      error: timedOut
        ? { code: 'CHAT_UNAVAILABLE', message: 'Ahora mismo no podemos responder. Inténtalo de nuevo más tarde.', retryable: true }
        : { code: 'CHAT_UNAVAILABLE', message: 'Ahora mismo no podemos responder. Inténtalo de nuevo más tarde.', retryable: false },
    });
  }
}
