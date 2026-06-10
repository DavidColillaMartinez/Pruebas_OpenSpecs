import { useCallback, useEffect, useRef, useState } from 'react';

const PHONE = '629461032';
const PHONE_INTL = '34629461032';
const ADDRESS = 'C. de Aquitania, 69, San Blas-Canillejas, 28032 Madrid';
const MAPS_URL = `https://maps.google.com/?q=${encodeURIComponent(ADDRESS)}`;
const INSTAGRAM_URL = 'https://www.instagram.com/arealrmqtienda/';

const navItems = [
  { label: 'Colección', href: '#coleccion' },
  { label: 'Reformas', href: '#reformas' },
  { label: 'Visión', href: '#vision' },
  { label: 'Contacto', href: '#contacto' },
];

const categories = [
  { title: 'Mamparas a medida', label: 'Vidrio templado', copy: 'Perfiles ligeros y cierre limpio para ampliar visualmente el baño.', image: 'https://images.unsplash.com/photo-1572742482459-e04d6cfdd6f3?auto=format&fit=crop&w=700&q=85', imageAlt: 'Cabina de ducha con mampara de vidrio' },
  { title: 'Platos de ducha', label: 'Textura mineral', copy: 'Superficies antideslizantes con cortes precisos y acabados sobrios.', image: 'https://images.unsplash.com/photo-1656646523907-97b094c7e63a?auto=format&fit=crop&w=700&q=85', imageAlt: 'Suelo de ducha con baldosas blancas' },
  { title: 'Grifería premium', label: 'Líneas puras', copy: 'Monomandos con presencia escultural para uso diario confortable.', image: 'https://images.unsplash.com/photo-1623111771733-d3ab4d26ce41?auto=format&fit=crop&w=700&q=85', imageAlt: 'Grifo monomando plateado' },
  { title: 'Accesorios de baño', label: 'Detalle final', copy: 'Piezas funcionales que completan el proyecto sin romper la armonía.', image: 'https://images.unsplash.com/photo-1608651061499-ff031fbf6645?auto=format&fit=crop&w=700&q=85', imageAlt: 'Toallero en baño minimalista' },
];

const methodSteps = [
  { title: 'Medimos el espacio', copy: 'Dimensiones, uso diario y estilo antes de recomendar piezas.' },
  { title: 'Componemos la solución', copy: 'Mampara, plato, grifería y accesorios en una línea visual.' },
  { title: 'Preparamos la instalación', copy: 'Compra, entrega e instalación sin improvisar.' },
];

const sectionIds = ['inicio', 'coleccion', 'reformas', 'vision', 'contacto'];
const chapterSteps = [3, 8, 0, 2, 1];
const chapterType = ['step', 'step', 'continuous', 'step', 'step'];
const TOTAL_CHAPTERS = sectionIds.length;
const DESKTOP_MIN_WIDTH = 1024;
const DESKTOP_MIN_HEIGHT = 720;

function getDesktopGate() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= DESKTOP_MIN_WIDTH && window.innerHeight >= DESKTOP_MIN_HEIGHT;
}

function LogoMark({ className = '', minimal = false }) {
  if (minimal) {
    return (
      <span className={`inline-block ${className}`} aria-hidden="true">
        <img src="/logopng.png" alt="" className="h-full w-full object-contain" />
      </span>
    );
  }
  return (
    <span className={`inline-grid place-items-center overflow-hidden rounded-full border border-clay/25 bg-white shadow-lift ${className}`} aria-hidden="true">
      <img src="/logo-area-lrmq.jpeg" alt="" className="h-full w-full scale-[1.35] object-contain" />
    </span>
  );
}

function useNarrativeScroll() {
  const [activeChapter, setActiveChapter] = useState(0);
  const [step, setStep] = useState(0);
  const [smoothProgress, setSmoothProgress] = useState(0);
  const [isDesktop, setIsDesktop] = useState(getDesktopGate);
  const [reducedMotion, setReducedMotion] = useState(typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false);
  const chapterLabels = ['Inicio', 'Colección', 'Reformas', 'Visión', 'Contacto'];
  const activeRef = useRef(0);
  const stepRef = useRef(0);
  const blockedRef = useRef(false);
  const cooldownRef = useRef(false);
  const accumulatedRef = useRef(0);
  const targetRef = useRef(0);

  useEffect(() => {
    const onResize = () => setIsDesktop(getDesktopGate());
    window.addEventListener('resize', onResize);
    const m = window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`);
    const h = () => setIsDesktop(getDesktopGate());
    m.addEventListener('change', h);
    return () => { window.removeEventListener('resize', onResize); m.removeEventListener('change', h); };
  }, []);

  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(m.matches);
    const h = (e) => setReducedMotion(e.matches);
    m.addEventListener('change', h);
    return () => m.removeEventListener('change', h);
  }, []);

  const setBlocked = useCallback((value) => { blockedRef.current = value; }, []);

  const skipBlocked = useCallback(() => {
    blockedRef.current = false;
    cooldownRef.current = false;
  }, []);

  const navigateTo = useCallback((index, startStep = 0) => {
    if (index < 0 || index >= TOTAL_CHAPTERS) return;
    activeRef.current = index;
    stepRef.current = startStep;
    accumulatedRef.current = 0;
    targetRef.current = 0;
    setActiveChapter(index);
    setStep(startStep);
    setSmoothProgress(0);
  }, []);

  useEffect(() => {
    if (!isDesktop || reducedMotion) return;
    let raf;
    const loop = () => {
      const target = targetRef.current;
      setSmoothProgress((prev) => {
        const next = prev + (target - prev) * 0.18;
        return Math.abs(next - target) < 0.001 ? target : next;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isDesktop, reducedMotion]);

  useEffect(() => {
    if (!isDesktop) return;
    const onWheel = (e) => {
      if (blockedRef.current || cooldownRef.current) return;
      e.preventDefault();
      const direction = e.deltaY > 0 ? 1 : -1;
      const current = activeRef.current;

      if (chapterType[current] === 'step') {
        const nextStep = stepRef.current + direction;
        if (nextStep < 0 && current > 0) {
          navigateTo(current - 1, chapterSteps[current - 1]);
        } else if (nextStep > chapterSteps[current] && current < TOTAL_CHAPTERS - 1) {
          navigateTo(current + 1, 0);
        } else if (nextStep >= 0 && nextStep <= chapterSteps[current]) {
          stepRef.current = nextStep;
          setStep(nextStep);
          cooldownRef.current = true;
          setTimeout(() => { cooldownRef.current = false; }, reducedMotion ? 100 : 420);
        }
        return;
      }

      accumulatedRef.current = Math.max(0, accumulatedRef.current + e.deltaY * 0.62);
      const raw = accumulatedRef.current / 2100;
      if (raw >= 0.92 && direction > 0 && current < TOTAL_CHAPTERS - 1) {
        navigateTo(current + 1, 0);
      } else if (accumulatedRef.current <= 20 && direction < 0 && current > 0) {
        navigateTo(current - 1, chapterSteps[current - 1]);
        accumulatedRef.current = 1950;
        targetRef.current = 0.93;
      } else {
        if (reducedMotion) {
          setSmoothProgress(Math.min(0.999, raw));
        } else {
          targetRef.current = Math.min(0.999, raw);
        }
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [isDesktop, navigateTo, reducedMotion]);

  useEffect(() => {
    if (!isDesktop) return;
    const onKey = (e) => {
      if (!['ArrowDown', 'PageDown', 'ArrowUp', 'PageUp'].includes(e.key)) return;
      e.preventDefault();
      const current = activeRef.current;
      const direction = e.key === 'ArrowDown' || e.key === 'PageDown' ? 1 : -1;
      if (blockedRef.current) { blockedRef.current = false; return; }
      if (chapterType[current] === 'continuous') {
        navigateTo(Math.max(0, Math.min(TOTAL_CHAPTERS - 1, current + direction)));
        return;
      }
      const nextStep = stepRef.current + direction;
      if (nextStep < 0 && current > 0) navigateTo(current - 1, chapterSteps[current - 1]);
      else if (nextStep > chapterSteps[current] && current < TOTAL_CHAPTERS - 1) navigateTo(current + 1);
      else if (nextStep >= 0 && nextStep <= chapterSteps[current]) { stepRef.current = nextStep; setStep(nextStep); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isDesktop, navigateTo]);

  return { activeChapter, step, smoothProgress, setBlocked, skipBlocked, isDesktop, reducedMotion, activeSectionId: sectionIds[activeChapter], navigateTo };
}

function Header({ activeSectionId, onNavigate, cardless, onToggleCardless, isInicio }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setMobileOpen(false); };
    if (mobileOpen) { window.addEventListener('keydown', onKey); document.body.style.overflow = 'hidden'; }
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [mobileOpen]);

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
              return <a key={item.href} className={`transition hover:text-ink ${activeSectionId === id ? 'text-ink' : 'text-graphite/70'}`} href={item.href} onClick={(e) => { if (onNavigate) { e.preventDefault(); onNavigate(id); } }}>{item.label}</a>;
            })}
          </div>
        </nav>
        <div className="flex items-center justify-self-end gap-3">
          <button className="flex h-11 w-11 min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1.5 rounded-full bg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 md:hidden" onClick={() => setMobileOpen((v) => !v)} aria-label="Menu" aria-expanded={mobileOpen}>
            <span className={`block h-px w-4 bg-white transition ${mobileOpen ? 'translate-y-[3px] rotate-45' : ''}`} />
            <span className={`block h-px w-4 bg-white transition ${mobileOpen ? '-translate-y-[3px] -rotate-45' : ''}`} />
          </button>
          <button type="button" onClick={onToggleCardless} className={`min-h-[44px] rounded-full px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-all duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 ${isInicio ? 'border border-white/50 text-white/70 hover:border-white/80 hover:text-white hover:bg-white/8' : 'border border-ink/15 text-graphite/65 hover:border-ink/25 hover:text-ink'}`} aria-label={cardless ? 'Activar tarjetas' : 'Modo sin tarjetas'}>{cardless ? 'Tarjetas' : 'Minimal'}</button>
          <a className={`min-h-[44px] rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 ${isInicio ? 'bg-white/14 text-white shadow-lift hover:-translate-y-0.5 hover:bg-white/22' : 'bg-ink text-white shadow-lift hover:-translate-y-0.5 hover:bg-graphite'}`} href={`https://wa.me/${PHONE_INTL}`} target="_blank" rel="noopener noreferrer">Pedir asesoría</a>
        </div>
      </div>
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-ink/20 md:hidden" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <div className="relative z-50 mx-auto mt-3 max-w-7xl rounded-[2rem] border border-white/70 bg-pearl p-6 shadow-lift md:hidden">
            <div className="flex flex-col gap-3">{navItems.map((item) => <a key={item.href} className={`rounded-2xl px-4 py-3 text-lg font-medium transition ${activeSectionId === item.href.slice(1) ? 'bg-ink/5 text-ink' : 'text-graphite/75'}`} href={item.href} onClick={() => setMobileOpen(false)}>{item.label}</a>)}</div>
          </div>
        </>
      )}
    </header>
  );
}

