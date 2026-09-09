import { lazy, Suspense, useEffect, useState } from 'react';
import { ChatLauncher } from './components/ChatLauncher';
import { ChatWelcomeBubble } from './components/ChatWelcomeBubble';

const loadChatPanel = () => import('./components/ChatPanel').then((module) => ({ default: module.ChatPanel }));
const ChatPanel = lazy(loadChatPanel);

function preloadChatPanel(): void {
  void loadChatPanel().catch(() => undefined);
}

export function AssistantShell() {
  const [open, setOpen] = useState(false);
  const [activated, setActivated] = useState(false);

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
    <div aria-label="Asistente de Area LRMQ">
      <ChatLauncher open={open} onToggle={() => (open ? setOpen(false) : openAssistant())} onPrepare={preloadChatPanel} />
      {!open && <ChatWelcomeBubble onOpen={openAssistant} onPrepare={preloadChatPanel} />}
      {activated && (
        <Suspense fallback={open ? <p role="status" className="fixed bottom-24 right-5 z-[70] rounded-xl bg-porcelain p-3 text-ink">Cargando asistente…</p> : null}>
          <ChatPanel open={open} onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </div>
  );
}

export default AssistantShell;
