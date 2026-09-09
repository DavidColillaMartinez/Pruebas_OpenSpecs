import { Link } from 'react-router-dom';
import {
  ASSISTANT_OFFICIAL_TARGETS,
  makeOfficialContactHref,
  officialContactLabel,
} from '../model/officialChannels';
import type { ChatAction } from '../transport/types';

export const INTERNAL_PATH_PATTERN = /^\/(?:productos(?:\/[^/?#]+)?|presupuesto)\/?$/;

export function AssistantActions({ actions }: { actions: ChatAction[] }) {
  if (!actions.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {actions.map((action) => {
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
          const href = makeOfficialContactHref(action.target);
          if (!href) return null;
          const nativeHref = href.startsWith('https://wa.me/') || href.startsWith('tel:') || href.startsWith('mailto:');
          return (
            <a
              key={`contact-${action.target}-${action.label}`}
              href={officialContactLabel(action.target) === null ? href : href}
              {...(nativeHref ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
              className="rounded-full border border-ink/12 bg-white/85 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2"
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
