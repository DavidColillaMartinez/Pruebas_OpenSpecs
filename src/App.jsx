import { useCallback, useEffect, useRef, useState } from 'react';

const PHONE = '629461032';
const PHONE_INTL = '34629461032';
const ADDRESS = 'C. de Aquitania, 69, San Blas-Canillejas, 28032 Madrid';
const MAPS_URL = `https://maps.google.com/?q=${encodeURIComponent(ADDRESS)}`;
const INSTAGRAM_URL = 'https://www.instagram.com/arealrmqtienda/';

const navItems = [
  { label: 'Coleccion', href: '#coleccion' },
  { label: 'Reformas', href: '#reformas' },
  { label: 'Vision', href: '#vision' },
  { label: 'Contacto', href: '#contacto' },
];

const categories = [
  { title: 'Mamparas a medida', label: 'Vidrio templado', copy: 'Perfiles ligeros y cierre limpio para ampliar visualmente el bano.', image: 'https://images.unsplash.com/photo-1572742482459-e04d6cfdd6f3?auto=format&fit=crop&w=700&q=85', imageAlt: 'Cabina de ducha con mampara de vidrio' },
  { title: 'Platos de ducha', label: 'Textura mineral', copy: 'Superficies antideslizantes con cortes precisos y acabados sobrios.', image: 'https://images.unsplash.com/photo-1656646523907-97b094c7e63a?auto=format&fit=crop&w=700&q=85', imageAlt: 'Suelo de ducha con baldosas blancas' },
  { title: 'Griferia premium', label: 'Lineas puras', copy: 'Monomandos con presencia escultural para uso diario confortable.', image: 'https://images.unsplash.com/photo-1623111771733-d3ab4d26ce41?auto=format&fit=crop&w=700&q=85', imageAlt: 'Grifo monomando plateado' },
  { title: 'Accesorios de bano', label: 'Detalle final', copy: 'Piezas funcionales que completan el proyecto sin romper la armonia.', image: 'https://images.unsplash.com/photo-1608651061499-ff031fbf6645?auto=format&fit=crop&w=700&q=85', imageAlt: 'Toallero en bano minimalista' },
];

const methodSteps = [
  { title: 'Medimos el espacio', copy: 'Dimensiones, uso diario y estilo antes de recomendar piezas.' },
  { title: 'Componemos la solucion', copy: 'Mampara, plato, griferia y accesorios en una linea visual.' },
  { title: 'Preparamos la instalacion', copy: 'Compra, entrega e instalacion sin improvisar.' },
];

const sectionIds = ['inicio', 'coleccion', 'reformas', 'vision', 'contacto'];
const chapterSteps = [3, 8, 0, 2, 1];
const chapterType = ['step', 'step', 'continuous', 'step', 'step'];
const TOTAL_CHAPTERS = sectionIds.length;

function LogoMark({ className = '' }) {
  return (
    <span className={`inline-grid place-items-center overflow-hidden rounded-full border border-clay/25 bg-white shadow-lift ${className}`} aria-hidden="true">
      <img src="/logo-area-lrmq.jpeg" alt="" className="h-full w-full scale-[1.85] object-contain" />
    </span>
  );
}

