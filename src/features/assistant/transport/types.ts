export type ChatContext = {
  pagePath: string;
  productSlug: string | null;
  filters: Record<string, string>;
  locale: 'es';
};

export type ChatMessagePayload = {
  version: 1;
  conversationId: string | null;
  conversationTurn: number;
  requestId: string;
  message: string;
  context: ChatContext;
};

export type ChatRecommendedProduct = {
  productId: string;
  slug: string;
  name: string;
  internalPath: string;
  imageUrl?: string;
  facts: string[];
  recommendationReason: string;
};

export type ChatAction = {
  type: 'navigate_internal' | 'contact_official';
  label: string;
  target: string;
};

export type ChatSuccessPayload = {
  version: 1;
  conversationId: string;
  requestId: string;
  message: string;
  products: ChatRecommendedProduct[];
  actions: ChatAction[];
};

export type ChatErrorCode = 'INVALID_REQUEST' | 'RATE_LIMITED' | 'SESSION_EXPIRED' | 'REQUEST_IN_PROGRESS' | 'CHAT_UNAVAILABLE';

export type ChatErrorKind = ChatErrorCode;

export type ChatErrorPayload = {
  version: 1;
  requestId: string;
  error: {
    code: ChatErrorKind;
    message: string;
    retryable: boolean;
  };
};

export type ChatResponseBody = ChatSuccessPayload | ChatErrorPayload;

export type ChatSendResult =
  | { kind: 'success'; conversationId: string; message: string; products: ChatRecommendedProduct[]; actions: ChatAction[] }
  | { kind: 'error'; code: ChatErrorKind; message: string; retryable: boolean }
  | { kind: 'unavailable' };

export const DEFAULT_CHAT_ERROR_TEXT: Record<ChatErrorKind, string> = Object.freeze({
  INVALID_REQUEST: 'No hemos podido interpretar el mensaje.',
  RATE_LIMITED: 'Estamos recibiendo muchas peticiones. Espera unos segundos e inténtalo de nuevo.',
  SESSION_EXPIRED: 'La conversación ha caducado. Puedes empezar una nueva.',
  REQUEST_IN_PROGRESS: 'Ya estamos procesando tu mensaje anterior. Un momento…',
  CHAT_UNAVAILABLE: 'Ahora mismo no podemos responder. Inténtalo de nuevo más tarde.',
});

const KNOWN_ERROR_CODES = new Set<string>(Object.keys(DEFAULT_CHAT_ERROR_TEXT));
export const CHAT_ACTION_TYPES = new Set<string>(['navigate_internal', 'contact_official']);
export const APPROVED_IMAGE_ORIGINS = new Set<string>(['https://assets.colilladavid.es']);

export function isPlainString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isInternalPath(value: unknown): value is string {
  if (!isPlainString(value)) return false;
  if (!value.startsWith('/')) return false;
  if (/^\s*[-a-z]+:\//i.test(value) || value.startsWith('//')) return false;
  return true;
}

export function isApprovedImageUrl(value: unknown): value is string {
  if (!isPlainString(value)) return false;
  try {
    return APPROVED_IMAGE_ORIGINS.has(new URL(value).origin);
  } catch {
    return false;
  }
}

export function isOfficialContactTarget(value: unknown): value is string {
  return value === 'whatsapp' || value === 'phone' || value === 'instagram' || value === 'map';
}

export function isValidChatContext(value: unknown): value is ChatContext {
  if (!isRecord(value)) return false;
  if (!isPlainString(value.pagePath) || !value.pagePath.startsWith('/')) return false;
  if (value.productSlug !== null && !isPlainString(value.productSlug)) return false;
  const filters = value.filters;
  if (!isRecord(filters)) return false;
  for (const [key, item] of Object.entries(filters)) {
    if (!isPlainString(key) || !isPlainString(item)) return false;
  }
  if (value.locale !== 'es') return false;
  return true;
}

export function isChatMessagePayload(value: unknown): value is ChatMessagePayload {
  if (!isRecord(value)) return false;
  if (value.version !== 1) return false;
  if (value.conversationId !== null && !isPlainString(value.conversationId)) return false;
  if (typeof value.conversationTurn !== 'number' || !Number.isInteger(value.conversationTurn) || value.conversationTurn < 0 || value.conversationTurn > 20) return false;
  if (!isPlainString(value.requestId)) return false;
  if (!isPlainString(value.message) || value.message.length > 2000) return false;
  return isValidChatContext(value.context);
}

export function isChatRecommendedProduct(value: unknown): value is ChatRecommendedProduct {
  if (!isRecord(value)) return false;
  if (!isPlainString(value.productId) || !isPlainString(value.slug) || !isPlainString(value.name)) return false;
  if (!isInternalPath(value.internalPath)) return false;
  if (value.imageUrl !== undefined && !isApprovedImageUrl(value.imageUrl)) return false;
  if (!Array.isArray(value.facts) || !value.facts.every((fact) => isPlainString(fact))) return false;
  if (!isPlainString(value.recommendationReason)) return false;
  return true;
}

export function isChatAction(value: unknown): value is ChatAction {
  if (!isRecord(value)) return false;
  if (!CHAT_ACTION_TYPES.has(String(value.type)) || !isPlainString(value.label)) return false;
  if (value.type === 'navigate_internal') return isInternalPath(value.target);
  return isOfficialContactTarget(value.target);
}

export function parseChatResponse(raw: unknown): ChatSendResult {
  if (!isRecord(raw) || raw.version !== 1) {
    return { kind: 'error', code: 'CHAT_UNAVAILABLE', message: DEFAULT_CHAT_ERROR_TEXT.CHAT_UNAVAILABLE, retryable: false };
  }

  const error = raw.error;
  if (isRecord(error)) {
    const code = String(error.code);
    if (!KNOWN_ERROR_CODES.has(code)) {
      return { kind: 'error', code: 'CHAT_UNAVAILABLE', message: DEFAULT_CHAT_ERROR_TEXT.CHAT_UNAVAILABLE, retryable: false };
    }
    return {
      kind: 'error',
      code: code as ChatErrorKind,
      message: isPlainString(error.message) ? error.message : DEFAULT_CHAT_ERROR_TEXT[code as ChatErrorKind],
      retryable: error.retryable === true && code !== 'SESSION_EXPIRED' && code !== 'INVALID_REQUEST',
    };
  }

  const conversationId = raw.conversationId;
  const message = raw.message;
  if (!isPlainString(conversationId) || !isPlainString(message)) {
    return { kind: 'error', code: 'CHAT_UNAVAILABLE', message: DEFAULT_CHAT_ERROR_TEXT.CHAT_UNAVAILABLE, retryable: false };
  }

  const products = Array.isArray(raw.products) ? raw.products.filter(isChatRecommendedProduct) : [];
  const actions = Array.isArray(raw.actions) ? raw.actions.filter(isChatAction) : [];
  return { kind: 'success', conversationId, message, products, actions };
}
