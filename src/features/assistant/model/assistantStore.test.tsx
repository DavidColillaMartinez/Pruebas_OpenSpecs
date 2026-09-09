import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  AssistantProvider,
  useAssistantChat,
  ASSISTANT_STORAGE_KEY,
  assistantReducer,
  createInitialMessages,
} from './assistantStore';
vi.mock('../transport/httpAdapter', () => ({ sendHttpChatMessage: vi.fn() }));
import { sendHttpChatMessage } from '../transport/httpAdapter';
import { buildChatContext } from './useChatContext';

function Probe() {
  const chat = useAssistantChat();
  return (
    <div>
      <p data-testid="status">{chat.status}</p>
      <p data-testid="conversation">{chat.conversationId ?? 'none'}</p>
      <p data-testid="count">{chat.messages.length}</p>
      <button type="button" onClick={() => chat.sendMessage('Busco un mueble de baño de 80 cm')}>send</button>
      <button type="button" onClick={() => chat.sendMessage('Busco un espejo')}>send-2</button>
      <button type="button" onClick={chat.startNewConversation}>reset</button>
    </div>
  );
}

beforeEach(() => {
  window.sessionStorage.clear();
});
afterEach(() => {
  window.sessionStorage.clear();
});

describe('AssistantProvider state', () => {
  it('starts with only the initial assistant message', () => {
    render(<AssistantProvider><Probe /></AssistantProvider>);
    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(screen.getByTestId('status').textContent).toBe('idle');
  });

  it('blocks duplicate sends while a request is in flight', async () => {
    let resolveSender: (value: unknown) => void = () => undefined;
    const sender = sendHttpChatMessage as unknown as ReturnType<typeof vi.fn>;
    sender.mockImplementation(() => new Promise((resolve) => { resolveSender = resolve; }));

    render(<AssistantProvider><Probe /></AssistantProvider>);
    const sendButton = screen.getByText('send');
    fireEvent.click(sendButton);
    const secondButton = screen.getByText('send-2');
    await act(async () => { /* let the first request settle first */ });
    fireEvent.click(secondButton);

    expect(sender).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('status').textContent).toBe('sending');

    await act(async () => {
      resolveSender({ kind: 'success' as const, conversationId: 'demo-id', message: 'ok', products: [], actions: [] });
    });
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('idle'));
    expect(sender).toHaveBeenCalledTimes(1);
  });

  it.skip('sends to the HTTP adapter with contract payload and keeps conversation', async () => {
    const reply = { kind: 'success' as const, conversationId: 'opaque-session-id', message: 'He encontrado esto:', products: [], actions: [] };
    const sender = sendHttpChatMessage as unknown as ReturnType<typeof vi.fn>;
    sender.mockClear();
    sender.mockImplementation(() => Promise.resolve(reply as never));
    window.history.replaceState(null, '', '/productos?category=gme');
    
    render(<AssistantProvider><Probe /></AssistantProvider>);
    fireEvent.click(screen.getByText('send'));

    const payload = sender.mock.calls[0][0] as import('../transport/types').ChatMessagePayload;
    expect(payload.version).toBe(1);
    expect(payload.conversationId).toBeNull();
    expect(payload.conversationTurn).toBe(0);
    expect(payload.message).toBe('Busco un mueble de baño de 80 cm');
    expect(payload.context.pagePath).toBe('/productos');
    expect(payload.context.productSlug).toBeNull();
    expect(payload.context.filters).toEqual({ category: 'gme' });
    expect(payload.context.locale).toBe('es');

    await waitFor(() => expect(screen.getByTestId('conversation').textContent).toBe('opaque-session-id'));
    expect(screen.getByTestId('count').textContent).toBe('3');
  });

  it('raises the timeout turn after a failed first request so retry has more time', async () => {
    const sender = sendHttpChatMessage as unknown as ReturnType<typeof vi.fn>;
    sender.mockClear();
    sender
      .mockResolvedValueOnce({ kind: 'error' as const, code: 'CHAT_UNAVAILABLE', message: 'retry', retryable: true })
      .mockResolvedValueOnce({ kind: 'success' as const, conversationId: 'retry-session', message: 'ok', products: [], actions: [] });

    render(<AssistantProvider><Probe /></AssistantProvider>);
    fireEvent.click(screen.getByText('send'));
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('unavailable'));
    fireEvent.click(screen.getByText('send-2'));

    expect(sender.mock.calls[0][0].conversationTurn).toBe(0);
    expect(sender.mock.calls[1][0].conversationTurn).toBe(1);
    await waitFor(() => expect(screen.getByTestId('conversation').textContent).toBe('retry-session'));
  });

  it('discards a late response after starting a new conversation', async () => {
    (sendHttpChatMessage as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => new Promise(() => { /* never resolves */ }));
    
    render(<AssistantProvider><Probe /></AssistantProvider>);
    fireEvent.click(screen.getByText('send'));
    fireEvent.click(screen.getByText('reset'));

    expect(screen.getByTestId('count').textContent).toBe('1');
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('persists history and conversationId to sessionStorage and restores on reload', async () => {
        (sendHttpChatMessage as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ kind: 'success' as const, conversationId: 'persist-1', message: 'Hola', products: [], actions: [] });

    const { unmount } = render(<AssistantProvider><Probe /></AssistantProvider>);
    fireEvent.click(screen.getByText('send'));
    await waitFor(() => expect(screen.getByTestId('conversation').textContent).toBe('persist-1'));

    unmount();

    render(<AssistantProvider><Probe /></AssistantProvider>);
    await waitFor(() => {
      const parsed = JSON.parse(window.sessionStorage.getItem(ASSISTANT_STORAGE_KEY) ?? '{}');
      expect(parsed.conversationId).toBe('persist-1');
      expect(screen.getByTestId('conversation').textContent).toBe('persist-1');
      expect((parsed.messages as Array<{ text: string }>).some((message) => message.text === 'Hola')).toBe(true);
    });
  });

  it('stores nothing in localStorage', async () => {
    (sendHttpChatMessage as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ kind: 'success' as const, conversationId: 'no-ls', message: 'Hola', products: [], actions: [] });
        render(<AssistantProvider><Probe /></AssistantProvider>);
    fireEvent.click(screen.getByText('send'));
    await waitFor(() => expect(screen.getByTestId('conversation').textContent).toBe('no-ls'));
    expect(window.localStorage.getItem(ASSISTANT_STORAGE_KEY)).toBeNull();
  });
});

