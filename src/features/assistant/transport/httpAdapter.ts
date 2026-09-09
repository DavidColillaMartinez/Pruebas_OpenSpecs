import { parseChatResponse, type ChatMessagePayload, type ChatSendResult } from './types';

export const CHAT_API_ENDPOINT = '/api/chat/messages';
export const CHAT_REQUEST_TIMEOUT_MS = 10000;

export async function sendHttpChatMessage(payload: ChatMessagePayload, signal?: AbortSignal): Promise<ChatSendResult> {
  let response: Response;
  try {
    response = await fetch(CHAT_API_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: mergeSignals(signal),
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

function mergeSignals(signal?: AbortSignal): AbortSignal {
  const timeout = AbortSignal.timeout(CHAT_REQUEST_TIMEOUT_MS);
  if (!signal) return timeout;
  return AbortSignal.any([signal, timeout]);
}