function useNarrativeScroll() {
  const [activeChapter, setActiveChapter] = useState(0);
  const [step, setStep] = useState(0);
  const [smoothProgress, setSmoothProgress] = useState(0);
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : false);
  const activeRef = useRef(0);
  const stepRef = useRef(0);
  const blockedRef = useRef(false);
  const cooldownRef = useRef(false);
  const accumulatedRef = useRef(0);
  const targetRef = useRef(0);

  useEffect(() => {
    const m = window.matchMedia('(min-width: 768px)');
    setIsDesktop(m.matches);
    const h = (e) => setIsDesktop(e.matches);
    m.addEventListener('change', h);
    return () => m.removeEventListener('change', h);
  }, []);

  const setBlocked = useCallback((value) => { blockedRef.current = value; }, []);

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
    if (!isDesktop) return;
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
  }, [isDesktop]);

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
          setTimeout(() => { cooldownRef.current = false; }, 420);
        }
        return;
      }

      accumulatedRef.current = Math.max(0, accumulatedRef.current + e.deltaY * 0.62);
      const raw = accumulatedRef.current / 2100;
      if (raw >= 0.99 && direction > 0 && current < TOTAL_CHAPTERS - 1) {
        navigateTo(current + 1, 0);
      } else if (accumulatedRef.current <= 20 && direction < 0 && current > 0) {
        navigateTo(current - 1, chapterSteps[current - 1]);
        accumulatedRef.current = 1950;
        targetRef.current = 0.93;
      } else {
        targetRef.current = Math.min(0.999, raw);
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [isDesktop, navigateTo]);

  useEffect(() => {
    if (!isDesktop) return;
    const onKey = (e) => {
      if (!['ArrowDown', 'PageDown', 'ArrowUp', 'PageUp'].includes(e.key)) return;
      e.preventDefault();
      const direction = e.key === 'ArrowDown' || e.key === 'PageDown' ? 1 : -1;
      const current = activeRef.current;
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

  return { activeChapter, step, smoothProgress, setBlocked, isDesktop, activeSectionId: sectionIds[activeChapter], navigateTo };
}

function Header({ activeSectionId, onNavigate }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setMobileOpen(false); };
    if (mobileOpen) { window.addEventListener('keydown', onKey); document.body.style.overflow = 'hidden'; }
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 py-4 sm:px-6">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/70 bg-pearl/82 px-4 py-3 shadow-lift backdrop-blur-xl">
        <a href="#inicio" className="flex items-center gap-3 font-semibold tracking-tight text-ink" aria-label="AREA LRMQ Tienda inicio" onClick={(e) => { if (onNavigate) { e.preventDefault(); onNavigate('inicio'); } }}>
          <LogoMark className="h-10 w-10" />
          <span className="font-display text-lg tracking-[0.02em]">AREA LRMQ Tienda</span>
        </a>
        <div className="hidden items-center gap-7 text-sm font-medium md:flex">
          {navItems.map((item) => {
            const id = item.href.slice(1);
            return <a key={item.href} className={`transition hover:text-ink ${activeSectionId === id ? 'text-ink' : 'text-graphite/70'}`} href={item.href} onClick={(e) => { if (onNavigate) { e.preventDefault(); onNavigate(id); } }}>{item.label}</a>;
          })}
        </div>
        <div className="flex items-center gap-3">
          <button className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full bg-ink md:hidden" onClick={() => setMobileOpen((v) => !v)} aria-label="Menu" aria-expanded={mobileOpen}>
            <span className={`block h-px w-4 bg-white transition ${mobileOpen ? 'translate-y-[3px] rotate-45' : ''}`} />
            <span className={`block h-px w-4 bg-white transition ${mobileOpen ? '-translate-y-[3px] -rotate-45' : ''}`} />
          </button>
          <a className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-graphite" href={`https://wa.me/${PHONE_INTL}`} target="_blank" rel="noopener noreferrer">Pedir asesoria</a>
        </div>
      </nav>
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

function Inicio({ step, isActive }) {
  const s = isActive ? step : 0;
  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden">
      <img src="https://images.unsplash.com/photo-1763485956293-873ea83bf095?auto=format&fit=crop&w=2200&q=90" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/48 via-ink/34 to-ink/72" />
       <LogoMark className="absolute left-1/2 top-[15%] z-10 h-28 w-28 -translate-x-1/2 opacity-90" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 text-center sm:px-6">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.34em] text-clay">Tienda</p>
        <h1 className="font-display text-6xl leading-[0.88] tracking-[0.01em] text-white sm:text-8xl lg:text-[7rem] text-wrap-balance">AREA LRMQ Tienda</h1>
        <p className="mx-auto mt-5 max-w-2xl text-xl leading-8 text-white/82">Banos, materiales y decisiones visuales con medida.</p>
      </div>
      <div className={`absolute bottom-6 left-1/2 z-10 -translate-x-1/2 transition-opacity duration-500 ${s >= 1 ? 'opacity-0' : 'opacity-100'}`}>
        <span className="block h-8 w-px bg-white/35 mx-auto" />
        <span className="mt-2 block text-xs tracking-[0.2em] text-white/45 uppercase">Desliza</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-14 sm:px-6">
        <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-3">
          {methodSteps.map((item, index) => (
            <article key={item.title} className={`rounded-[1.6rem] border border-white/14 bg-ink/30 p-5 text-left shadow-lift backdrop-blur-sm transition-all duration-500 ease-out ${s > index ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-14 blur-[2px]'}`}>
              <span className="font-display text-3xl text-clay">{index + 1}</span>
              <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{item.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function Coleccion({ step, isActive }) {
  const s = isActive ? step : 0;
  return (
    <div className="flex h-full items-center bg-transparent px-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-10 flex items-end justify-between gap-8">
          <h2 className="max-w-3xl font-display text-5xl leading-[0.96] tracking-[0.01em] text-ink sm:text-6xl text-wrap-balance">Coleccion por capas.</h2>
          <LogoMark className="hidden h-20 w-20 opacity-20 md:inline-grid" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {categories.map((item, index) => {
            const textStep = index * 2 + 1;
            const imageStep = index * 2 + 2;
            return (
              <article key={item.title} className="group flex min-h-[170px] gap-5 rounded-[2rem] border border-ink/6 bg-white/58 p-4 shadow-soft backdrop-blur-sm">
                <div className={`h-36 w-44 shrink-0 overflow-hidden rounded-[1.35rem] bg-mist shadow-soft transition-all duration-500 ease-out ${s >= imageStep ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 -translate-y-8 blur-[2px]'}`}>
                  <img src={item.image} alt={item.imageAlt} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                </div>
                <div className={`min-w-0 pt-2 transition-all duration-500 ease-out ${s >= textStep ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 -translate-y-6 blur-[1px]'}`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">{item.label}</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink">{item.title}</h3>
                  <p className="mt-3 text-base leading-7 text-ink/72">{item.copy}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Reformas({ smoothProgress, isActive }) {
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
      <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.18fr_0.82fr] lg:items-center">
        <div className="relative overflow-hidden rounded-[2.4rem] border border-white/70 bg-white/44 p-3 shadow-lift backdrop-blur-sm">
          <video ref={videoRef} src="/reforma-bano.mp4" muted playsInline preload="auto" onLoadedMetadata={() => { if (videoRef.current) setDuration(videoRef.current.duration); }} className="w-full rounded-[1.8rem]" aria-label="Video stopmotion de reforma de bano completo" />
        </div>
        <div className="rounded-[2.4rem] border border-ink/6 bg-pearl/78 p-8 shadow-soft backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Proyecto real</p>
          <h2 className="mt-3 font-display text-5xl leading-[0.96] tracking-[0.01em] text-ink text-wrap-balance">Reforma en 21 dias.</h2>
          <div className="mt-7 space-y-4 text-base leading-relaxed text-ink/75">
            {['Bano principal, Madrid.', 'Mampara fija a medida, plato mineral enrasado y griferia mural.', 'El vidrio libera luz, el plato continuo reduce cortes visuales.', 'Satisfaccion del cliente: 9.6 / 10.'].map((text, index) => (
              <p key={text} className="flex items-start gap-3"><span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-clay/12 text-xs font-semibold text-clay">{index + 1}</span><span>{text}</span></p>
            ))}
          </div>
          <div className="mt-7 h-1.5 w-full rounded-full bg-ink/8"><div className="h-full rounded-full bg-clay transition-[width] duration-150 ease-linear" style={{ width: `${progress * 100}%` }} /></div>
          <p className="mt-3 text-center text-xs font-medium uppercase tracking-wider text-ink/40">{videoProgress >= 1 ? 'Video completo. Un gesto mas para continuar.' : `Avance de obra ${Math.round(videoProgress * 100)}%`}</p>
        </div>
      </div>
    </div>
  );
}

function Vision({ step, isActive, setBlocked }) {
  const videoRef = useRef(null);
  const sliderRef = useRef(null);
  const draggingRef = useRef(false);
  const [videoDone, setVideoDone] = useState(false);
  const [sliderX, setSliderX] = useState(0.5);
  const s = isActive ? step : 0;

  useEffect(() => {
    if (!isActive) { if (videoRef.current) videoRef.current.pause(); return; }
    if (!videoRef.current || videoDone) return;
    setBlocked(true);
    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(() => { setVideoDone(true); setBlocked(false); });
    const done = () => { setVideoDone(true); setBlocked(false); };
    videoRef.current.addEventListener('ended', done);
    return () => { videoRef.current?.removeEventListener('ended', done); setBlocked(false); };
  }, [isActive, setBlocked, videoDone]);

  const setFromClientX = (clientX) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    setSliderX(Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)));
  };
  const onPointerDown = (e) => { if (!videoDone) return; draggingRef.current = true; setFromClientX(e.clientX); };
  useEffect(() => {
    const move = (e) => { if (draggingRef.current) setFromClientX(e.clientX); };
    const up = () => { draggingRef.current = false; };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, [videoDone]);

  return (
    <div className="flex h-full items-center bg-transparent px-6">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div ref={sliderRef} role="slider" tabIndex={0} aria-label="Comparar boceto con imagen final" aria-valuenow={Math.round(sliderX * 100)} aria-valuemin={0} aria-valuemax={100} onPointerDown={onPointerDown} onKeyDown={(e) => { if (e.key === 'ArrowRight') setSliderX((v) => Math.min(1, v + 0.05)); if (e.key === 'ArrowLeft') setSliderX((v) => Math.max(0, v - 0.05)); }} className="relative overflow-hidden rounded-[2.4rem] border border-white/70 bg-ink/8 p-3 shadow-lift focus:outline-none focus:ring-2 focus:ring-clay/30">
          <img src="/boceto-final.png" alt="Imagen final del proyecto" className="aspect-[4/3] w-full rounded-[1.8rem] object-contain bg-white" />
          {videoDone ? (
            <>
              <div className="absolute inset-3 overflow-hidden rounded-[1.8rem]" style={{ width: `calc(${sliderX * 100}% - 0.75rem)` }}>
                <img src="/boceto-poster.jpg" alt="Boceto del proyecto" className="h-full w-full object-contain bg-white" style={{ filter: 'grayscale(0.35) contrast(1.08)' }} />
              </div>
              <div className="absolute bottom-6 left-6 rounded-full bg-ink/65 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">Boceto</div>
              <div className="absolute bottom-6 right-6 rounded-full bg-ink/65 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">Final</div>
              <div className="absolute bottom-3 top-3 w-0.5 bg-clay shadow-lg" style={{ left: `calc(${sliderX * 100}% + 0.75rem)` }}>
                <div className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-clay/30 bg-white text-ink shadow-lift"><span className="text-[10px] font-bold tracking-[0.16em]">DRAG</span></div>
              </div>
            </>
          ) : (
            <video ref={videoRef} src="/boceto-video.mp4" muted playsInline preload="auto" className="absolute inset-3 aspect-[4/3] h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)] rounded-[1.8rem] bg-white object-contain" aria-label="Video de boceto dibujandose" />
          )}
        </div>
        <div className="rounded-[2.4rem] border border-ink/6 bg-pearl/78 p-8 shadow-soft backdrop-blur-sm">
          <LogoMark className="mb-7 h-16 w-16 opacity-35" />
          <h2 className="font-display text-5xl leading-[0.96] tracking-[0.01em] text-ink sm:text-6xl text-wrap-balance">Del boceto al bano.</h2>
          <p className={`mt-6 text-lg leading-8 text-ink/76 transition-all duration-500 ease-out ${s >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>Antes de elegir una pieza, vemos proporcion, paso de luz y continuidad. El resultado no empieza en catalogo, empieza en una imagen que ya encaja.</p>
          {!videoDone && <p className="mt-5 text-sm font-medium text-clay animate-pulse">Reproduciendo boceto...</p>}
        </div>
      </div>
    </div>
  );
}

function Contact({ step, isActive }) {
  const s = isActive ? step : 0;
  const [form, setForm] = useState({ nombre: '', telefono: '', mensaje: '' });
  const whatsappText = encodeURIComponent(`Hola AREA LRMQ, quiero informacion sobre una reforma. Nombre: ${form.nombre}. Telefono: ${form.telefono}. Mensaje: ${form.mensaje}`);

  return (
    <div className="flex h-full items-center bg-transparent px-6">
      <div className="mx-auto grid w-full max-w-6xl items-start gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[2.4rem] border border-ink/6 bg-pearl/82 p-8 shadow-soft backdrop-blur-sm">
          <h2 className="font-display text-5xl leading-[0.96] tracking-[0.01em] text-ink sm:text-6xl text-wrap-balance">Hablemos de tu bano.</h2>
          <p className="mt-4 text-lg leading-8 text-ink/76">Envia medidas, estilo y plazo. Te devolvemos una seleccion inicial.</p>
          <form className="mt-7 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full rounded-2xl border border-ink/10 bg-white/75 px-5 py-3.5 text-ink placeholder:text-graphite/45 focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-clay/20" />
            <input type="tel" placeholder="Telefono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="w-full rounded-2xl border border-ink/10 bg-white/75 px-5 py-3.5 text-ink placeholder:text-graphite/45 focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-clay/20" />
            <textarea placeholder="Medidas, estilo y plazo..." value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} rows={3} className="w-full resize-none rounded-2xl border border-ink/10 bg-white/75 px-5 py-3.5 text-ink placeholder:text-graphite/45 focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-clay/20" />
            <a href={`https://wa.me/${PHONE_INTL}?text=${whatsappText}`} target="_blank" rel="noopener noreferrer" className="block rounded-full bg-ink px-6 py-3.5 text-center font-semibold text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-graphite">Enviar por WhatsApp</a>
          </form>
        </div>
        <div className={`space-y-4 transition-all duration-500 ease-out ${s >= 1 ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0'}`}>
          <div className="rounded-[2.4rem] border border-ink/6 bg-ink p-7 text-white shadow-lift">
            <LogoMark className="mb-6 h-16 w-16" />
            <p className="font-display text-3xl leading-tight">AREA LRMQ Tienda</p>
            <p className="mt-3 text-white/70">{ADDRESS}</p>
          </div>
          <a href={`https://wa.me/${PHONE_INTL}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-white/78 p-4 text-ink shadow-soft transition hover:-translate-y-0.5"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#25D366]/15 text-[#25D366]">WA</span><span className="font-semibold">WhatsApp {PHONE}</span></a>
          <a href={`tel:+34${PHONE}`} className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-white/78 p-4 text-ink shadow-soft transition hover:-translate-y-0.5"><span className="grid h-10 w-10 place-items-center rounded-full bg-ink/8 text-xs font-bold tracking-[0.08em]">TEL</span><span className="font-semibold">Llamar {PHONE}</span></a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-white/78 p-4 text-ink shadow-soft transition hover:-translate-y-0.5"><span className="grid h-10 w-10 place-items-center rounded-full bg-clay/12 text-clay">IG</span><span className="font-semibold">Instagram</span></a>
          <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-[2rem] border border-ink/8 bg-white/78 shadow-soft transition hover:-translate-y-0.5">
            <div className="grid h-32 place-items-center bg-[linear-gradient(135deg,#d8d0c2,#f8f6f1_45%,#b98364_160%)] text-center text-sm font-semibold text-ink/75">Ver ubicacion en Google Maps</div>
          </a>
        </div>
      </div>
    </div>
  );
}

function ChapterDots({ active }) {
  return <div className="fixed right-4 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-3 md:flex">{sectionIds.map((_, index) => <span key={index} className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${index === active ? 'scale-125 bg-ink' : 'bg-ink/20'}`} />)}</div>;
}

function MobileSections() {
  return (
    <>
      <section id="inicio" className="relative flex min-h-[calc(100svh-5rem)] items-center overflow-hidden px-4 sm:px-6"><Inicio step={3} isActive /></section>
      <section id="coleccion" className="min-h-screen px-4 py-20 sm:px-6"><Coleccion step={8} isActive /></section>
      <section id="reformas" className="min-h-screen px-4 py-20 sm:px-6"><Reformas smoothProgress={1} isActive /></section>
      <section id="vision" className="min-h-screen px-4 py-20 sm:px-6"><Vision step={2} isActive setBlocked={() => {}} /></section>
      <section id="contacto" className="min-h-screen px-4 py-20 sm:px-6"><Contact step={1} isActive /></section>
    </>
  );
}

export default function App() {
  const { activeChapter, step, smoothProgress, setBlocked, isDesktop, activeSectionId, navigateTo } = useNarrativeScroll();
  const chapters = [
    <Inicio step={activeChapter === 0 ? step : 0} isActive={activeChapter === 0} />,
    <Coleccion step={activeChapter === 1 ? step : 0} isActive={activeChapter === 1} />,
    <Reformas smoothProgress={activeChapter === 2 ? smoothProgress : 0} isActive={activeChapter === 2} />,
    <Vision step={activeChapter === 3 ? step : 0} isActive={activeChapter === 3} setBlocked={setBlocked} />,
    <Contact step={activeChapter === 4 ? step : 0} isActive={activeChapter === 4} />,
  ];

  return (
    <main className="font-body text-ink" id="contenido">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lift">Saltar al contenido</a>
      <Header activeSectionId={activeSectionId} onNavigate={isDesktop ? (id) => navigateTo(sectionIds.indexOf(id), 0) : undefined} />
      {isDesktop ? (
        <div className="fixed inset-0 hidden overflow-hidden md:block" style={{ height: '100svh' }}>
          <ChapterDots active={activeChapter} />
          <div className="absolute inset-0 transition-transform duration-500 ease-out" style={{ transform: `translateY(${activeChapter * -100}svh)` }}>
            {chapters.map((chapter, index) => <div key={index} className="w-full" style={{ height: '100svh' }}>{chapter}</div>)}
          </div>
        </div>
      ) : <MobileSections />}
    </main>
  );
}
