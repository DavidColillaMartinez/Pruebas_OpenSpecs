import { useEffect, useRef, useState } from 'react';
import { useAssistantChat, INITIAL_ASSISTANT_MESSAGE } from '../model/assistantStore';
import type { AssistantChatMessage } from '../model/assistantStore';
import { AssistantProductCard } from './AssistantProductCard';

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, [tabindex]:not([tabindex="-1"])';

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

export function ChatPanel({ open, onClose }: ChatPanelProps) {
  const { status, demoMode, messages, sendMessage, startNewConversation } = useAssistantChat();
  const [draft, setDraft] = useState('');
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const isSending = status === 'sending';
  const lastReply = lastAssistantMessage(messages);
  const hasInlineError = Boolean(lastReply?.errorKind && lastReply.errorKind !== 'SESSION_EXPIRED');
  const expired = lastReply?.errorKind === 'SESSION_EXPIRED' || status === 'expired';

  useEffect(() => {
    if (!open) return undefined;
    restoreFocusRef.current = (document.activeElement as HTMLElement) ?? null;
    inputRef.current?.focus();
    return () => restoreFocusRef.current?.focus();
  }, [open]);

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
    sendMessage(text);
    setDraft('');
  };

  const canSend = draft.trim().length > 0 && !isSending;

  useEffect(() => {
    if (messages.length === 1 && messages[0].id !== 'initial') return;
  }, [messages]);

  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-label="Asistente de Area LRMQ"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      onWheel={(event) => event.stopPropagation()}
      onTouchMove={(event) => event.stopPropagation()}
      className="assistant-panel-in fixed bottom-24 right-5 z-[70] flex max-h-[min(34rem,calc(100svh-8rem))] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-[1.75rem] border border-ink/10 bg-porcelain/95 shadow-lift backdrop-blur"
      style={{ maxHeight: 'calc(100dvh - 11rem)' }}
    >
      <header className="flex items-start justify-between border-b border-ink/8 px-5 py-4">
        <div>
          <h2 className="font-display text-lg leading-tight text-ink">Asistente de Area LRMQ</h2>
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-ink/55">Reformas · Tienda</p>
        </div>
        <div className="flex items-center">
          <button
            type="button"
            onClick={startNewConversation}
            className="rounded-full px-3 py-2 text-xs font-semibold text-ink/70 transition hover:bg-stonewash hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2"
          >
            Nueva conversación
          </button>
          <button
            type="button"
            aria-label="Cerrar el asistente"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full text-ink/70 transition hover:bg-stonewash hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2"
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

      <div className="assistant-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4">
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
                  </div>
                ) : (
                  <p className={`${message.errorKind ? 'rounded-2xl rounded-tl-md border border-clay/40 bg-clay/10 px-4 py-3' : 'rounded-2xl rounded-tl-md bg-white/85 px-4 py-3 shadow-soft'} max-w-[92%] text-sm leading-relaxed text-ink`}>
                    {message.text}
                  </p>
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

      {(hasInlineError || expired) && (
        <div className="flex items-center justify-between gap-2 border-t border-ink/8 bg-stonewash px-4 py-2.5">
          <p className="text-xs text-graphite">
            {expired ? 'Escribe de nuevo para abrir una conversación nueva.' : 'No se ha podido completar.'}
          </p>
          {hasInlineError && (
            <button
              type="button"
              onClick={retry}
              className="rounded-full border border-ink/20 px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2"
            >
              Reintentar
            </button>
          )}
        </div>
      )}

      <form
        className="flex items-end gap-2 border-t border-ink/8 bg-white/70 px-4 py-3"
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
          className="max-h-28 min-h-11 flex-1 resize-none rounded-2xl border border-ink/12 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Enviar mensaje al asistente"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-white transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4.5 12h13M12 5.5l6.5 6.5-6.5 6.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </form>
    </div>
  );
}

export function ChatLauncher({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-label={open ? 'Cerrar el asistente' : 'Abrir el asistente de Area LRMQ'}
      aria-expanded={open}
      onClick={onToggle}
      className="assistant-launcher-ring fixed bottom-6 right-5 z-[70] grid h-14 w-14 place-items-center rounded-full bg-ink text-white shadow-lift transition-transform duration-300 ease-out hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2"
    >
      {open ? (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
      ) : (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M12 3a8 8 0 0 1 8 8c0 4.2-3.4 7.6-7.6 8h-.4a7.6 7.6 0 0 1-4.6-1.6L4 20l1.2-3.4A8 8 0 0 1 12 3z" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9" cy="11" r="1" fill="currentColor" stroke="none" />
          <circle cx="12" cy="11" r="1" fill="currentColor" stroke="none" />
          <circle cx="15" cy="11" r="1" fill="currentColor" stroke="none" />
        </svg>
      )}
    </button>
  );
}

export const __assistantTestHarness = { FOCUSABLE, INITIAL_ASSISTANT_MESSAGE };
