import { navItems } from '../data/copy';
import { PHONE_INTL } from '../data/business';
import { Link } from 'react-router-dom';

export function MobileDrawer({ activeSectionId, cardless, onToggleCardless, onNavigate, onClose }) {
  const drawerNavItems = [
    { label: 'Inicio', href: '#inicio' },
    ...navItems,
  ];
  return (
    <>
      <div className="fixed inset-0 z-40 bg-ink/20" onClick={onClose} aria-hidden="true" />
      <div className="relative z-50 mx-auto mt-3 max-w-7xl rounded-[2rem] border border-white/70 bg-pearl p-6 shadow-lift" role="dialog" aria-modal="true" aria-label="Menú de navegación">
        <div className="flex items-center justify-between">
          <span className="font-display text-lg tracking-[0.08em] text-ink">AREA LRMQ</span>
          <button type="button" onClick={onClose} className="grid h-11 w-11 min-h-[44px] min-w-[44px] place-items-center rounded-full bg-ink/8 text-ink/70 transition hover:bg-ink/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2" aria-label="Cerrar menú">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        </div>
        <nav className="mt-5 flex flex-col gap-2" aria-label="Navegación principal">
          <Link to="/productos" className="min-h-[44px] rounded-2xl px-4 py-3 text-lg font-medium text-graphite/75 transition hover:text-ink" onClick={onClose}>Catálogo</Link>
          {drawerNavItems.map((item) => {
            const id = item.href.slice(1);
            const isActive = activeSectionId === id;
            return <a key={item.href} className={`min-h-[44px] rounded-2xl px-4 py-3 text-lg font-medium transition ${isActive ? 'bg-ink/5 text-ink' : 'text-graphite/75 hover:text-ink'}`} href={item.href} onClick={(e) => { if (onNavigate) { e.preventDefault(); onNavigate(id); } onClose(); }}>{item.label}</a>;
          })}
        </nav>
        <div className="mt-5 flex flex-col gap-3 border-t border-ink/8 pt-5">
          <button type="button" onClick={() => { onToggleCardless(); onClose(); }} className="min-h-[44px] rounded-full border border-ink/15 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-graphite/65 transition hover:border-ink/25 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2" aria-label={cardless ? 'Activar tarjetas' : 'Modo sin tarjetas'}>{cardless ? 'Tarjetas' : 'Minimal'}</button>
          <a href={`https://wa.me/${PHONE_INTL}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2" onClick={onClose}>Pedir asesoría</a>
        </div>
      </div>
    </>
  );
}