function Inicio({ step, isActive, cardless }) {
  const s = isActive ? step : 0;
  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden">
      <img src="https://images.unsplash.com/photo-1763485956293-873ea83bf095?auto=format&fit=crop&w=2200&q=90" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/48 via-ink/34 to-ink/72" />
       <LogoMark className="absolute left-1/2 top-[15%] z-10 h-[13.5rem] w-[13.5rem] -translate-x-1/2 opacity-90" minimal={cardless} />
      <div className="relative z-10 mx-auto max-w-6xl px-4 text-center sm:px-6">
        <p className="mb-3 inline-block text-sm font-semibold uppercase tracking-[0.34em] text-clay"><span className="inline-block rounded-lg bg-ink/20 px-3 py-1.5 backdrop-blur-sm">Tienda</span></p>
        <h1 className="font-display text-5xl leading-[0.9] tracking-[0.045em] text-white sm:text-7xl lg:text-8xl text-wrap-balance">AREA LRMQ</h1>
        <p className="mt-4 text-3xl font-semibold tracking-[0.16em] text-clay uppercase">DESIGN S.L.</p>
      </div>
      <div className={`absolute bottom-6 left-1/2 z-10 -translate-x-1/2 transition-opacity duration-500 ${s >= 1 ? 'opacity-0' : 'opacity-100'}`}>
        <span className="block h-8 w-px bg-white/35 mx-auto" />
        <span className="mt-2 block text-xs tracking-[0.2em] text-white/45 uppercase">Gira para avanzar</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-32 sm:px-6">
        <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-3">
          {methodSteps.map((item, index) => (
            cardless ? (
              <article key={item.title} className={`border-l-2 border-clay/40 pl-5 text-left transition-all duration-500 ease-out ${s > index ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-14 blur-[2px]'}`}>
                <span className="font-display text-3xl text-clay">{index + 1}</span>
                <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{item.copy}</p>
              </article>
            ) : (
              <article key={item.title} className={`rounded-[1.6rem] border border-white/14 bg-ink/30 p-5 text-left shadow-lift backdrop-blur-sm transition-all duration-500 ease-out ${s > index ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-14 blur-[2px]'}`}>
                <span className="font-display text-3xl text-clay">{index + 1}</span>
                <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{item.copy}</p>
              </article>
            )
          ))}
        </div>
      </div>
    </div>
  );
}

