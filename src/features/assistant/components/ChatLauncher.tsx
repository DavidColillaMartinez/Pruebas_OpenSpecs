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
