import { parseChatResponse, type ChatMessagePayload, type ChatSendResult } from './types';

export const CHAT_API_ENDPOINT = '/api/chat/messages';
// The browser allows client timeouts with margin over the chat proxy
// (17/21/25/28) so the proxy's controlled error is never cut by the page.
// vercel.json caps the function at 35 s.
export const CHAT_FIRST_REQUEST_TIMEOUT_MS = 20000;
export const CHAT_CONTINUED_REQUEST_TIMEOUT_MS = 24000;
export const CHAT_DEEP_CONVERSATION_TIMEOUT_MS = 28000;
export const CHAT_MAX_REQUEST_TIMEOUT_MS = 31000;

export function getChatRequestTimeoutMs(payload: Pick<ChatMessagePayload, 'conversationTurn'>): number {
  if (payload.conversationTurn <= 0) return CHAT_FIRST_REQUEST_TIMEOUT_MS;
  if (payload.conversationTurn === 1) return CHAT_CONTINUED_REQUEST_TIMEOUT_MS;
  if (payload.conversationTurn === 2) return CHAT_DEEP_CONVERSATION_TIMEOUT_MS;
  return CHAT_MAX_REQUEST_TIMEOUT_MS;
}

export async function sendHttpChatMessage(payload: ChatMessagePayload, signal?: AbortSignal): Promise<ChatSendResult> {
  let response: Response;
  try {
    response = await fetch(CHAT_API_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: mergeSignals(signal, getChatRequestTimeoutMs(payload)),
    });
  } catch {
    return { kind: 'unavailable' };
  }

  let parsed: unknown;
  try {
    parsed = await response.json();
  } catch {
    return { kind: 'unavailable' };
  }

  return parseChatResponse(parsed);
}

function mergeSignals(signal: AbortSignal | undefined, timeoutMs: number): AbortSignal {
  const timeout = AbortSignal.timeout(timeoutMs);
  if (!signal) return timeout;
  return AbortSignal.any([signal, timeout]);
}
