import type { ChatMessagePayload, ChatRecommendedProduct, ChatSendResult } from './types';

export const DEMO_MODE_ENV_VAR = 'VITE_ENABLE_ASSISTANT_DEMO';

/**
 * Demo adapter for the assistant chat UI (development only).
 * Deterministic scenarios built on verified catalog fixtures:
 * - Royo "Alfa Compact fondo 46 100 2C - Mueble + Lavabo"
 *   (slug `royo-royo-alfa-compact-alfa-compact-fondo-46-100-2c-mueble-lavabo-17`, supplier Royo,
 *   46 cm depth x 100 cm width, 2-column, finished Arena Mate / Blanco Mate / ...)
 * - Manillons Torrent "Alba" circular mirror (slug `mt-espejos-alba`, Ø 60)
 * Never enables itself in production, and never falls back automatically when the real backend fails.
 */
export function isDemoModeEnabled(): boolean {
  return Boolean(import.meta.env?.DEV) && String(import.meta.env?.[DEMO_MODE_ENV_VAR]) === '1';
}

export const DEMO_PRODUCTS: ChatRecommendedProduct[] = [
  {
    productId: 'royo-royo-alfa-compact-alfa-compact-fondo-46-100-2c-mueble-lavabo-17',
    slug: 'royo-royo-alfa-compact-alfa-compact-fondo-46-100-2c-mueble-lavabo-17',
    name: 'Alfa Compact fondo 46 100 2C - Mueble + Lavabo',
    internalPath: '/productos/royo-royo-alfa-compact-alfa-compact-fondo-46-100-2c-mueble-lavabo-17',
    imageUrl: 'https://assets.colilladavid.es/proyectos/lrmq/catalogo/images/royo/promo_p017_alfa-compact_left.webp',
    facts: ['2 columnas (2C)', 'Fondo 46 cm', 'Anchura 100 cm'],
    recommendationReason: 'Coincide con la anchura de mueble de baño que buscas.',
  },
  {
    productId: 'mt-espejos-alba--v0001',
    slug: 'mt-espejos-alba',
    name: 'Alba',
    internalPath: '/productos/mt-espejos-alba',
    imageUrl: 'https://assets.colilladavid.es/proyectos/lrmq/catalogo/images/manillons_espejos/mt26-esp-alba-i01.webp',
    facts: ['Espejo circular Ø 60', 'Sin iluminación LED'],
    recommendationReason: 'Un espejo circular puede completar tu conjunto de baño.',
  },
];

const OFFICIAL_CHANNELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  phone: 'Teléfono',
  instagram: 'Instagram',
  map: 'Google Maps',
};

export const DEMO_SESSION_EXPIRED_REQUEST_ID = 'request-session-expired-demo';
export const DEFAULT_DEMO_LATENCY_MS = 120;

type DemoAction = { type: 'contact_official'; label: string; target: string };

function success(conversationId: string, message: string, products: ChatRecommendedProduct[], actions: DemoAction[] = []): ChatSendResult {
  return { kind: 'success', conversationId, message, products, actions };
}

export function buildDemoResult(payload: ChatMessagePayload): ChatSendResult {
  if (payload.conversationId !== null || payload.version !== 1) {
    return { kind: 'error', code: 'INVALID_REQUEST', message: 'No hemos podido interpretar el mensaje.', retryable: false };
  }
  if (payload.requestId === DEMO_SESSION_EXPIRED_REQUEST_ID) {
    return { kind: 'error', code: 'SESSION_EXPIRED', message: 'La conversación ha caducado. Puedes empezar una nueva.', retryable: false };
  }
  const text = payload.message.toLowerCase();
  if (/hola|buenas|reforma|qué necesitas|que necesitas/.test(text)) {
    return success('demo-y5r8t2', 'Puedo ayudarte a encontrar productos del catálogo o a orientarte sobre tu reforma. Dime qué necesitas.', []);
  }
  if (/mueble|lavabo|baño|80|100/.test(text)) {
    return success('demo-y5r8t2', 'He encontrado este mueble de baño en nuestro catálogo:', [DEMO_PRODUCTS[0]]);
  }
  if (/espejo/.test(text)) {
    return success('demo-y5r8t2', 'Para un conjunto de baño un espejo circular es una buena opción:', [DEMO_PRODUCTS[1]]);
  }
  if (/contacto|hablar|llamar|whatsapp/.test(text)) {
    return success('demo-y5r8t2', 'Puedes escribirnos por WhatsApp o usar cualquiera de nuestros canales oficiales publicados en la web:', [], [{ type: 'contact_official', label: OFFICIAL_CHANNELS.whatsapp, target: 'whatsapp' }]);
  }
  return success('demo-y5r8t2', 'Cuéntame más sobre tu reforma o sobre el producto que buscas.', []);
}

export async function sendDemoChatMessage(payload: ChatMessagePayload): Promise<ChatSendResult> {
  if (!isDemoModeEnabled()) {
    return { kind: 'unavailable' };
  }
  await new Promise((resolve) => setTimeout(resolve, DEFAULT_DEMO_LATENCY_MS));
  return buildDemoResult(payload);
}

