import { useCallback, useEffect, useState } from 'react';
import { ChatLauncher, ChatPanel } from './components/ChatPanel';

export function AssistantShell() {
  const [open, setOpen] = useState(false);

  const closeOnRouteHash = useCallback(() => undefined, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  void closeOnRouteHash;

  return (
    <div aria-label="Asistente de Area LRMQ">
      <ChatLauncher open={open} onToggle={() => setOpen((value) => !value)} />
      <ChatPanel open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

export default AssistantShell;
