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
  /** Optional plain-text draft the backend attached to official WhatsApp
   * actions (version 1 contract, ≤ 1000 chars). Never accepted for other
   * targets; a draft for legacy actions is simply absent. */
  draftText?: string;
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
// Backend contract (version 1): an optional plain draft for WhatsApp actions.
export const CHAT_ACTION_DRAFT_MAX_LENGTH = 1000;

function normalizeChatAction(value: Record<string, unknown>): ChatAction | null {
  const type = value.type as ChatAction['type'];
  const label = value.label;
  if (!isPlainString(label)) return null;
  const target = value.target;
  if (type === 'navigate_internal') {
    if (!isInternalPath(target)) return null;
    return { type, label, target };
  }
  if (!isOfficialContactTarget(target)) return null;
  const draftText = value.draftText;
  // Only WhatsApp actions may carry a draft; anything else (including a model
  // URL or handoff fields) is dropped here while the official action survives.
  if (typeof draftText === 'string' && draftText.trim().length > 0 && draftText.length <= CHAT_ACTION_DRAFT_MAX_LENGTH) {
    if (target === 'whatsapp') return { type, label, target, draftText };
  }
  return { type, label, target };
}

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
  if (!CHAT_ACTION_TYPES.has(String(value.type))) return false;
  return normalizeChatAction(value) !== null;
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
  const actions: ChatAction[] = [];
  if (Array.isArray(raw.actions)) {
    for (const candidate of raw.actions) {
      if (isRecord(candidate) && CHAT_ACTION_TYPES.has(String(candidate.type))) {
        const normalized = normalizeChatAction(candidate);
        if (normalized) actions.push(normalized);
      }
    }
  }
  return { kind: 'success', conversationId, message, products, actions };
}