function Coleccion({ step, isActive, cardless }) {
  const s = isActive ? step : 0;
  const featured = categories[0];
  const tray = categories[1];
  const taps = categories[2];
  const accessories = categories[3];

  if (cardless) {
    return (
      <div className="flex h-full items-center bg-transparent px-6 py-24 md:pb-10 md:pt-36">
        <div className="mx-auto w-full max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="font-display text-5xl leading-[0.96] tracking-[0.035em] text-ink sm:text-6xl text-wrap-balance">Cuatro decisiones, una lectura.</h2>
            <p className={`mx-auto mt-5 max-w-2xl text-lg leading-8 text-ink/74 transition-all duration-500 ease-out ${s >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>La tienda no separa piezas por catálogo. Ordena vidrio, superficie, metal y detalle para que el baño tenga una sola dirección visual.</p>
          </div>
          <div className="grid gap-10 lg:grid-cols-[1fr_0.76fr]">
            <div className={`transition-all duration-500 ease-out ${s >= 2 ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-8 blur-[2px]'}`}>
              <img src={featured.image} alt={featured.imageAlt} className="aspect-[16/10] w-full rounded-[1.8rem] object-cover" loading="lazy" />
              <div className={`mt-6 transition-all duration-500 ease-out ${s >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <p className="mb-2 border-l-2 border-clay/35 pl-4 text-sm font-semibold text-clay">{featured.label}</p>
                <h3 className="font-display text-4xl leading-none tracking-[0.035em] text-ink">{featured.title}</h3>
                <p className="mt-4 max-w-xl text-base leading-7 text-ink/72">{featured.copy}</p>
              </div>
            </div>
            <div className="space-y-8 self-end">
              <div className={`border-l-2 border-clay/25 pl-4 transition-all duration-500 ease-out ${s >= 4 ? 'opacity-100 translate-x-0 blur-0' : 'opacity-0 translate-x-8 blur-[1px]'}`}>
                <p className="text-sm font-semibold text-clay">{tray.label}</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink">{tray.title}</h3>
                <p className="mt-3 text-base leading-7 text-ink/68">{tray.copy}</p>
              </div>
              <div className={`border-l-2 border-clay/25 pl-4 transition-all duration-500 ease-out ${s >= 5 ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-8 blur-[1px]'}`}>
                <p className="text-sm font-semibold text-clay">{taps.label}</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink">{taps.title}</h3>
                <p className="mt-3 text-base leading-7 text-ink/68">{taps.copy}</p>
              </div>
              <div className={`border-l-2 border-clay/25 pl-4 transition-all duration-500 ease-out ${s >= 6 ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-8 blur-[1px]'}`}>
                <p className="text-sm font-semibold text-clay">{accessories.label}</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink">{accessories.title}</h3>
                <p className="mt-3 text-base leading-7 text-ink/68">{accessories.copy}</p>
              </div>
              <aside className={`border-l-2 border-clay/20 pl-4 transition-all duration-500 ease-out ${s >= 7 ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-7 blur-[1px]'}`}>
                <p className="text-base leading-7 text-ink/68">El criterio es sencillo: si una pieza pide protagonismo, las demás bajan el volumen. Por eso el conjunto se decide antes que el objeto.</p>
              </aside>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center bg-transparent px-6 py-24 md:pb-10 md:pt-36">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8 flex items-end justify-center gap-8 text-center">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-5xl leading-[0.96] tracking-[0.035em] text-ink sm:text-6xl text-wrap-balance">Cuatro decisiones, una lectura.</h2>
            <p className={`mx-auto mt-5 max-w-2xl text-lg leading-8 text-ink/74 transition-all duration-500 ease-out ${s >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>La tienda no separa piezas por catálogo. Ordena vidrio, superficie, metal y detalle para que el baño tenga una sola dirección visual.</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch">
          <article className={`group self-center overflow-hidden rounded-[2.7rem] border border-white/70 bg-white/70 p-4 shadow-lift transition-all duration-500 ease-out ${s >= 2 ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-8 blur-[2px]'}`}>
            <div className="relative min-h-[240px] overflow-hidden rounded-[2.1rem] bg-ink md:min-h-[280px]">
              <img src={featured.image} alt={featured.imageAlt} className="absolute inset-0 h-full w-full object-cover opacity-95 transition duration-700 group-hover:scale-[1.03]" loading="lazy" />
            </div>
            <div className={`px-3 pb-2 pt-5 transition-all duration-500 ease-out ${s >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
              <p className="text-sm font-semibold text-clay">{featured.label}</p>
              <h3 className="mt-3 font-display text-4xl leading-none tracking-[0.035em] text-ink">{featured.title}</h3>
              <p className="mt-4 max-w-xl text-base leading-7 text-ink/76">{featured.copy}</p>
            </div>
          </article>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-1">
            <article className={`flex min-h-[140px] gap-5 rounded-[2rem] border border-ink/6 bg-pearl/82 p-4 shadow-soft transition-all duration-500 ease-out ${s >= 4 ? 'opacity-100 translate-x-0 blur-0' : 'opacity-0 translate-x-8 blur-[1px]'}`}>
              <img src={tray.image} alt={tray.imageAlt} className="h-28 w-28 shrink-0 rounded-[1.4rem] object-cover shadow-soft" loading="lazy" />
              <div className="self-center">
                <p className="text-sm font-semibold text-clay">{tray.label}</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink">{tray.title}</h3>
                <p className="mt-3 text-base leading-7 text-ink/72">{tray.copy}</p>
              </div>
            </article>

            <div className="grid gap-5 sm:grid-cols-[0.9fr_1.1fr]">
              <article className={`overflow-hidden rounded-[2rem] border border-ink/6 bg-white/62 shadow-soft transition-all duration-500 ease-out ${s >= 5 ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-8 blur-[1px]'}`}>
                <img src={taps.image} alt={taps.imageAlt} className="h-32 w-full object-cover" loading="lazy" />
                <div className="p-5">
                  <p className="text-sm font-semibold text-clay">{taps.label}</p>
                  <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-ink">{taps.title}</h3>
                </div>
              </article>

              <article className={`rounded-[2rem] border border-ink/6 bg-ink p-6 text-white shadow-lift transition-all duration-500 ease-out ${s >= 6 ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-8 blur-[1px]'}`}>
                <p className="text-sm font-semibold text-clay">{accessories.label}</p>
                <h3 className="mt-3 font-display text-3xl leading-none tracking-[0.035em]">{accessories.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/72">{accessories.copy}</p>
              </article>
            </div>

            <aside className={`rounded-[2rem] border border-clay/20 bg-white/70 p-5 shadow-soft transition-all duration-500 ease-out ${s >= 7 ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-7 blur-[1px]'}`}>
              <p className="max-w-2xl text-base leading-7 text-ink/76">El criterio es sencillo: si una pieza pide protagonismo, las demás bajan el volumen. Por eso el conjunto se decide antes que el objeto.</p>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function Reformas({ smoothProgress, isActive, cardless }) {
  const videoRef = useRef(null);
  const [duration, setDuration] = useState(13.7);
  const progress = isActive ? smoothProgress : 0;
  const videoProgress = Math.min(progress / 0.88, 1);

  useEffect(() => {
    if (!videoRef.current) return;
    if (!isActive) { videoRef.current.pause(); return; }
    videoRef.current.currentTime = videoProgress * duration;
  }, [duration, isActive, videoProgress]);

  return (
    <div className="flex h-full items-center bg-transparent px-6">
      <div className={`mx-auto grid w-full max-w-7xl gap-10 ${cardless ? 'lg:grid-cols-[1.55fr_0.75fr]' : 'lg:grid-cols-[1.18fr_0.82fr]'} lg:items-center`}>
        {cardless ? (
          <video ref={videoRef} src="/reforma-bano.mp4" muted playsInline preload="auto" onLoadedMetadata={() => { if (videoRef.current) setDuration(videoRef.current.duration); }} className="w-full rounded-[1.2rem]" aria-label="Video stopmotion de reforma de baño completo" />
        ) : (
          <div className="relative overflow-hidden rounded-[2.4rem] border border-white/70 bg-white/44 p-3 shadow-lift backdrop-blur-sm">
            <video ref={videoRef} src="/reforma-bano.mp4" muted playsInline preload="auto" onLoadedMetadata={() => { if (videoRef.current) setDuration(videoRef.current.duration); }} className="w-full rounded-[1.8rem]" aria-label="Video stopmotion de reforma de bano completo" />
          </div>
        )}
        {cardless ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Proyecto real</p>
            <h2 className="mt-3 font-display text-5xl leading-[0.96] tracking-[0.035em] text-ink text-wrap-balance">Reforma en 21 días.</h2>
            <div className="mt-7 space-y-4">
              {['Baño principal, Madrid.', 'Mampara fija a medida, plato mineral enrasado y grifería mural.', 'El vidrio libera luz, el plato continuo reduce cortes visuales.', 'Satisfacción del cliente: 9.6 / 10.'].map((text, index) => (
                <p key={text} className="flex items-start gap-3"><span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-clay/12 text-xs font-semibold text-clay">{index + 1}</span><span className="text-ink/72">{text}</span></p>
              ))}
            </div>
            <div className="mt-7 h-1.5 w-full rounded-full bg-ink/8"><div className="h-full rounded-full bg-clay transition-[width] duration-150 ease-linear" style={{ width: `${videoProgress * 100}%` }} /></div>
            <p className="mt-3 text-xs font-medium uppercase tracking-wider text-ink/40">{videoProgress >= 1 ? 'Proyecto completo. Gira para continuar.' : `Avance de obra ${Math.round(videoProgress * 100)}%`}</p>
          </div>
        ) : (
          <div className="rounded-[2.4rem] border border-ink/6 bg-pearl/78 p-8 shadow-soft backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Proyecto real</p>
            <h2 className="mt-3 font-display text-5xl leading-[0.96] tracking-[0.035em] text-ink text-wrap-balance">Reforma en 21 días.</h2>
            <div className="mt-7 space-y-4 text-base leading-relaxed text-ink/75">
              {['Baño principal, Madrid.', 'Mampara fija a medida, plato mineral enrasado y grifería mural.', 'El vidrio libera luz, el plato continuo reduce cortes visuales.', 'Satisfacción del cliente: 9.6 / 10.'].map((text, index) => (
                <p key={text} className="flex items-start gap-3"><span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-clay/12 text-xs font-semibold text-clay">{index + 1}</span><span>{text}</span></p>
              ))}
            </div>
            <div className="mt-7 h-1.5 w-full rounded-full bg-ink/8"><div className="h-full rounded-full bg-clay transition-[width] duration-150 ease-linear" style={{ width: `${videoProgress * 100}%` }} /></div>
            <p className="mt-3 text-center text-xs font-medium uppercase tracking-wider text-ink/40">{videoProgress >= 1 ? 'Proyecto completo. Gira para continuar.' : `Avance de obra ${Math.round(videoProgress * 100)}%`}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Vision({ step, isActive, setBlocked, cardless }) {
  const videoRef = useRef(null);
  const sliderRef = useRef(null);
  const draggingRef = useRef(false);
  const [videoDone, setVideoDone] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [sliderX, setSliderX] = useState(0.5);
  const s = isActive ? step : 0;

  useEffect(() => {
    if (!isActive) { if (videoRef.current) videoRef.current.pause(); setVideoDone(false); setShowReveal(false); return; }
    if (!videoRef.current) return;
    if (videoDone) { videoRef.current.pause(); return; }
    setBlocked(true);
    videoRef.current.currentTime = 0;
    setShowReveal(false);
    videoRef.current.play().catch(() => { setVideoDone(true); setBlocked(false); });
    const done = () => { videoRef.current?.pause(); setShowReveal(true); setBlocked(false); };
    videoRef.current.addEventListener('ended', done);
    return () => { videoRef.current?.removeEventListener('ended', done); setBlocked(false); };
  }, [isActive, setBlocked, videoDone]);

  const handleReveal = () => { setVideoDone(true); };

  const setFromClientX = (clientX) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    setSliderX(Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)));
  };
  const onPointerDown = (e) => { e.preventDefault(); draggingRef.current = true; setFromClientX(e.clientX); };
  useEffect(() => {
    const move = (e) => { if (draggingRef.current) setFromClientX(e.clientX); };
    const up = () => { draggingRef.current = false; };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, []);

  return (
    <div className="flex h-full items-center bg-transparent px-6">
      <div className={`mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] ${cardless ? 'lg:items-stretch' : ''}`}>
        <div ref={sliderRef} role="slider" tabIndex={0} aria-label="Comparar boceto con imagen final" aria-valuenow={Math.round(sliderX * 100)} aria-valuemin={0} aria-valuemax={100}
          onPointerDown={onPointerDown}
          onKeyDown={(e) => { if (!videoDone) return; if (e.key === 'ArrowRight') setSliderX((v) => Math.min(1, v + 0.05)); if (e.key === 'ArrowLeft') setSliderX((v) => Math.max(0, v - 0.05)); }}
          className={`relative aspect-[4/3] select-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-clay/30 ${cardless ? 'rounded-[1.2rem]' : 'rounded-[2.4rem] border border-white/70 bg-ink/8 p-3 shadow-lift'}`}
          style={{ touchAction: videoDone ? 'none' : 'auto' }}>

          <video ref={videoRef} src="/boceto-video.mp4" muted playsInline preload="auto" className={`absolute inset-0 h-full w-full object-cover bg-white ${cardless ? 'rounded-[1.2rem]' : 'rounded-[1.8rem]'}`} aria-label="Video de boceto dibujándose" />

          {videoDone && (
            <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${sliderX * 100}%)` }}>
              <img src="/boceto-final.png" alt="Imagen final del proyecto" className={`absolute inset-0 h-full w-full object-contain bg-white ${cardless ? 'rounded-[1.2rem]' : 'rounded-[1.8rem]'}`} draggable={false} />
            </div>
          )}

          {videoDone && (
            <div className="absolute bottom-0 top-0 w-0.5 bg-clay shadow-lg pointer-events-none" style={{ left: `${sliderX * 100}%` }}>
              <div className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-clay/30 bg-white text-ink shadow-lift"><span className="text-[10px] font-bold tracking-[0.16em]">DRAG</span></div>
            </div>
          )}

          {showReveal && !videoDone && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink/20">
              <button type="button" onClick={handleReveal} className="rounded-full border border-clay/40 bg-white px-8 py-3.5 text-sm font-semibold text-ink shadow-lift transition hover:-translate-y-0.5 hover:shadow-lg">Revelar</button>
            </div>
          )}
        </div>
        {cardless ? (
          <div className="relative self-stretch border-l-2 border-clay/30 pl-6">
            <div className={`absolute top-0 left-6 transition-all duration-500 ease-out ${s >= 1 ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}>
              <LogoMark className="h-[7.5rem] w-[7.5rem]" minimal />
            </div>
            <h2 className={`absolute left-6 right-0 font-display text-5xl leading-[0.96] tracking-[0.035em] text-ink sm:text-6xl text-wrap-balance transition-all duration-700 ease-out ${s >= 1 ? 'top-0 translate-y-0' : 'top-1/2 -translate-y-1/2'}`}>Del boceto al baño.</h2>
            <p className={`absolute left-6 right-0 text-lg leading-8 text-ink/72 transition-all duration-500 ease-out ${s >= 1 ? 'top-1/2 -translate-y-1/2 opacity-100' : 'top-1/2 -translate-y-1/2 translate-y-8 opacity-0'}`}>Antes de elegir una pieza, vemos proporción, paso de luz y continuidad. El resultado no empieza en catálogo, empieza en una imagen que ya encaja.</p>
          </div>
        ) : (
          <div className="rounded-[2.4rem] border border-ink/6 bg-pearl/78 p-8 shadow-soft backdrop-blur-sm">
            <div className="border-l-2 border-clay/25 pl-5">
              <LogoMark className="mb-7 h-16 w-16 opacity-35" />
              <h2 className="font-display text-5xl leading-[0.96] tracking-[0.035em] text-ink sm:text-6xl text-wrap-balance">Del boceto al baño.</h2>
              <p className={`mt-6 text-lg leading-8 text-ink/76 transition-all duration-500 ease-out ${s >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>Antes de elegir una pieza, vemos proporción, paso de luz y continuidad. El resultado no empieza en catálogo, empieza en una imagen que ya encaja.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Contact({ step, isActive, cardless }) {
  const s = isActive ? step : 0;
  const [form, setForm] = useState({ nombre: '', telefono: '', mensaje: '' });
  const whatsappText = encodeURIComponent(`Hola AREA LRMQ, quiero información sobre una reforma. Nombre: ${form.nombre}. Teléfono: ${form.telefono}. Mensaje: ${form.mensaje}`);

  return (
    <div className="flex h-full items-center bg-transparent px-6">
      <div className="mx-auto grid w-full max-w-6xl items-start gap-8 lg:grid-cols-[1fr_0.9fr]">
        {cardless ? (
          <div>
            <h2 className="font-display text-5xl leading-[0.96] tracking-[0.035em] text-ink sm:text-6xl text-wrap-balance">Hablemos de tu baño.</h2>
            <p className="mt-4 text-lg leading-8 text-ink/72">Envía medidas, estilo y plazo. Te devolvemos una selección inicial.</p>
            <form className="mt-7 space-y-4" onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="Nombre" aria-label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full border-b border-ink/15 bg-transparent py-3.5 text-ink placeholder:text-graphite/45 focus:border-ink/40 focus:outline-none" />
              <input type="tel" placeholder="Teléfono" aria-label="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="w-full border-b border-ink/15 bg-transparent py-3.5 text-ink placeholder:text-graphite/45 focus:border-ink/40 focus:outline-none" />
              <textarea placeholder="Medidas, estilo y plazo..." aria-label="Medidas, estilo y plazo" value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} rows={3} className="w-full resize-none border-b border-ink/15 bg-transparent py-3.5 text-ink placeholder:text-graphite/45 focus:border-ink/40 focus:outline-none" />
              <a href={`https://wa.me/${PHONE_INTL}?text=${whatsappText}`} target="_blank" rel="noopener noreferrer" className="block rounded-full bg-ink px-6 py-3.5 text-center font-semibold text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-graphite">Enviar por WhatsApp</a>
            </form>
          </div>
        ) : (
          <div className="rounded-[2.4rem] border border-ink/6 bg-pearl/82 p-8 shadow-soft backdrop-blur-sm">
            <h2 className="font-display text-5xl leading-[0.96] tracking-[0.035em] text-ink sm:text-6xl text-wrap-balance">Hablemos de tu baño.</h2>
            <p className="mt-4 text-lg leading-8 text-ink/76">Envía medidas, estilo y plazo. Te devolvemos una selección inicial.</p>
            <form className="mt-7 space-y-4" onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="Nombre" aria-label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full rounded-2xl border border-ink/10 bg-white/75 px-5 py-3.5 text-ink placeholder:text-graphite/45 focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-clay/20" />
              <input type="tel" placeholder="Teléfono" aria-label="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="w-full rounded-2xl border border-ink/10 bg-white/75 px-5 py-3.5 text-ink placeholder:text-graphite/45 focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-clay/20" />
              <textarea placeholder="Medidas, estilo y plazo..." aria-label="Medidas, estilo y plazo" value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} rows={3} className="w-full resize-none rounded-2xl border border-ink/10 bg-white/75 px-5 py-3.5 text-ink placeholder:text-graphite/45 focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-clay/20" />
              <a href={`https://wa.me/${PHONE_INTL}?text=${whatsappText}`} target="_blank" rel="noopener noreferrer" className="block rounded-full bg-ink px-6 py-3.5 text-center font-semibold text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-graphite">Enviar por WhatsApp</a>
            </form>
          </div>
        )}
        <div className={`space-y-4 transition-all duration-500 ease-out ${s >= 1 ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0'}`}>
          {cardless ? (
            <div>
              <LogoMark className="mb-6 h-[7.5rem] w-[7.5rem]" minimal />
              <p className="font-display text-3xl leading-tight text-ink">AREA LRMQ Tienda</p>
              <p className="mt-3 text-ink/65">{ADDRESS}</p>
            </div>
          ) : (
            <div className="rounded-[2.4rem] border border-ink/6 bg-ink p-7 text-white shadow-lift">
              <LogoMark className="mb-6 h-16 w-16" />
              <p className="font-display text-3xl leading-tight">AREA LRMQ Tienda</p>
              <p className="mt-3 text-white/70">{ADDRESS}</p>
            </div>
          )}
          {cardless ? (
            <>
              <a href={`https://wa.me/${PHONE_INTL}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 py-3 text-ink transition hover:opacity-70"><span className="text-[#25D366] text-sm font-bold">WA</span><span className="font-semibold">WhatsApp {PHONE}</span></a>
              <a href={`tel:+34${PHONE}`} className="flex items-center gap-4 py-3 text-ink transition hover:opacity-70"><span className="text-xs font-bold text-ink/50 tracking-[0.08em]">TEL</span><span className="font-semibold">Llamar {PHONE}</span></a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 py-3 text-ink transition hover:opacity-70"><span className="text-sm font-bold text-clay">IG</span><span className="font-semibold">Instagram</span></a>
              <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="block py-3 text-ink transition hover:opacity-70"><span className="font-semibold">Ver ubicación</span></a>
            </>
          ) : (
            <>
              <a href={`https://wa.me/${PHONE_INTL}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-white/78 p-4 text-ink shadow-soft transition hover:-translate-y-0.5"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#25D366]/15 text-[#25D366]">WA</span><span className="font-semibold">WhatsApp {PHONE}</span></a>
              <a href={`tel:+34${PHONE}`} className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-white/78 p-4 text-ink shadow-soft transition hover:-translate-y-0.5"><span className="grid h-10 w-10 place-items-center rounded-full bg-ink/8 text-xs font-bold tracking-[0.08em]">TEL</span><span className="font-semibold">Llamar {PHONE}</span></a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-white/78 p-4 text-ink shadow-soft transition hover:-translate-y-0.5"><span className="grid h-10 w-10 place-items-center rounded-full bg-clay/12 text-clay">IG</span><span className="font-semibold">Instagram</span></a>
              <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-[2rem] border border-ink/8 bg-white/78 shadow-soft transition hover:-translate-y-0.5">
                <div className="grid h-32 place-items-center bg-[linear-gradient(135deg,#d8d0c2,#f8f6f1_45%,#b98364_160%)] text-center text-sm font-semibold text-ink/75">Ver ubicación</div>
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ChapterDots({ active, labels }) {
  return <div className="fixed right-4 top-1/2 z-50 hidden -translate-y-1/2 flex-col items-end gap-3 md:flex">{sectionIds.map((_, index) => <span key={index} className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${index === active ? 'scale-125 bg-ink' : 'bg-ink/20'}`} />)}<span className="mt-2 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/50">{labels[active]}</span></div>;
}

function MobileSections({ cardless, reducedMotion }) {
  return (
    <div className="bg-transparent text-ink">
      <MobileInicio cardless={cardless} />
      <MobileColeccion cardless={cardless} />
      <MobileReformas cardless={cardless} reducedMotion={reducedMotion} />
      <MobileVision cardless={cardless} reducedMotion={reducedMotion} />
      <MobileContacto cardless={cardless} />
    </div>
  );
}

function MobileSectionShell({ id, label, titleId, children, ariaLabel }) {
  return (
    <section id={id} aria-labelledby={titleId} aria-label={ariaLabel} className="px-5 py-20 sm:px-8 sm:py-24">
      {label && <p className="mx-auto max-w-2xl text-xs font-semibold uppercase tracking-[0.22em] text-clay">{label}</p>}
      <div className="mx-auto max-w-2xl pt-3">{children}</div>
    </section>
  );
}

function MobileInicio({ cardless }) {
  if (!cardless) {
    return (
      <section id="inicio" aria-label="Inicio" className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden">
        <img src="https://images.unsplash.com/photo-1763485956293-873ea83bf095?auto=format&fit=crop&w=1200&q=80" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/40 to-ink/78" />
        <div className="relative z-10 mx-auto max-w-lg px-6 pt-20 pb-28 text-center">
          <LogoMark className="mx-auto mb-6 h-20 w-20 opacity-90" />
          <h1 className="font-display text-4xl leading-[0.9] tracking-[0.045em] text-white sm:text-5xl text-wrap-balance">AREA LRMQ</h1>
          <p className="mt-3 text-xl font-semibold tracking-[0.14em] text-clay uppercase">DESIGN S.L.</p>
        </div>
      </section>
    );
  }
  return (
    <section id="inicio" aria-labelledby="mobile-inicio-title" className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-white px-6 pt-24 pb-16 sm:pt-32">
      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center text-center">
        <LogoMark className="mb-8 h-28 w-28 sm:h-32 sm:w-32" minimal />
        <h1 id="mobile-inicio-title" className="font-display text-5xl leading-[0.92] tracking-[0.045em] text-ink sm:text-6xl text-wrap-balance">AREA LRMQ</h1>
        <p className="mt-3 text-base font-semibold tracking-[0.18em] text-clay uppercase sm:text-lg">DESIGN S.L.</p>
        <p className="mt-6 max-w-md text-base leading-7 text-ink/72 sm:text-lg sm:leading-8">Baños, materiales y decisiones visuales con medida. Mamparas a medida, platos minerales, grifería premium y accesorios.</p>
        <a href={`https://wa.me/${PHONE_INTL}?text=${encodeURIComponent('Hola AREA LRMQ, quiero pedir asesoría para mi baño.')}`} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-full bg-ink px-7 py-3 text-sm font-semibold text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2">Pedir asesoría</a>
      </div>
    </section>
  );
}

function MobileColeccion({ cardless }) {
  const featured = categories[0];
  const tray = categories[1];
  const taps = categories[2];
  const accessories = categories[3];
  if (!cardless) {
    return (
      <section id="coleccion" aria-labelledby="mobile-coleccion-title" className="bg-transparent px-5 py-16 sm:px-6">
        <div className="mx-auto max-w-lg">
          <h2 id="mobile-coleccion-title" className="text-center font-display text-3xl leading-[1.05] tracking-[0.035em] text-ink sm:text-4xl text-wrap-balance">Cuatro decisiones, una lectura.</h2>
          <p className="mx-auto mt-4 max-w-sm text-center text-base leading-7 text-ink/72">La tienda ordena vidrio, superficie, metal y detalle para que el baño tenga una sola dirección visual.</p>
        </div>
        <div className="mx-auto mt-10 flex max-w-lg flex-col gap-5">
          <article className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 shadow-soft">
            <img src={categories[0].image} alt={categories[0].imageAlt} className="aspect-[4/3] w-full object-cover" loading="lazy" />
            <div className="p-5">
              <p className="text-sm font-semibold text-clay">{categories[0].label}</p>
              <h3 className="mt-2 font-display text-3xl leading-none tracking-[0.035em] text-ink">{categories[0].title}</h3>
              <p className="mt-3 text-base leading-7 text-ink/72">{categories[0].copy}</p>
            </div>
          </article>
          <div className="grid gap-5 sm:grid-cols-2">
            <article className="rounded-[1.6rem] border border-ink/6 bg-pearl/82 p-4 shadow-soft">
              <img src={categories[1].image} alt={categories[1].imageAlt} className="aspect-square w-full rounded-[1.1rem] object-cover" loading="lazy" />
              <p className="mt-3 text-sm font-semibold text-clay">{categories[1].label}</p>
              <h3 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-ink">{categories[1].title}</h3>
            </article>
            <article className="rounded-[1.6rem] border border-ink/6 bg-white/62 shadow-soft">
              <img src={categories[2].image} alt={categories[2].imageAlt} className="aspect-[4/3] w-full rounded-t-[1.6rem] object-cover" loading="lazy" />
              <div className="p-4">
                <p className="text-sm font-semibold text-clay">{categories[2].label}</p>
                <h3 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-ink">{categories[2].title}</h3>
              </div>
            </article>
          </div>
          <article className="rounded-[1.6rem] border border-ink/6 bg-ink p-5 text-white shadow-lift">
            <p className="text-sm font-semibold text-clay">{categories[3].label}</p>
            <h3 className="mt-2 font-display text-2xl leading-none tracking-[0.035em]">{categories[3].title}</h3>
            <p className="mt-3 text-sm leading-7 text-white/68">{categories[3].copy}</p>
          </article>
          <aside className="rounded-[1.6rem] border border-clay/20 bg-white/70 p-5 shadow-soft">
            <p className="text-base leading-7 text-ink/72">El criterio es sencillo: si una pieza pide protagonismo, las demás bajan el volumen.</p>
          </aside>
        </div>
      </section>
    );
  }
  return (
    <MobileSectionShell id="coleccion" titleId="mobile-coleccion-title" ariaLabel="Colección">
      <h2 id="mobile-coleccion-title" className="font-display text-4xl leading-[1.02] tracking-[0.035em] text-ink sm:text-5xl text-wrap-balance">Cuatro decisiones, una lectura.</h2>
      <p className="mt-4 text-base leading-7 text-ink/72 sm:text-lg sm:leading-8">La tienda no separa piezas por catálogo. Ordena vidrio, superficie, metal y detalle para que el baño tenga una sola dirección visual.</p>
      <div className="mt-10 overflow-hidden border-l-2 border-clay/35 pl-5">
        <img src={featured.image} alt={featured.imageAlt} className="aspect-[16/10] w-full rounded-[1.4rem] object-cover" loading="lazy" />
        <p className="mt-6 text-sm font-semibold text-clay">{featured.label}</p>
        <h3 className="mt-2 font-display text-3xl leading-none tracking-[0.035em] text-ink sm:text-4xl">{featured.title}</h3>
        <p className="mt-3 text-base leading-7 text-ink/72">{featured.copy}</p>
      </div>
      <div className="mt-10 space-y-7">
        <div className="border-l-2 border-clay/25 pl-5">
          <p className="text-sm font-semibold text-clay">{tray.label}</p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-ink sm:text-2xl">{tray.title}</h3>
          <p className="mt-2 text-base leading-7 text-ink/72">{tray.copy}</p>
        </div>
        <div className="border-l-2 border-clay/25 pl-5">
          <p className="text-sm font-semibold text-clay">{taps.label}</p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-ink sm:text-2xl">{taps.title}</h3>
          <p className="mt-2 text-base leading-7 text-ink/72">{taps.copy}</p>
        </div>
        <div className="border-l-2 border-clay/25 pl-5">
          <p className="text-sm font-semibold text-clay">{accessories.label}</p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-ink sm:text-2xl">{accessories.title}</h3>
          <p className="mt-2 text-base leading-7 text-ink/72">{accessories.copy}</p>
        </div>
      </div>
      <p className="mt-10 max-w-xl border-l-2 border-clay/15 pl-5 text-base leading-7 text-ink/65">El criterio es sencillo: si una pieza pide protagonismo, las demás bajan el volumen. Por eso el conjunto se decide antes que el objeto.</p>
    </MobileSectionShell>
  );
}

function MobileReformas({ cardless, reducedMotion }) {
  const videoRef = useRef(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => {
      if (!v.duration) return;
      setProgress(Math.min(v.currentTime / v.duration, 1));
    };
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('ended', () => setProgress(1));
    return () => { v.removeEventListener('timeupdate', onTime); };
  }, []);
  const facts = ['Baño principal, Madrid.', 'Mampara fija a medida, plato mineral enrasado y grifería mural.', 'El vidrio libera luz, el plato continuo reduce cortes visuales.', 'Satisfacción del cliente: 9.6 / 10.'];

  if (!cardless) {
    return (
      <section id="reformas" aria-labelledby="mobile-reformas-title" className="bg-transparent px-5 py-16 sm:px-6">
        <div className="mx-auto max-w-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-clay">Proyecto real</p>
          <h2 id="mobile-reformas-title" className="mt-3 font-display text-3xl leading-[1.05] tracking-[0.035em] text-ink sm:text-4xl text-wrap-balance">Reforma en 21 días.</h2>
          <div className="mt-6 overflow-hidden rounded-[2rem] border border-white/70 bg-white/44 p-3 shadow-lift">
            <video src="/reforma-bano.mp4" controls muted playsInline preload="metadata" className="w-full rounded-[1.5rem]" aria-label="Video stopmotion de reforma de baño completo" />
          </div>
          <div className="mt-6 space-y-3 text-base leading-relaxed text-ink/72">
            {facts.map((text, index) => (
              <p key={text} className="flex items-start gap-3"><span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-clay/12 text-xs font-semibold text-clay">{index + 1}</span><span>{text}</span></p>
            ))}
          </div>
        </div>
      </section>
    );
  }
  return (
    <MobileSectionShell id="reformas" label="Proyecto real" titleId="mobile-reformas-title" ariaLabel="Reformas">
      <h2 id="mobile-reformas-title" className="font-display text-4xl leading-[1.02] tracking-[0.035em] text-ink sm:text-5xl text-wrap-balance">Reforma en 21 días.</h2>
      <p className="mt-4 text-base leading-7 text-ink/72 sm:text-lg sm:leading-8">Cuatro decisiones medidas para que la obra avance sin rectificar.</p>
      <div className="mt-8 overflow-hidden rounded-[1.4rem] border border-ink/8 bg-white">
        <video ref={videoRef} src="/reforma-bano.mp4" controls muted playsInline preload="metadata" poster="/boceto-poster.jpg" className="aspect-[4/3] w-full object-cover" aria-label="Video stopmotion de reforma de baño completo" />
      </div>
      <div className="mt-3 h-1.5 w-full rounded-full bg-ink/8" role="progressbar" aria-label="Avance de obra" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-clay transition-[width] duration-200 ease-linear" style={{ width: `${progress * 100}%` }} />
      </div>
      <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-ink/40">{progress >= 1 ? 'Proyecto completo' : `Avance de obra ${Math.round(progress * 100)}%`}</p>
      <ol className="mt-8 space-y-4 border-l-2 border-clay/30 pl-5 text-base leading-7 text-ink/75 sm:text-lg">
        {facts.map((text, index) => (
          <li key={text} className="flex items-start gap-3">
            <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-clay/12 text-xs font-semibold text-clay">{index + 1}</span>
            <span>{text}</span>
          </li>
        ))}
      </ol>
      <a href={`https://wa.me/${PHONE_INTL}?text=${encodeURIComponent('Hola AREA LRMQ, quiero información sobre una reforma.')}`} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-full bg-ink px-7 py-3 text-sm font-semibold text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2">Pedir asesoría</a>
      {reducedMotion && <span className="sr-only">El video se reproduce bajo demanda porque el usuario ha pedido reducir movimiento.</span>}
    </MobileSectionShell>
  );
}

function MobileVision({ cardless, reducedMotion }) {
  const videoRef = useRef(null);
  const sliderRef = useRef(null);
  const draggingRef = useRef(false);
  const [videoDone, setVideoDone] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [sliderX, setSliderX] = useState(0.5);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (reducedMotion) return;
    const playPromise = v.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => setAutoplayBlocked(true));
    }
    const done = () => { v.pause(); setShowReveal(true); setVideoDone(true); };
    v.addEventListener('ended', done);
    return () => { v.removeEventListener('ended', done); v.pause(); };
  }, [reducedMotion]);

  const handlePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    setAutoplayBlocked(false);
    v.play().catch(() => setAutoplayBlocked(true));
  };
  const handleReveal = () => { setVideoDone(true); setShowReveal(false); };
  const setFromClientX = (clientX) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    setSliderX(Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)));
  };
  const onPointerDown = (e) => { e.preventDefault(); draggingRef.current = true; setFromClientX(e.clientX); };
  useEffect(() => {
    const move = (e) => { if (draggingRef.current) setFromClientX(e.clientX); };
    const up = () => { draggingRef.current = false; };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); };
  }, []);

  if (!cardless) {
    return (
      <section id="vision" aria-labelledby="mobile-vision-title" className="bg-transparent px-5 py-16 sm:px-6">
        <div className="mx-auto max-w-lg">
          <h2 id="mobile-vision-title" className="font-display text-3xl leading-[1.05] tracking-[0.035em] text-ink sm:text-4xl text-wrap-balance">Del boceto al baño.</h2>
          <p className="mt-4 text-base leading-7 text-ink/72">Antes de elegir una pieza, vemos proporción, paso de luz y continuidad.</p>
          <div className="mt-6 overflow-hidden rounded-[2rem] border border-white/70 bg-ink/4 p-2 shadow-soft">
            <div className="relative overflow-hidden rounded-[1.5rem]">
              <img src="/boceto-final.png" alt="Imagen final del proyecto" className="aspect-[4/3] w-full object-contain bg-white" />
            </div>
          </div>
        </div>
      </section>
    );
  }
  return (
    <MobileSectionShell id="vision" titleId="mobile-vision-title" ariaLabel="Visión">
      <h2 id="mobile-vision-title" className="font-display text-4xl leading-[1.02] tracking-[0.035em] text-ink sm:text-5xl text-wrap-balance">Del boceto al baño.</h2>
      <p className="mt-4 text-base leading-7 text-ink/72 sm:text-lg sm:leading-8">Antes de elegir una pieza, vemos proporción, paso de luz y continuidad.</p>
      <div ref={sliderRef} role="slider" tabIndex={0} aria-label="Comparar boceto con imagen final" aria-valuenow={Math.round(sliderX * 100)} aria-valuemin={0} aria-valuemax={100}
        onPointerDown={onPointerDown}
        onKeyDown={(e) => { if (!videoDone) return; if (e.key === 'ArrowRight') setSliderX((v) => Math.min(1, v + 0.05)); if (e.key === 'ArrowLeft') setSliderX((v) => Math.max(0, v - 0.05)); }}
        className="relative mt-8 aspect-[4/3] w-full select-none overflow-hidden rounded-[1.4rem] border border-ink/8 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/40"
        style={{ touchAction: videoDone ? 'none' : 'auto' }}>
        <video ref={videoRef} src="/boceto-video.mp4" muted playsInline preload="metadata" poster="/boceto-poster.jpg" className="absolute inset-0 h-full w-full object-cover" aria-label="Video de boceto dibujándose" />
        {videoDone && (
          <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${sliderX * 100}%)` }}>
            <img src="/boceto-final.png" alt="Imagen final del proyecto" className="absolute inset-0 h-full w-full object-contain bg-white" draggable={false} />
          </div>
        )}
        {videoDone && (
          <div className="absolute inset-y-0 w-0.5 bg-clay shadow-lg pointer-events-none" style={{ left: `${sliderX * 100}%` }}>
            <div className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-clay/30 bg-white text-ink shadow-lift" aria-hidden="true">
              <span className="text-[10px] font-bold tracking-[0.16em]">DRAG</span>
            </div>
          </div>
        )}
        {showReveal && videoDone === false && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/20">
            <button type="button" onClick={handleReveal} className="min-h-[44px] rounded-full border border-clay/40 bg-white px-7 py-3 text-sm font-semibold text-ink shadow-lift transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2">Revelar</button>
          </div>
        )}
        {autoplayBlocked && !videoDone && !showReveal && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/20">
            <button type="button" onClick={handlePlay} className="min-h-[44px] rounded-full border border-clay/40 bg-white px-7 py-3 text-sm font-semibold text-ink shadow-lift transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2">Reproducir boceto</button>
          </div>
        )}
        {reducedMotion && !videoDone && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/15">
            <button type="button" onClick={handlePlay} className="min-h-[44px] rounded-full border border-clay/40 bg-white px-7 py-3 text-sm font-semibold text-ink shadow-lift transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2">Reproducir boceto</button>
          </div>
        )}
      </div>
      <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.18em] text-ink/40">{videoDone ? 'Arrastra para comparar' : 'Toca reproducir y luego revela'}</p>
    </MobileSectionShell>
  );
}

function MobileContacto({ cardless }) {
  const [form, setForm] = useState({ nombre: '', telefono: '', mensaje: '' });
  const whatsappText = encodeURIComponent(`Hola AREA LRMQ, quiero información sobre una reforma. Nombre: ${form.nombre}. Teléfono: ${form.telefono}. Mensaje: ${form.mensaje}`);

  if (!cardless) {
    return (
      <section id="contacto" aria-labelledby="mobile-contacto-title" className="bg-transparent px-5 py-16 sm:px-6">
        <div className="mx-auto max-w-lg">
          <h2 id="mobile-contacto-title" className="font-display text-3xl leading-[1.05] tracking-[0.035em] text-ink sm:text-4xl text-wrap-balance">Hablemos de tu baño.</h2>
          <p className="mt-3 text-base leading-7 text-ink/72">Envía medidas, estilo y plazo. Te devolvemos una selección inicial.</p>
          <div className="mt-6 rounded-[2rem] border border-ink/6 bg-ink p-5 text-white shadow-lift">
            <LogoMark className="mb-5 h-14 w-14" />
            <p className="font-display text-2xl leading-tight">AREA LRMQ Tienda</p>
            <p className="mt-2 text-white/65 text-sm">{ADDRESS}</p>
          </div>
          <div className="mt-4 space-y-3">
            <a href={`https://wa.me/${PHONE_INTL}`} className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-white/78 p-4 text-ink shadow-soft transition hover:-translate-y-0.5"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#25D366]/15 text-xs font-bold text-[#25D366]">WA</span><span className="font-semibold">WhatsApp {PHONE}</span></a>
            <a href={`tel:+34${PHONE}`} className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-white/78 p-4 text-ink shadow-soft transition hover:-translate-y-0.5"><span className="grid h-10 w-10 place-items-center rounded-full bg-ink/8 text-xs font-bold tracking-[0.08em]">TEL</span><span className="font-semibold">Llamar {PHONE}</span></a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-white/78 p-4 text-ink shadow-soft transition hover:-translate-y-0.5"><span className="grid h-10 w-10 place-items-center rounded-full bg-clay/12 text-xs font-bold text-clay">IG</span><span className="font-semibold">Instagram</span></a>
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-[2rem] border border-ink/8 bg-white/78 shadow-soft transition hover:-translate-y-0.5">
              <div className="grid h-28 place-items-center bg-[linear-gradient(135deg,#d8d0c2,#f8f6f1_45%,#b98364_160%)] text-center text-sm font-semibold text-ink/75">Ver ubicación</div>
            </a>
          </div>
          <form className="mt-5 space-y-3" onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Nombre" aria-label="Nombre" className="w-full rounded-2xl border border-ink/10 bg-white/75 px-5 py-3.5 text-ink placeholder:text-graphite/45 focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-clay/20" />
            <input type="tel" placeholder="Teléfono" aria-label="Teléfono" className="w-full rounded-2xl border border-ink/10 bg-white/75 px-5 py-3.5 text-ink placeholder:text-graphite/45 focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-clay/20" />
            <textarea placeholder="Medidas, estilo y plazo..." aria-label="Medidas, estilo y plazo" rows={2} className="w-full resize-none rounded-2xl border border-ink/10 bg-white/75 px-5 py-3.5 text-ink placeholder:text-graphite/45 focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-clay/20" />
            <a href={`https://wa.me/${PHONE_INTL}?text=${encodeURIComponent('Hola AREA LRMQ, quiero información sobre una reforma.')}`} target="_blank" rel="noopener noreferrer" className="block rounded-full bg-ink px-6 py-3.5 text-center font-semibold text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-graphite">Enviar por WhatsApp</a>
          </form>
        </div>
      </section>
    );
  }
  return (
    <MobileSectionShell id="contacto" titleId="mobile-contacto-title" ariaLabel="Contacto">
      <h2 id="mobile-contacto-title" className="font-display text-4xl leading-[1.02] tracking-[0.035em] text-ink sm:text-5xl text-wrap-balance">Hablemos de tu baño.</h2>
      <p className="mt-4 text-base leading-7 text-ink/72 sm:text-lg sm:leading-8">Envía medidas, estilo y plazo. Te devolvemos una selección inicial.</p>
      <div className="mt-8 border-l-2 border-clay/30 pl-5">
        <LogoMark className="mb-5 h-16 w-16" minimal />
        <p className="font-display text-2xl leading-tight text-ink sm:text-3xl">AREA LRMQ Tienda</p>
        <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-ink/70 underline-offset-2 hover:underline sm:text-base">{ADDRESS}</a>
      </div>
      <ul className="mt-6 space-y-1 border-l-2 border-clay/15 pl-5">
        <li>
          <a href={`https://wa.me/${PHONE_INTL}`} target="_blank" rel="noopener noreferrer" className="flex min-h-[44px] items-center gap-3 text-sm text-ink transition hover:text-clay sm:text-base">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#25D366]/15 text-[10px] font-bold tracking-[0.08em] text-[#25D366]">WA</span>
            <span className="font-semibold">WhatsApp {PHONE}</span>
          </a>
        </li>
        <li>
          <a href={`tel:+34${PHONE}`} className="flex min-h-[44px] items-center gap-3 text-sm text-ink transition hover:text-clay sm:text-base">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-ink/8 text-[10px] font-bold tracking-[0.08em] text-ink/70">TEL</span>
            <span className="font-semibold">Llamar {PHONE}</span>
          </a>
        </li>
        <li>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex min-h-[44px] items-center gap-3 text-sm text-ink transition hover:text-clay sm:text-base">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-clay/12 text-[10px] font-bold text-clay">IG</span>
            <span className="font-semibold">Instagram</span>
          </a>
        </li>
        <li>
          <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="flex min-h-[44px] items-center gap-3 text-sm text-ink transition hover:text-clay sm:text-base">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-ink/8 text-[10px] font-bold text-ink/70">MAP</span>
            <span className="font-semibold">Ver ubicación</span>
          </a>
        </li>
      </ul>
      <form className="mt-10 space-y-5 border-l-2 border-clay/15 pl-5" onSubmit={(e) => e.preventDefault()}>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Nombre</span>
          <input type="text" required aria-label="Nombre" aria-required="true" placeholder="Tu nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="mt-2 w-full border-b border-ink/15 bg-transparent py-3 text-base text-ink placeholder:text-graphite/45 focus:border-ink/40 focus:outline-none" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Teléfono</span>
          <input type="tel" required aria-label="Teléfono" aria-required="true" placeholder="6XX XX XX XX" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="mt-2 w-full border-b border-ink/15 bg-transparent py-3 text-base text-ink placeholder:text-graphite/45 focus:border-ink/40 focus:outline-none" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Mensaje</span>
          <textarea required aria-label="Mensaje" aria-required="true" placeholder="Medidas, estilo y plazo..." rows={3} value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} className="mt-2 w-full resize-none border-b border-ink/15 bg-transparent py-3 text-base text-ink placeholder:text-graphite/45 focus:border-ink/40 focus:outline-none" />
        </label>
        <a href={`https://wa.me/${PHONE_INTL}?text=${whatsappText}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-ink px-7 py-3 text-sm font-semibold text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2">Enviar por WhatsApp</a>
      </form>
    </MobileSectionShell>
  );
}

export default function App() {
  const { activeChapter, step, smoothProgress, setBlocked, skipBlocked, isDesktop, reducedMotion, activeSectionId, navigateTo } = useNarrativeScroll();
  const [cardless, setCardless] = useState(false);

  useEffect(() => {
    if (cardless) {
      document.body.style.background = '#ffffff';
    } else {
      document.body.style.background = '';
    }
    return () => { document.body.style.background = ''; };
  }, [cardless]);

  const chapterLabels = ['Inicio', 'Colección', 'Reformas', 'Visión', 'Contacto'];
  const chapters = [
    <Inicio key="inicio" step={activeChapter === 0 ? step : 0} isActive={activeChapter === 0} cardless={cardless} />,
    <Coleccion key="coleccion" step={activeChapter === 1 ? step : 0} isActive={activeChapter === 1} cardless={cardless} />,
    <Reformas key="reformas" smoothProgress={activeChapter === 2 ? smoothProgress : 0} isActive={activeChapter === 2} cardless={cardless} />,
    <Vision key="vision" step={activeChapter === 3 ? step : 0} isActive={activeChapter === 3} setBlocked={setBlocked} cardless={cardless} />,
    <Contact key="contacto" step={activeChapter === 4 ? step : 0} isActive={activeChapter === 4} cardless={cardless} />,
  ];

  return (
    <main className="font-body text-ink" id="contenido">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lift">Saltar al contenido</a>
      <Header activeSectionId={activeSectionId} onNavigate={isDesktop ? (id) => navigateTo(sectionIds.indexOf(id), 0) : undefined} cardless={cardless} onToggleCardless={() => setCardless((v) => !v)} isInicio={activeChapter === 0} />
      {isDesktop ? (
        <div className="fixed inset-0 hidden overflow-hidden md:block" style={{ height: '100svh' }}>
          <ChapterDots active={activeChapter} labels={chapterLabels} />
          <div className={`absolute inset-0 ease-out ${reducedMotion ? 'transition-none' : 'transition-transform duration-500'}`} style={{ transform: `translateY(${activeChapter * -100}svh)` }}>
            {chapters.map((chapter, index) => <div key={index} className="w-full" style={{ height: '100svh' }}>{chapter}</div>)}
          </div>
        </div>
      ) : <MobileSections cardless={cardless} reducedMotion={reducedMotion} />}
    </main>
  );
}
