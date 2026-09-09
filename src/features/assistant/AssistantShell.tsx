import { lazy, Suspense, useEffect, useState } from 'react';
import { ChatLauncher } from './components/ChatLauncher';
import { ChatWelcomeBubble } from './components/ChatWelcomeBubble';

const ChatPanel = lazy(() => import('./components/ChatPanel').then((module) => ({ default: module.ChatPanel })));

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

  const openAssistant = () => {
    setActivated(true);
    setOpen(true);
  };

  return (
    <div aria-label="Asistente de Area LRMQ">
      <ChatLauncher open={open} onToggle={() => (open ? setOpen(false) : openAssistant())} />
      {!open && <ChatWelcomeBubble onOpen={openAssistant} />}
      {activated && (
        <Suspense fallback={open ? <p role="status" className="fixed bottom-24 right-5 z-[70] rounded-xl bg-porcelain p-3 text-ink">Cargando asistente…</p> : null}>
          <ChatPanel open={open} onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </div>
  );
}

export default AssistantShell;
