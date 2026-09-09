import { useEffect, useRef, useState } from 'react';
import { LRMQ_ASSETS } from '../../../config/mediaAssets';
import { markWelcomeDismissed, readWelcomeDismissed } from './chatWelcomeStorage';

const WELCOME_VISIBLE_DELAY_MS = 1200;
const WELCOME_AUTO_HIDE_MS = 8000;

export function ChatWelcomeBubble({ onOpen }: { onOpen: () => void }) {
  const [visible, setVisible] = useState(() => !readWelcomeDismissed());
  const [shown, setShown] = useState(false);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!visible || readWelcomeDismissed()) return undefined;
    const delayId = window.setTimeout(() => setShown(true), WELCOME_VISIBLE_DELAY_MS);
    return () => window.clearTimeout(delayId);
  }, [visible]);

  useEffect(() => {
    if (!shown || !visible) return undefined;
    const hide = () => setVisible(false);
    hideTimerRef.current = window.setTimeout(hide, WELCOME_AUTO_HIDE_MS);
    return () => {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [shown, visible]);

  const pauseHide = () => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const resumeHide = () => {
    if (shown && visible && hideTimerRef.current === null) {
      hideTimerRef.current = window.setTimeout(() => setVisible(false), WELCOME_AUTO_HIDE_MS);
    }
  };

  const dismiss = () => {
    markWelcomeDismissed();
    setVisible(false);
  };

  const openChat = () => {
    markWelcomeDismissed();
    setVisible(false);
    onOpen();
  };

  if (!visible || readWelcomeDismissed()) return null;

  return (
    <div
      aria-label="Sugerencia del asistente de Area LRMQ"
      className="assistant-welcome assistant-welcome-in fixed right-4 z-40 flex w-[min(17rem,calc(100vw-2rem))] items-start gap-2.5 rounded-[1.4rem] border border-ink/10 bg-white/96 p-3 shadow-lift backdrop-blur sm:right-5 sm:w-[22.5rem] sm:gap-3 sm:p-3.5"
      onMouseEnter={pauseHide}
      onMouseLeave={resumeHide}
      onFocus={pauseHide}
      onBlur={resumeHide}
    >
      <button
        type="button"
        onClick={openChat}
        aria-label="Abrir el chat con el asistente de Area LRMQ"
        className="flex min-w-0 flex-1 items-start gap-3 rounded-[1.2rem] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 motion-safe:transition motion-safe:duration-200 motion-safe:hover:bg-stonewash/60"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center sm:h-10 sm:w-10" aria-hidden="true">
          <img src={LRMQ_ASSETS.logo} alt="" className="h-full w-full object-contain" loading="eager" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold leading-snug text-ink">¿Te ayudo con tu reforma?</span>
          <span className="mt-0.5 block text-xs leading-relaxed text-graphite">Soy el asistente de AREA LRMQ: pregúntame y encontraré productos del catálogo contigo.</span>
        </span>
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Cerrar la sugerencia del asistente"
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink/55 transition hover:bg-stonewash hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
      </button>
    </div>
  );
}
