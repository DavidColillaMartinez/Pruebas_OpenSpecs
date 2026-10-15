import { useEffect, useId, useRef, useState } from 'react';
import { PrivacyLink } from '../../legal/PrivacyNotice';
import { PRIVACY_SUMMARIES } from '../../legal/business';
import { CHAT_ACTION_DRAFT_MAX_LENGTH } from '../transport/types';

const MAX_NAME_LENGTH = 80;
const WHATSAPP_SHARE_NOTICE = 'Al abrir WhatsApp, el texto se comparte con ese servicio. Podrás revisarlo y decidir si lo envías a la empresa.';
const GENERAL_GREETING = 'Hola AREA LRMQ, quiero hacer una consulta sobre mi proyecto.';

export type WhatsAppPreparationProps = {
  draftText: string | null;
  onConfirm: (message: string) => void;
  onCancel: () => void;
  originId: string;
};

function composeFinalMessage(name: string, message: string): string {
  const trimmedName = name.trim();
  return trimmedName ? `Soy ${trimmedName}.\n\n${message}` : message;
}

export function WhatsAppPreparation({ draftText, onConfirm, onCancel, originId }: WhatsAppPreparationProps) {
  const nameId = useId();
  const messageId = useId();
  const [name, setName] = useState('');
  const [message, setMessage] = useState(draftText ?? GENERAL_GREETING);
  const messageFieldRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    messageFieldRef.current?.focus();
  }, []);

  const finalLength = composeFinalMessage(name, message).length;
  const finalOverLimit = finalLength > CHAT_ACTION_DRAFT_MAX_LENGTH;
  const messageEmpty = message.trim().length === 0;
  // Memory-only state within this floating view: cancel, confirm, closing the
  // panel or starting a new conversation unmounts it and drops name/edits.
  const cancel = () => onCancel();

  return (
    <div
      className="flex min-h-0 flex-1 flex-col px-5 pb-4 pt-3"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          // The preparation consumes Escape before the panel handler so the
          // whole chat stays open and the origin control regains focus.
          event.stopPropagation();
          cancel();
          document.getElementById(originId)?.focus();
        }
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-lg leading-tight text-primary">Preparar mensaje</h3>
        <button
          type="button"
          onClick={cancel}
          className="min-h-11 rounded-full px-3 py-2 text-xs font-semibold text-secondary/70 transition hover:bg-elevated-hover hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2"
        >
          Volver
        </button>
      </div>

      <div className="assistant-scroll mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
        <div>
          <label htmlFor={nameId} className="text-sm font-semibold text-primary">¿Cómo te llamas?</label>
          <p id={`${nameId}-hint`} className="mt-0.5 text-xs leading-5 text-secondary/75">Nombre (opcional), máximo {MAX_NAME_LENGTH} caracteres.</p>
          <input
            id={nameId}
            aria-describedby={`${nameId}-hint`}
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value.slice(0, MAX_NAME_LENGTH))}
            className="mt-1.5 w-full rounded-2xl border border-hairline/12 bg-surface-elevated/85 px-4 py-2.5 text-sm text-primary placeholder:text-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay"
            placeholder="Nombre (opcional)"
          />
        </div>

        <div className="flex min-h-0 flex-col">
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor={messageId} className="text-sm font-semibold text-primary">Mensaje</label>
            <span className={`text-xs tabular-nums ${finalOverLimit ? 'text-red-700' : 'text-secondary/60'}`} aria-live="polite">
              {message.length}/{CHAT_ACTION_DRAFT_MAX_LENGTH}
            </span>
          </div>
          <textarea
            id={messageId}
            ref={messageFieldRef}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={6}
            aria-describedby={messageEmpty ? `${messageId}-empty-hint` : undefined}
            aria-invalid={messageEmpty}
            className="mt-1.5 min-h-[7.5rem] w-full resize-y rounded-2xl border border-hairline/12 bg-surface-elevated/85 px-4 py-3 text-sm leading-6 text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay"
          />
          {messageEmpty && (
            <p id={`${messageId}-empty-hint`} className="mt-1 text-xs text-secondary/75">Escribe el mensaje antes de abrir WhatsApp; el nombre sigue siendo opcional.</p>
          )}
          {finalOverLimit && (
            <p role="alert" className="mt-1 text-xs text-red-700">El mensaje supera el máximo de {CHAT_ACTION_DRAFT_MAX_LENGTH} caracteres. Redúcelo antes de abrir WhatsApp.</p>
          )}
        </div>
      </div>

      <div className="mt-3 border-t border-border-hairline/10 pt-3">
        <p className="text-xs leading-5 text-secondary">{WHATSAPP_SHARE_NOTICE} <PrivacyLink section="whatsapp" /></p>
        <p className="sr-only">{PRIVACY_SUMMARIES.whatsapp}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={cancel}
            className="min-h-11 rounded-full border border-hairline/15 px-4 py-2 text-sm font-semibold text-secondary transition hover:bg-elevated-hover hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              if (finalOverLimit || messageEmpty) return;
              onConfirm(composeFinalMessage(name, message));
            }}
            disabled={messageEmpty || finalOverLimit}
            className="min-h-11 flex-1 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Abrir WhatsApp con este mensaje
          </button>
        </div>
      </div>
    </div>
  );
}
