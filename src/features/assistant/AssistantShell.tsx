import { lazy, Suspense, useEffect, useState } from 'react';
import { ChatLauncher } from './components/ChatLauncher';
import { ChatWelcomeBubble } from './components/ChatWelcomeBubble';
import { useFloatingSurface } from './model/useFloatingSurface';

const loadChatPanel = () => import('./components/ChatPanel').then((module) => ({ default: module.ChatPanel }));
const ChatPanel = lazy(loadChatPanel);

function preloadChatPanel(): void {
  void loadChatPanel().catch(() => undefined);
}

export function AssistantShell() {
  const [open, setOpen] = useState(false);
  const [activated, setActivated] = useState(false);
  const { blocked, welcomeBlocked } = useFloatingSurface();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    // Keep the panel in its own chunk, but fetch it while the launcher is idle
    // so the first intentional open does not wait for a dynamic import.
    preloadChatPanel();
  }, []);

  const openAssistant = () => {
    setActivated(true);
    setOpen(true);
  };

  return (
    <div aria-label="Asistente de Area LRMQ" inert={blocked} style={blocked ? { visibility: 'hidden' } : undefined}>
      <ChatLauncher open={open} onToggle={() => (open ? setOpen(false) : openAssistant())} onPrepare={preloadChatPanel} />
      {!open && <div inert={welcomeBlocked} style={welcomeBlocked ? { visibility: 'hidden' } : undefined}><ChatWelcomeBubble onOpen={openAssistant} onPrepare={preloadChatPanel} /></div>}
      {activated && (
        <Suspense fallback={open ? <p role="status" className="fixed bottom-24 right-5 z-[70] rounded-xl bg-surface-elevated p-3 text-primary">Cargando asistente…</p> : null}>
          <ChatPanel open={open} onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </div>
  );
}

export default AssistantShell;
