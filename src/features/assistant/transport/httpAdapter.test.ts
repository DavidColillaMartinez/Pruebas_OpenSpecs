import { describe, expect, it } from 'vitest';
import {
  CHAT_CONTINUED_REQUEST_TIMEOUT_MS,
  CHAT_DEEP_CONVERSATION_TIMEOUT_MS,
  CHAT_FIRST_REQUEST_TIMEOUT_MS,
  CHAT_MAX_REQUEST_TIMEOUT_MS,
  getChatRequestTimeoutMs,
} from './httpAdapter';

describe('adaptive chat timeout', () => {
  it('starts with a short timeout for the first turn', () => {
    expect(getChatRequestTimeoutMs({ conversationTurn: 0 })).toBe(CHAT_FIRST_REQUEST_TIMEOUT_MS);
  });

  it('allows progressively more time as the conversation grows', () => {
    expect(getChatRequestTimeoutMs({ conversationTurn: 1 })).toBe(CHAT_CONTINUED_REQUEST_TIMEOUT_MS);
    expect(getChatRequestTimeoutMs({ conversationTurn: 2 })).toBe(CHAT_DEEP_CONVERSATION_TIMEOUT_MS);
    expect(getChatRequestTimeoutMs({ conversationTurn: 12 })).toBe(CHAT_MAX_REQUEST_TIMEOUT_MS);
  });
});