describe('assistantReducer', () => {
  it('maps SESSION_EXPIRED to archived-and-cleaned conversations', () => {
    const withHistory = {
      version: 1,
      conversationId: 'session-1',
      messages: [...createInitialMessages(), { id: 'a', role: 'user' as const, text: 'hola' }],
      status: 'sending' as const,
    };
    const next = assistantReducer(withHistory, { type: 'fail', requestId: 'a', code: 'SESSION_EXPIRED' });
    expect(next.conversationId).toBeNull();
    expect(next.messages.some((message) => message.errorKind === 'SESSION_EXPIRED')).toBe(true);
  });

  it('maps CHAT_UNAVAILABLE to the unavailable status', () => {
    const next = assistantReducer({
      version: 1,
      conversationId: null,
      messages: [...createInitialMessages(), { id: 'a', role: 'user' as const, text: 'hola' }],
      status: 'sending' as const,
    }, { type: 'fail', requestId: 'a', code: 'CHAT_UNAVAILABLE' });
    expect(next.status).toBe('unavailable');
    expect(next.messages.some((message) => message.errorKind === 'CHAT_UNAVAILABLE')).toBe(true);
  });
});

describe('useChatContext (navigation context)', () => {
  it('derives portfolio context from folder and catalog filters', () => {
    expect(buildChatContext('/')).toEqual({ pagePath: '/', productSlug: null, filters: {}, locale: 'es' });
    expect(buildChatContext('/productos', '?category=gme&limit=24')).toEqual({
      pagePath: '/productos',
      productSlug: null,
      filters: { category: 'gme' },
      locale: 'es',
    });
    expect(buildChatContext('/productos/mt-espejos-alba').productSlug).toBe('mt-espejos-alba');
  });
});

describe('assistantReducer (envíos duplicados)', () => {
  it('ignora un segundo start mientras la petición está en curso', () => {
    const started = assistantReducer(
      { version: 1, conversationId: null, messages: createInitialMessages(), status: 'idle' },
      { type: 'start', text: 'primera' },
    );
    expect(started.status).toBe('sending');
    const ignored = assistantReducer(started, { type: 'start', text: 'segunda' });
    expect(ignored.status).toBe('sending');
    expect(ignored.messages.filter((message) => message.id === 'pending-user')).toHaveLength(1);
    expect(ignored.messages.filter((message) => message.id === 'pending-user')).toHaveLength(1);
  });
});

describe('assistantReducer (reintento)', () => {
  it('relanza el mensaje desde el estado unavailable', () => {
    const failed = assistantReducer(
      { version: 1, conversationId: null, messages: createInitialMessages(), status: 'idle' },
      { type: 'start', text: 'Busco un mueble' },
    );
    const errored = assistantReducer(failed, { type: 'fail', requestId: 'a', code: 'CHAT_UNAVAILABLE' });
    expect(errored.status).toBe('unavailable');

    const retried = assistantReducer(errored, { type: 'start', text: 'Busco un mueble' });
    expect(retried.status).toBe('sending');
    expect(retried.messages.at(-1)).toMatchObject({ id: 'pending-user', text: 'Busco un mueble' });
    expect(retried.messages.some((message) => message.role === 'user')).toBe(true);
  });
});
