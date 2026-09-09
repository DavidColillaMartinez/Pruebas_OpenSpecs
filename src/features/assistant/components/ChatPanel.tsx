import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useAssistantChat } from '../model/assistantStore';
import type { AssistantChatMessage } from '../model/assistantStore';
import { AssistantProductCard } from './AssistantProductCard';
import { AssistantActions } from './AssistantActions';

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, [tabindex]:not([tabindex="-1"])';
const CHAT_BOTTOM_THRESHOLD_PX = 96;
const CHAT_INPUT_MAX_HEIGHT_PX = 132;

type ChatPanelProps = {
  open: boolean;
  onClose: () => void;
};

function lastAssistantMessage(messages: AssistantChatMessage[]): AssistantChatMessage | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role === 'assistant' && message.id !== 'initial') return message;
  }
  return null;
}

function isCoarsePointer(): boolean {
  return Boolean(window.matchMedia?.('(hover: none) and (pointer: coarse)').matches);
}

export function ChatPanel({ open, onClose }: ChatPanelProps) {
  const { status, demoMode, messages, sendMessage, startNewConversation } = useAssistantChat();
  const [draft, setDraft] = useState('');
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const shouldFollowLatestRef = useRef(true);
  const forceFollowRef = useRef(false);

  const isSending = status === 'sending';
  const lastReply = lastAssistantMessage(messages);

  const expired = lastReply?.errorKind === 'SESSION_EXPIRED' || status === 'expired';

  useEffect(() => {
    if (!open) return undefined;
    restoreFocusRef.current = (document.activeElement as HTMLElement) ?? null;
    if (isCoarsePointer()) {
      dialogRef.current?.focus();
    } else {
      inputRef.current?.focus();
    }
    shouldFollowLatestRef.current = true;
    return () => restoreFocusRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const scrollToLatest = () => {
    const container = messagesRef.current;
    if (!container) return;
    const behavior = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    if (typeof container.scrollTo === 'function') {
      container.scrollTo({ top: container.scrollHeight, behavior });
    } else {
      container.scrollTop = container.scrollHeight;
    }
  };

  const handleMessagesScroll = () => {
    const container = messagesRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    shouldFollowLatestRef.current = distanceFromBottom <= CHAT_BOTTOM_THRESHOLD_PX;
  };

  useEffect(() => {
    if (!open) return undefined;
    if (!shouldFollowLatestRef.current && !forceFollowRef.current) return undefined;
    forceFollowRef.current = false;
    const timeoutId = window.setTimeout(scrollToLatest, 0);
    return () => window.clearTimeout(timeoutId);
  }, [open, messages.length, isSending]);

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = 'auto';
    const nextHeight = Math.min(input.scrollHeight, CHAT_INPUT_MAX_HEIGHT_PX);
    input.style.height = `${Math.max(nextHeight, 44)}px`;
    input.style.overflowY = input.scrollHeight > CHAT_INPUT_MAX_HEIGHT_PX ? 'auto' : 'hidden';
  }, [draft, open]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const root = dialogRef.current;
    if (!root) return;
    const focusables = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (!focusables.length) return;
    const first = focusables[0];
    const lastElement = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      (lastElement as HTMLElement).focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      (first as HTMLElement).focus();
    }
  };

  const retry = () => {
    const lastUser = [...messages].reverse().find((message) => message.role === 'user');
    if (lastUser) sendMessage(lastUser.text);
  };
  const submit = () => {
    const text = draft.trim();
    if (!text || isSending) return;
    forceFollowRef.current = true;
    sendMessage(text);
    setDraft('');
  };

  const canSend = draft.trim().length > 0 && !isSending;

  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Asistente de Area LRMQ"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      onWheel={(event) => event.stopPropagation()}
      onTouchMove={(event) => event.stopPropagation()}
      className="assistant-panel-in fixed bottom-24 right-4 z-[70] flex max-h-[min(38rem,calc(100dvh-7rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[1.75rem] border border-ink/10 bg-porcelain/95 shadow-lift backdrop-blur md:right-5"
    >
      <header className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2 border-b border-ink/8 px-4 py-3.5 md:px-5 md:py-4">
        <div className="min-w-0">
          <h2 className="font-display text-lg leading-tight text-ink">Asistente de Area LRMQ</h2>
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-ink/55">Reformas · Tienda</p>
        </div>
        <div className="flex items-center">
          <button
            type="button"
            onClick={startNewConversation}
            className="min-h-11 whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold text-ink/70 transition hover:bg-stonewash hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2"
          >
            Nueva conversación
          </button>
          <button
            type="button"
            aria-label="Cerrar el asistente"
            onClick={onClose}
            className="grid h-11 w-11 place-items-center rounded-full text-ink/70 transition hover:bg-stonewash hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
          </button>
        </div>
      </header>

      {demoMode && (
        <p className="border-b border-clay/30 bg-clay/10 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-clay">Modo de demostración</p>
      )}

      {expired && (
        <p className="border-b border-ink/10 bg-stonewash px-5 py-2 text-xs text-graphite">
          La conversación anterior ha caducado. Tus datos con el asistente se renuevan al continuar; el servidor guarda su propia caducidad.
        </p>
      )}

      <div
        ref={messagesRef}
        className="assistant-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4"
        onScroll={handleMessagesScroll}
      >
        <ul className="space-y-3">
          {messages.map((message) => (
            <li key={message.id} className={message.role === 'user' ? 'flex justify-end' : ''}>
              {message.role === 'assistant' ? (
                message.products?.length ? (
                  <div className="max-w-[95%]">
                    <p className="text-sm leading-relaxed text-ink">{message.text}</p>
                    <div className="mt-2 space-y-2">
                      {message.products.map((product) => (
                        <AssistantProductCard key={`${message.id}-${product.internalPath}`} product={product} />
                      ))}
                    </div>
                    <AssistantActions actions={message.actions ?? []} />
                  </div>
                ) : (
                  message.errorKind ? (
                    <div className="max-w-[92%] rounded-2xl rounded-tl-md border border-clay/40 bg-clay/10 px-4 py-3">
                      <p className="text-sm leading-relaxed text-ink">{message.text}</p>
                      {message.errorKind !== 'SESSION_EXPIRED' && (
                        <button
                          type="button"
                          onClick={retry}
                          disabled={isSending}
                          aria-label="Reintentar el último mensaje"
                          className="mt-2.5 inline-flex min-h-9 items-center gap-2 rounded-full bg-clay/20 px-4 py-1.5 text-xs font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-clay/30 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2"
                        >
                          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 12a8 8 0 1 1 2.3 5.6M4 12V7m0 5h5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          Reintentar
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="max-w-[92%]">
                      <p className="rounded-2xl rounded-tl-md bg-white/85 px-4 py-3 shadow-soft text-sm leading-relaxed text-ink">
                        {message.text}
                      </p>
                      <AssistantActions actions={message.actions ?? []} />
                    </div>
                  )
                )
              ) : (
                <p className="max-w-[92%] rounded-2xl rounded-tr-md bg-ink px-4 py-3 text-sm leading-relaxed text-white">
                  {message.text}
                </p>
              )}
            </li>
          ))}
          {isSending && (
            <li className="flex items-center gap-2 text-xs text-ink/55">
              <span className="inline-flex gap-1" aria-hidden="true">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-clay [animation-delay:-160ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-clay [animation-delay:-80ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-clay" />
              </span>
              <span role="status">Escribiendo…</span>
            </li>
          )}
        </ul>
      </div>

      <form
        className="mx-3 mb-3 mt-2 flex items-end gap-2 rounded-[1.5rem] border border-ink/10 bg-white/85 p-1.5 shadow-soft"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <label className="sr-only" htmlFor="assistant-input">Escribe tu mensaje para el asistente</label>
        <textarea
          id="assistant-input"
          ref={inputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder="Escribe tu mensaje…"
          disabled={isSending}
          className="assistant-composer-input min-h-11 max-h-[8.25rem] flex-1 resize-none rounded-[1.25rem] border-0 bg-transparent px-3.5 py-2.5 text-sm leading-6 text-ink placeholder:text-ink/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Enviar mensaje al asistente"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-white transition hover:-translate-y-0.5 hover:bg-graphite disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4.5 12h13M12 5.5l6.5 6.5-6.5 6.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </form>
    </div>
  );
}
