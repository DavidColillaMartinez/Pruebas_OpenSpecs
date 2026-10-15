import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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

describe('ChatPanel dialog accessibility', () => {
  it('marks the panel as a modal dialog without locking the background scroll', () => {
    const { unmount } = render(<ChatPanel open onClose={vi.fn()} />);
    expect(screen.getByRole('dialog', { name: 'Asistente de Area LRMQ' })).toHaveAttribute('aria-modal', 'true');
    expect(document.body.style.overflow).toBe('');

    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('focuses the dialog instead of the composer on touch devices', () => {
    const matchMedia = vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: query === '(hover: none) and (pointer: coarse)',
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent() { return false; },
    }));

    try {
      render(<ChatPanel open onClose={vi.fn()} />);
      expect(screen.getByRole('dialog', { name: 'Asistente de Area LRMQ' })).toHaveFocus();
      expect(screen.getByRole('textbox')).not.toHaveFocus();
    } finally {
      matchMedia.mockRestore();
    }
  });
});

describe('ChatPanel actions', () => {
  it('opens the WhatsApp preparation view instead of leaving the chat', () => {
    const message: AssistantChatMessage = {
      id: 'assistant-actions',
      role: 'assistant',
      text: 'Puedes contactar por estos canales:',
      actions: [{ type: 'contact_official', label: 'WhatsApp', target: 'whatsapp', draftText: 'Hola, quiero valorar un local.' }],
    };
    mockedUseAssistantChat.mockReturnValue(chatValue([initialMessage, message]));

    render(<MemoryRouter><ChatPanel open onClose={vi.fn()} /></MemoryRouter>);

    fireEvent.click(screen.getByRole('button', { name: /WhatsApp/ }));
    expect(screen.getByRole('heading', { name: 'Preparar mensaje' })).toBeInTheDocument();
    expect(screen.getByLabelText('Mensaje')).toHaveValue('Hola, quiero valorar un local.');
    expect(screen.queryByLabelText('Escribe tu mensaje para el asistente')).not.toBeInTheDocument();
  });
  it('renders internal navigation actions without dropping them', () => {
    const message: AssistantChatMessage = {
      id: 'assistant-nav',
      role: 'assistant',
      text: 'Mira nuestra tienda:',
      actions: [{ type: 'navigate_internal', label: 'Ver catálogo', target: '/productos' }],
    };
    mockedUseAssistantChat.mockReturnValue(chatValue([initialMessage, message]));

    render(<MemoryRouter><ChatPanel open onClose={vi.fn()} /></MemoryRouter>);

    expect(screen.getByRole('link', { name: 'Ver catálogo' })).toHaveAttribute('href', '/productos');
  });
});
describe('ChatPanel privacy drawer', () => {
  it('starts expanded with a permanent policy link and collapses on demand', () => {
    render(<ChatPanel open onClose={vi.fn()} />);
    expect(document.getElementById('assistant-privacy-details')).toBeInTheDocument();
    const toggle = screen.getByRole('button', { name: 'Ocultar información' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveAttribute('aria-controls', 'assistant-privacy-details');
    expect(screen.getAllByRole('link', { name: /Política de privacidad/ }).length).toBeGreaterThan(0);

    fireEvent.click(toggle);
    expect(document.getElementById('assistant-privacy-details')).not.toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getAllByRole('link', { name: /Política de privacidad/ }).length).toBeGreaterThan(0);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'assistant-privacy-summary');
  });

  it('keeps the privacy collapse across re-renders and panel reopen', () => {
    const view = render(<ChatPanel open onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Ocultar información' }));
    view.rerender(<ChatPanel open={false} onClose={vi.fn()} />);
    view.rerender(<ChatPanel open onClose={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Información de privacidad' })).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('ChatPanel WhatsApp preparation', () => {
  const actionWithDraft = (draftText?: string): AssistantChatMessage => ({
    id: 'assistant-wa',
    role: 'assistant',
    text: 'Te acompaño por WhatsApp:',
    actions: [{ type: 'contact_official', label: 'WhatsApp', target: 'whatsapp', ...(draftText ? { draftText } : {}) }],
  });

  it('offers an editable general greeting for legacy actions without a draft', () => {
    mockedUseAssistantChat.mockReturnValue(chatValue([initialMessage, actionWithDraft()]));
    render(<MemoryRouter><ChatPanel open onClose={vi.fn()} /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /WhatsApp/ }));

    const messageField = screen.getByLabelText('Mensaje') as HTMLTextAreaElement;
    expect(messageField.value).toContain('Hola AREA LRMQ');
    fireEvent.change(messageField, { target: { value: 'Buenas, tengo una duda sobre mamparas' } });
    expect(messageField).toHaveValue('Buenas, tengo una duda sobre mamparas');
  });

  it('opens the encoded official WhatsApp URL and returns to the conversation', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => window);
    try {
      mockedUseAssistantChat.mockReturnValue(chatValue([initialMessage, actionWithDraft('Quiero valorar: local diáfano 50 m² en Torrejón de Ardoz.')]));
      render(<MemoryRouter><ChatPanel open onClose={vi.fn()} /></MemoryRouter>);
      fireEvent.click(screen.getByRole('button', { name: /WhatsApp/ }));
      fireEvent.click(screen.getByRole('button', { name: 'Abrir WhatsApp con este mensaje' }));

      expect(openSpy).toHaveBeenCalledTimes(1);
      const url = openSpy.mock.calls[0][0] as string;
      expect(url.startsWith('https://wa.me/')).toBe(true);
      const text = decodeURIComponent(url.split('text=')[1]).replace(/\+/g, ' ');
      expect(text).toBe('Quiero valorar: local diáfano 50 m² en Torrejón de Ardoz.');
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /WhatsApp/ })).toBeInTheDocument();
    } finally {
      openSpy.mockRestore();
    }
  });

  it('prepends the optional name without duplicating the greeting', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => window);
    try {
      mockedUseAssistantChat.mockReturnValue(chatValue([initialMessage, actionWithDraft('Hola, quiero valorar un local.')]));
      render(<MemoryRouter><ChatPanel open onClose={vi.fn()} /></MemoryRouter>);
      fireEvent.click(screen.getByRole('button', { name: /WhatsApp/ }));
      fireEvent.change(screen.getByLabelText('¿Cómo te llamas?'), { target: { value: 'Ana' } });
      fireEvent.click(screen.getByRole('button', { name: 'Abrir WhatsApp con este mensaje' }));

      const url = openSpy.mock.calls[0][0] as string;
      const text = decodeURIComponent(url.split('text=')[1]).replace(/\+/g, ' ');
      expect(text).toBe('Soy Ana.\n\nHola, quiero valorar un local.');
    } finally {
      openSpy.mockRestore();
    }
  });

  it('shows the limit alert and keeps the panel open over 1000 characters', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => window);
    try {
      mockedUseAssistantChat.mockReturnValue(chatValue([initialMessage, actionWithDraft('a'.repeat(995))]));
      render(<MemoryRouter><ChatPanel open onClose={vi.fn()} /></MemoryRouter>);
      fireEvent.click(screen.getByRole('button', { name: /WhatsApp/ }));
      const messageField = screen.getByLabelText('Mensaje') as HTMLTextAreaElement;
      fireEvent.change(messageField, { target: { value: `${'a'.repeat(995)} y aún más texto fuera de límites` } });

      expect(screen.getByRole('alert')).toHaveTextContent(/supera el máximo/);
      fireEvent.click(screen.getByRole('button', { name: 'Abrir WhatsApp con este mensaje' }));
      expect(openSpy).not.toHaveBeenCalled();
      expect(screen.getByRole('heading', { name: 'Preparar mensaje' })).toBeInTheDocument();
    } finally {
      openSpy.mockRestore();
    }
  });

  it('cancels back to the conversation, restoring focus to the origin control', async () => {
    mockedUseAssistantChat.mockReturnValue(chatValue([initialMessage, actionWithDraft('Hola, quiero valorar un local.')]));
    render(<MemoryRouter><ChatPanel open onClose={vi.fn()} /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /WhatsApp/ }));
    fireEvent.change(screen.getByLabelText('¿Cómo te llamas?'), { target: { value: 'Ana' } });

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('heading', { name: 'Preparar mensaje' })).not.toBeInTheDocument();
    await waitFor(() => expect(document.getElementById('assistant-wa-assistant-wa-0')).toHaveFocus());
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).not.toContain('Ana');
  });

  it('escape inside the preparation cancels it without closing the panel', () => {
    mockedUseAssistantChat.mockReturnValue(chatValue([initialMessage, actionWithDraft('Hola.')]));
    const onClose = vi.fn();
    render(<MemoryRouter><ChatPanel open onClose={onClose} /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /WhatsApp/ }));
    fireEvent.keyDown(screen.getByLabelText('Mensaje'), { key: 'Escape' });

    expect(screen.queryByRole('heading', { name: 'Preparar mensaje' })).not.toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('discards the preparation when the panel is closed mid-edit', () => {
    mockedUseAssistantChat.mockReturnValue(chatValue([initialMessage, actionWithDraft('Hola.')]));
    const view = render(<MemoryRouter><ChatPanel open onClose={vi.fn()} /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /WhatsApp/ }));
    fireEvent.change(screen.getByLabelText('¿Cómo te llamas?'), { target: { value: 'Ana' } });
    view.rerender(<MemoryRouter><ChatPanel open={false} onClose={vi.fn()} /></MemoryRouter>);
    view.rerender(<MemoryRouter><ChatPanel open onClose={vi.fn()} /></MemoryRouter>);
    // Back in the conversation: the preparation and its memory are gone.
    expect(screen.queryByRole('heading', { name: 'Preparar mensaje' })).not.toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
