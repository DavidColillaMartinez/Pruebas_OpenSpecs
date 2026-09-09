import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChatPanel } from './ChatPanel';
import { useAssistantChat } from '../model/assistantStore';
import type { AssistantChatMessage } from '../model/assistantStore';

vi.mock('../model/assistantStore', () => ({
  useAssistantChat: vi.fn(),
  INITIAL_ASSISTANT_MESSAGE: 'Mensaje inicial',
}));

const mockedUseAssistantChat = vi.mocked(useAssistantChat);

const initialMessage = { id: 'initial', role: 'assistant' as const, text: 'Mensaje inicial' };

function chatValue(messages: AssistantChatMessage[] = [initialMessage]) {
  return {
    status: 'idle' as const,
    demoMode: false,
    conversationId: null,
    messages,
    sendMessage: vi.fn(),
    startNewConversation: vi.fn(),
  };
}

function setScrollMetrics(element: HTMLElement, { height, viewport, top }: { height: number; viewport: number; top: number }) {
  Object.defineProperty(element, 'scrollHeight', { configurable: true, value: height });
  Object.defineProperty(element, 'clientHeight', { configurable: true, value: viewport });
  element.scrollTop = top;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedUseAssistantChat.mockReturnValue(chatValue());
});

describe('ChatPanel message follow', () => {
  it('follows the latest message when the reader is near the bottom', async () => {
    const view = render(<ChatPanel open onClose={vi.fn()} />);
    const messages = view.container.querySelector('.assistant-scroll') as HTMLDivElement;
    const scrollTo = vi.fn();
    messages.scrollTo = scrollTo;
    setScrollMetrics(messages, { height: 600, viewport: 240, top: 360 });

    await waitFor(() => expect(scrollTo).toHaveBeenCalled());
    scrollTo.mockClear();

    const nextMessages = [...chatValue().messages, { id: 'user-1', role: 'user' as const, text: 'Necesito ayuda' }];
    mockedUseAssistantChat.mockReturnValue(chatValue(nextMessages));
    view.rerender(<ChatPanel open onClose={vi.fn()} />);

    await waitFor(() => expect(scrollTo).toHaveBeenCalledWith({ top: 600, behavior: 'smooth' }));
  });

  it('does not pull the reader back when they scrolled away from the latest message', async () => {
    const view = render(<ChatPanel open onClose={vi.fn()} />);
    const messages = view.container.querySelector('.assistant-scroll') as HTMLDivElement;
    const scrollTo = vi.fn();
    messages.scrollTo = scrollTo;
    setScrollMetrics(messages, { height: 600, viewport: 240, top: 360 });

    await waitFor(() => expect(scrollTo).toHaveBeenCalled());
    scrollTo.mockClear();
    messages.scrollTop = 0;
    fireEvent.scroll(messages);

    const nextMessages = [...chatValue().messages, { id: 'assistant-1', role: 'assistant' as const, text: 'Esta es una respuesta larga.' }];
    mockedUseAssistantChat.mockReturnValue(chatValue(nextMessages));
    view.rerender(<ChatPanel open onClose={vi.fn()} />);

    await new Promise((resolve) => window.setTimeout(resolve, 10));
    expect(scrollTo).not.toHaveBeenCalled();
  });
});

describe('ChatPanel composer', () => {
  it('grows with multiline text and hides the internal scrollbar at the limit', () => {
    render(<ChatPanel open onClose={vi.fn()} />);
    const input = screen.getByRole('textbox') as HTMLTextAreaElement;
    Object.defineProperty(input, 'scrollHeight', { configurable: true, value: 220 });

    fireEvent.change(input, { target: { value: 'Una consulta con varias líneas\npara el asistente' } });

    expect(input.style.height).toBe('132px');
    expect(input.style.overflowY).toBe('auto');
    expect(input).toHaveClass('assistant-composer-input');
  });

  it('uses Enter to send the draft without adding a newline', () => {
    const chat = chatValue();
    mockedUseAssistantChat.mockReturnValue(chat);
    render(<ChatPanel open onClose={vi.fn()} />);
    const input = screen.getByRole('textbox') as HTMLTextAreaElement;

    fireEvent.change(input, { target: { value: 'Hola Area LRMQ' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: false });

    expect(chat.sendMessage).toHaveBeenCalledWith('Hola Area LRMQ');
    expect(input).toHaveValue('');
  });
});
