import { useState, useEffect } from 'react';
import { LogoMark } from './LogoMark';
import { MobileDrawer } from './MobileDrawer';
import { navItems } from '../data/copy';
import { PHONE_INTL } from '../data/business';
import { QuoteSelectionLink } from '../features/quote/components/QuoteSelectionLink';

export function Header({ activeSectionId, onNavigate, isInicio, isDesktop }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setMobileOpen(false); };
    if (mobileOpen) { window.addEventListener('keydown', onKey); document.body.style.overflow = 'hidden'; }
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [mobileOpen]);

  if (!isDesktop) {
    return (
      <header className="fixed inset-x-0 top-0 z-50 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <a href="#inicio" className="flex items-center gap-3" aria-label="AREA LRMQ DESIGN S.L. inicio" onClick={(e) => { if (onNavigate) { e.preventDefault(); onNavigate('inicio'); setMobileOpen(false); } }}>
            <LogoMark className="h-10 w-10 shrink-0" minimal />
          </a>
          <div className="flex items-center gap-2"><QuoteSelectionLink compact tone="dark" /><button className="flex h-11 w-11 min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1.5 rounded-full bg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2" onClick={() => setMobileOpen((v) => !v)} aria-label="Menú" aria-expanded={mobileOpen}>
            <span className={`block h-px w-4 bg-white transition ${mobileOpen ? 'translate-y-[3px] rotate-45' : ''}`} />
            <span className={`block h-px w-4 bg-white transition ${mobileOpen ? '-translate-y-[3px] -rotate-45' : ''}`} />
          </button></div>
        </div>
        {mobileOpen && <MobileDrawer activeSectionId={activeSectionId} onNavigate={onNavigate} onClose={() => setMobileOpen(false)} />}
      </header>
    );
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 py-4 sm:px-6">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center">
        <div className={`flex items-center gap-3 overflow-hidden transition-all duration-500 ease-out ${isInicio ? 'max-w-0 opacity-0 -translate-x-2' : 'max-w-md opacity-100 translate-x-0'}`}>
          <a href="#inicio" className="flex items-center gap-3 font-semibold tracking-tight text-ink" aria-label="AREA LRMQ DESIGN S.L. inicio" onClick={(e) => { if (onNavigate) { e.preventDefault(); onNavigate('inicio'); } }}>
            <LogoMark className="h-10 w-10 shrink-0" />
            <span className="font-display text-lg tracking-[0.08em] whitespace-nowrap">AREA LRMQ DESIGN S.L.</span>
          </a>
        </div>
        <nav className={`rounded-full border border-white/70 bg-pearl/82 shadow-lift transition-all duration-500 ease-out ${isInicio ? 'px-6 py-3' : 'px-4 py-3'}`}>
          <div className="flex items-center gap-7 text-sm font-medium">
            {navItems.map((item) => {
              const id = item.href.slice(1);
              const isActive = activeSectionId === id;
              const muted = isInicio ? 'text-ink/88 hover:text-ink' : 'text-graphite/45 hover:text-ink/80';
              const active = 'text-ink after:w-full';
              return <a key={item.href} className={`relative pb-1 transition after:absolute after:-bottom-0.5 after:left-0 after:h-px after:bg-clay after:transition-all ${isActive ? active : `${muted} after:w-0 hover:after:w-full`}`} href={item.href} onClick={(e) => { if (onNavigate) { e.preventDefault(); onNavigate(id); } }}>{item.label}</a>;
            })}
          </div>
        </nav>
        <div className="flex items-center justify-self-end gap-3">
          <QuoteSelectionLink compact tone={isInicio ? 'dark' : 'light'} />
          <a className={`min-h-[44px] rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 ${isInicio ? 'bg-white/14 text-white shadow-lift hover:-translate-y-0.5 hover:bg-white/22' : 'bg-ink text-white shadow-lift hover:-translate-y-0.5 hover:bg-graphite'}`} href={`https://wa.me/${PHONE_INTL}`} target="_blank" rel="noopener noreferrer">Pedir asesoría</a>
        </div>
      </div>
    </header>
  );
}
