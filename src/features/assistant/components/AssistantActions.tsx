import { Link } from 'react-router-dom';
import {
  ASSISTANT_OFFICIAL_TARGETS,
  makeOfficialContactHref,
  officialContactLabel,
} from '../model/officialChannels';
import type { ChatAction } from '../transport/types';
import { INTERNAL_PATH_PATTERN } from './assistantActionValidation';

export type WhatsAppPreparationRequest = {
  draftText: string | null;
  triggerId: string;
};

export function buildWhatsAppTriggerId(messageId: string, index: number): string {
  return `assistant-wa-${messageId}-${index}`;
}

export function AssistantActions({
  actions,
  messageId,
  onWhatsAppPrepare,
}: {
  actions: ChatAction[];
  messageId: string;
  onWhatsAppPrepare: (request: WhatsAppPreparationRequest) => void;
}) {
  if (!actions.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {actions.map((action, index) => {
        if (action.type === 'navigate_internal' && INTERNAL_PATH_PATTERN.test(action.target)) {
          return (
            <Link
              key={`nav-${action.target}-${action.label}`}
              to={action.target}
              className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2"
            >
              {action.label}
            </Link>
          );
        }
        if (action.type === 'contact_official' && ASSISTANT_OFFICIAL_TARGETS.has(action.target)) {
          // WhatsApp opens the in-panel preparation view instead of leaving
          // the chat straight away; it can still be opened with a default
          // greeting for legacy actions without a draft.
          if (action.target === 'whatsapp') {
            const triggerId = buildWhatsAppTriggerId(messageId, index);
            return (
              <button
                type="button"
                key={`contact-${action.target}-${action.label}`}
                id={triggerId}
                onClick={() => onWhatsAppPrepare({ draftText: action.draftText ?? null, triggerId })}
                className="rounded-full border border-hairline/15 bg-surface-elevated/85 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2"
              >
                {officialContactLabel(action.target) ?? action.label}
              </button>
            );
          }
          const href = makeOfficialContactHref(action.target);
          if (!href) return null;
          const nativeHref = href.startsWith('https://wa.me/') || href.startsWith('tel:') || href.startsWith('mailto:');
          return (
            <a
              key={`contact-${action.target}-${action.label}`}
              href={href}
              {...(nativeHref ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
              className="rounded-full border border-hairline/15 bg-surface-elevated/85 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2"
            >
              {officialContactLabel(action.target) ?? action.label}
            </a>
          );
        }
        return null;
      })}
    </div>
  );
}
