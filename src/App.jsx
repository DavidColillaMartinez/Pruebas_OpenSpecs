import { useEffect, useRef, useState, useCallback } from 'react';

/* ── Data ── */

const navItems = [
  { label: 'Coleccion', href: '#coleccion' },
  { label: 'Reformas', href: '#reformas' },
  { label: 'Vision', href: '#vision' },
  { label: 'Contacto', href: '#contacto' },
];

const categories = [
  { title: 'Mamparas a medida', label: 'Vidrio templado', copy: 'Perfiles ligeros y cierre limpio para ampliar visualmente el bano.', image: 'https://images.unsplash.com/photo-1572742482459-e04d6cfdd6f3?auto=format&fit=crop&w=400&q=80', imageAlt: 'Cabina de ducha con mampara de vidrio' },
  { title: 'Platos de ducha', label: 'Textura mineral', copy: 'Superficies antideslizantes con cortes precisos y acabados sobrios.', image: 'https://images.unsplash.com/photo-1656646523907-97b094c7e63a?auto=format&fit=crop&w=400&q=80', imageAlt: 'Suelo de ducha con baldosas blancas' },
  { title: 'Griferia premium', label: 'Lineas puras', copy: 'Monomandos con presencia escultural para uso diario confortable.', image: 'https://images.unsplash.com/photo-1623111771733-d3ab4d26ce41?auto=format&fit=crop&w=400&q=80', imageAlt: 'Grifo monomando plateado' },
  { title: 'Accesorios de bano', label: 'Detalle final', copy: 'Piezas funcionales que completan el proyecto sin romper la armonia.', image: 'https://images.unsplash.com/photo-1608651061499-ff031fbf6645?auto=format&fit=crop&w=400&q=80', imageAlt: 'Toallero en bano minimalista' },
];

const methodSteps = [
  { title: 'Medimos el espacio', copy: 'Analizamos dimensiones, estilo y uso diario antes de recomendar piezas.' },
  { title: 'Componemos la solucion', copy: 'Unimos mampara, plato, griferia y accesorios con una linea visual coherente.' },
  { title: 'Preparamos la instalacion', copy: 'Dejamos el proyecto listo para compra, entrega e instalacion sin improvisar.' },
];

const TOTAL_CHAPTERS = 5;

/* ── Scroll controller ── */

function useNarrativeScroll() {
  const [activeChapter, setActiveChapter] = useState(0);
  const [step, setStep] = useState(0);
  const [smoothProgress, setSmoothProgress] = useState(0);
  const activeRef = useRef(0);
  const stepRef = useRef(0);
  const blockedRef = useRef(false);
  const cooldownRef = useRef(false);
  const accumulatedRef = useRef(0);
  const targetRef = useRef(0);
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : false);

  const chapterSteps = [3, 8, 0, 2, 0];
  const chapterType = ['step', 'step', 'continuous', 'step', 'step'];

  useEffect(() => {
    const m = window.matchMedia('(min-width: 768px)');
    setIsDesktop(m.matches);
    const h = (e) => setIsDesktop(e.matches);
    m.addEventListener('change', h);
    return () => m.removeEventListener('change', h);
  }, []);

  const setBlocked = useCallback((b) => { blockedRef.current = b; }, []);

  const navigateTo = useCallback((index) => {
    if (index < 0 || index >= TOTAL_CHAPTERS) return;
    activeRef.current = index;
    stepRef.current = 0;
    accumulatedRef.current = 0;
    targetRef.current = 0;
    setActiveChapter(index);
    setStep(0);
    setSmoothProgress(0);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    let raf;
    const loop = () => {
      const t = targetRef.current;
      setSmoothProgress((prev) => {
        const n = prev + (t - prev) * 0.18;
        return Math.abs(n - t) < 0.001 ? t : n;
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
      const dir = e.deltaY > 0 ? 1 : -1;
      const ci = activeRef.current;

      if (chapterType[ci] === 'step') {
        const maxStep = chapterSteps[ci];
        const s = stepRef.current + dir;
        if (s < 0 && ci > 0) {
          activeRef.current = ci - 1;
          stepRef.current = chapterSteps[ci - 1];
          setActiveChapter(ci - 1);
          setStep(chapterSteps[ci - 1]);
        } else if (s > maxStep && ci < TOTAL_CHAPTERS - 1) {
          activeRef.current = ci + 1;
          stepRef.current = 0;
          setActiveChapter(ci + 1);
          setStep(0);
        } else if (s >= 0 && s <= maxStep) {
          stepRef.current = s;
          setStep(s);
          cooldownRef.current = true;
          setTimeout(() => { cooldownRef.current = false; }, 420);
        }
      } else {
        accumulatedRef.current = Math.max(0, accumulatedRef.current + e.deltaY * 0.6);
        const raw = accumulatedRef.current / 2000;
        if (raw >= 0.98 && dir > 0 && ci < TOTAL_CHAPTERS - 1) {
          activeRef.current = ci + 1;
          stepRef.current = 0;
          accumulatedRef.current = 0;
          targetRef.current = 0;
          setActiveChapter(ci + 1);
          setStep(0);
          setSmoothProgress(0);
        } else if (accumulatedRef.current <= 20 && dir < 0 && ci > 0) {
          activeRef.current = ci - 1;
          stepRef.current = chapterSteps[ci - 1];
          accumulatedRef.current = 1900;
          targetRef.current = 0.95;
          setActiveChapter(ci - 1);
          setStep(chapterSteps[ci - 1]);
        } else {
          targetRef.current = Math.min(0.999, raw);
        }
      }
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [isDesktop]);

  useEffect(() => {
    if (!isDesktop) return;
    const onKey = (e) => {
      if (e.key !== 'ArrowDown' && e.key !== 'PageDown' && e.key !== 'ArrowUp' && e.key !== 'PageUp') return;
      e.preventDefault();
      const dir = (e.key === 'ArrowDown' || e.key === 'PageDown') ? 1 : -1;
      const ci = activeRef.current;
      if (chapterType[ci] === 'step') {
        const s = stepRef.current + dir;
        if (s < 0 && ci > 0) { navigateTo(ci - 1); setStep(chapterSteps[ci - 1]); }
        else if (s > chapterSteps[ci] && ci < TOTAL_CHAPTERS - 1) { navigateTo(ci + 1); }
        else if (s >= 0 && s <= chapterSteps[ci]) { stepRef.current = s; setStep(s); }
      } else {
        if (dir > 0 && ci < TOTAL_CHAPTERS - 1) navigateTo(ci + 1);
        if (dir < 0 && ci > 0) navigateTo(ci - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isDesktop, navigateTo]);

  const activeSectionId = ['inicio', 'coleccion', 'reformas', 'vision', 'contacto'][activeChapter];
  return { activeChapter, step, smoothProgress, navigateTo, setBlocked, isDesktop, activeSectionId };
}

/* ── Header ── */

function Header({ activeSectionId }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setMobileOpen(false); };
    if (mobileOpen) { window.addEventListener('keydown', onKey); document.body.style.overflow = 'hidden'; }
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [mobileOpen]);
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 py-4 sm:px-6">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/70 bg-porcelain/80 px-4 py-3 shadow-lift backdrop-blur-xl">
        <a href="#inicio" className="flex items-center gap-3 font-semibold tracking-tight text-ink" aria-label="AREA Inicio" onClick={(e) => { e.preventDefault(); }}>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-sm text-white">AR</span>
          <span className="text-lg tracking-[-0.03em]">AREA</span>
        </a>
        <div className="hidden items-center gap-7 text-sm font-medium md:flex">{navItems.map((x) => <a key={x.href} className={`transition hover:text-ink ${activeSectionId === x.href.slice(1) ? 'text-ink' : 'text-graphite/60'}`} href={x.href}>{x.label}</a>)}</div>
        <div className="flex items-center gap-3">
          <button className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full bg-ink md:hidden" onClick={() => setMobileOpen((v) => !v)} aria-label="Menu" aria-expanded={mobileOpen}>
            <span className={`block h-px w-4 bg-white transition ${mobileOpen ? 'translate-y-[3px] rotate-45' : ''}`} />
            <span className={`block h-px w-4 bg-white transition ${mobileOpen ? '-translate-y-[3px] -rotate-45' : ''}`} />
          </button>
          <a className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-graphite" href="#contacto">Pedir asesoria</a>
        </div>
      </nav>
      {mobileOpen && (<><div className="fixed inset-0 z-40 bg-ink/20 md:hidden" onClick={() => setMobileOpen(false)} aria-hidden="true" /><div className="relative z-50 mx-auto mt-3 max-w-7xl rounded-[2rem] border border-white/70 bg-porcelain p-6 shadow-lift md:hidden"><div className="flex flex-col gap-3">{navItems.map((x) => <a key={x.href} className={`rounded-2xl px-4 py-3 text-lg font-medium transition ${activeSectionId === x.href.slice(1) ? 'bg-ink/5 text-ink' : 'text-graphite/65'}`} href={x.href} onClick={() => setMobileOpen(false)}>{x.label}</a>)}</div></div></>)}
    </header>
  );
}

/* ── Chapters ── */

function Inicio({ step, isActive }) {
  const s = isActive ? step : 0;
  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden">
      <img src="https://images.unsplash.com/photo-1763485956293-873ea83bf095?auto=format&fit=crop&w=2000&q=80" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" style={{background:'linear-gradient(135deg,#2e3134,#151515)'}} onError={(e)=>{e.target.style.display='none'}} />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/45 via-ink/35 to-ink/65" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6">
        <h1 className="display-font text-5xl font-semibold leading-[0.92] tracking-[-0.04em] text-white sm:text-7xl lg:text-8xl text-wrap-balance">AREA</h1>
        <p className="mt-4 text-lg font-medium tracking-wide text-white/80 sm:text-xl">Tienda</p>
        <p className="mt-3 text-sm font-medium tracking-[0.18em] text-white/45 uppercase">Banos elegidos por capas</p>
      </div>

      <div className={`absolute bottom-6 left-1/2 z-10 -translate-x-1/2 transition-opacity duration-500 ${s >= 1 ? 'opacity-0' : 'opacity-100'}`}>
        <span className="block h-8 w-px bg-white/30 mx-auto" />
        <span className="mt-2 block text-xs tracking-[0.2em] text-white/35 uppercase">Desliza</span>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-14 sm:px-6">
        <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-3">
          {methodSteps.map((m, i) => (
            <div key={m.title} className={`rounded-2xl border border-white/12 bg-white/6 p-5 backdrop-blur-sm transition-all duration-500 ease-out ${
              s > i ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-14 blur-[2px]'
            }`}>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white/12 text-sm font-semibold text-white">{i + 1}</span>
              <h3 className="mt-3 text-base font-semibold text-white">{m.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{m.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Coleccion({ step, isActive }) {
  const s = isActive ? step : 0;
  return (
    <div className="flex h-full flex-col justify-center bg-transparent px-4 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <h2 className="mb-10 text-center text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl text-wrap-balance">Piezas que ordenan el bano</h2>
        <div className="grid gap-5 md:grid-cols-2">
          {categories.map((item, i) => {
            const textStep = i * 2 + 1;
            const imgStep = i * 2 + 2;
            return (
              <div key={item.title} className="flex gap-4 items-start">
                <div className={`shrink-0 w-32 h-24 rounded-xl overflow-hidden shadow-soft transition-all duration-500 ease-out ${
                  s >= imgStep ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-10 blur-[1px]'
                }`}>
                  <img src={item.image} alt={item.imageAlt} className="w-full h-full object-cover" loading="lazy" style={{background:'linear-gradient(135deg,#f4f1ec,#d9e4e2)'}} />
                </div>
                <div className={`min-w-0 transition-all duration-500 ease-out ${
                  s >= textStep ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-6 blur-[1px]'
                }`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">{item.label}</p>
                  <h3 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-ink">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-graphite/80">{item.copy}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Reformas({ smoothProgress, isActive }) {
  const videoRef = useRef(null);
  const p = isActive ? smoothProgress : 0;
  const [duration, setDuration] = useState(13.7);
  const videoProgress = Math.min(p / 0.88, 1);

  useEffect(() => {
    if (!videoRef.current) return;
    if (!isActive) { videoRef.current.pause(); return; }
    videoRef.current.currentTime = videoProgress * duration;
  }, [videoProgress, isActive, duration]);

  return (
    <div className="flex h-full items-center bg-transparent px-4 sm:px-6">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="relative rounded-[2rem] overflow-hidden shadow-soft border border-white/70 bg-white/30">
            <video ref={videoRef} src="/reforma-bano.mp4" muted playsInline preload="auto" onLoadedMetadata={() => { if (videoRef.current) setDuration(videoRef.current.duration); }} className="w-full" aria-label="Video stopmotion de reforma de bano completo" />
          </div>
          <div className="space-y-5">
            <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Proyecto</p><h2 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl text-wrap-balance">Reformas que hablan</h2></div>
            <div className="space-y-3 text-base leading-relaxed text-graphite/80">
              {[['L','Bano principal, Valencia'],['D','21 dias de obra. Entrega puntual.'],['A','Mampara fija a medida, plato mineral enrasado y griferia mural.'],['R','Satisfaccion: 9.6 / 10. El vidrio libera luz, el plato continuo reduce cortes visuales.']].map(([k,v])=>(<p key={k} className="flex items-center gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-clay/10 text-xs font-semibold text-clay">{k}</span><span>{v}</span></p>))}
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="rounded-full border border-ink/8 bg-white/80 px-3 py-1.5 text-xs font-medium text-graphite/55">Mampara a medida</span>
              <span className="rounded-full border border-ink/8 bg-white/80 px-3 py-1.5 text-xs font-medium text-graphite/55">Plato textura mineral</span>
              <span className="rounded-full border border-ink/8 bg-white/80 px-3 py-1.5 text-xs font-medium text-graphite/55">Griferia mural</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-ink/8">
              <div className="h-full rounded-full bg-ink transition-[width] duration-150 ease-linear" style={{width:`${p*100}%`}} />
            </div>
            <p className="text-xs font-medium tracking-wider text-graphite/35 uppercase text-center">{p < 0.02 ? 'Desliza para avanzar la reforma' : `Progreso ${Math.round(p*100)}%`}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Vision({ step, isActive, setBlocked }) {
  const videoRef = useRef(null);
  const [videoDone, setVideoDone] = useState(false);
  const [sliderX, setSliderX] = useState(0.5);
  const sliderRef = useRef(null);
  const dragRef = useRef(false);
  const s = isActive ? step : 0;

  useEffect(() => {
    if (!isActive) { if (videoRef.current) videoRef.current.pause(); return; }
    const v = videoRef.current;
    if (!v || videoDone) return;
    setBlocked(true);
    v.currentTime = 0;
    v.play().catch(() => { setBlocked(false); setVideoDone(true); });
    const onEnd = () => { setVideoDone(true); setBlocked(false); };
    v.addEventListener('ended', onEnd);
    return () => { v.removeEventListener('ended', onEnd); setBlocked(false); };
  }, [isActive, videoDone, setBlocked]);

  const onPointerDown = (e) => {
    if (!videoDone) return;
    dragRef.current = true;
    if (sliderRef.current) { const r = sliderRef.current.getBoundingClientRect(); setSliderX(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))); }
  };
  useEffect(() => {
    const move = (e) => { if (dragRef.current && sliderRef.current) { const r = sliderRef.current.getBoundingClientRect(); setSliderX(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))); } };
    const up = () => { dragRef.current = false; };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, [videoDone]);
  const onKey = (e) => { if (e.key === 'ArrowRight') setSliderX((v) => Math.min(1, v + 0.05)); if (e.key === 'ArrowLeft') setSliderX((v) => Math.max(0, v - 0.05)); };

  return (
    <div className="flex h-full items-center bg-transparent px-4 sm:px-6">
      <div className="mx-auto grid w-full max-w-6xl gap-10 items-center lg:grid-cols-[1fr_0.85fr]">
        <div className="relative rounded-[2rem] overflow-hidden shadow-soft bg-ink/5" ref={sliderRef} role="slider" aria-label="Comparar boceto con imagen final" aria-valuenow={Math.round(sliderX*100)} aria-valuemin={0} aria-valuemax={100} tabIndex={0} onKeyDown={onKey} onPointerDown={onPointerDown}>
          <img src="/boceto-final.png" alt="Imagen final del proyecto"
            className="w-full aspect-[4/3] object-cover" style={{background:'linear-gradient(135deg,#d9e4e2,#f4f1ec)'}} />

          {videoDone && (
            <div className="absolute inset-0 overflow-hidden" style={{width:`${sliderX*100}%`}}>
              <div className="absolute inset-0" style={{width:sliderRef.current ? sliderRef.current.getBoundingClientRect().width + 'px' : '100vw'}}>
                <img src="/boceto-poster.jpg" alt="Boceto del proyecto"
                  className="w-full aspect-[4/3] object-cover"
                  style={{filter:'grayscale(0.5) contrast(1.08) brightness(0.95)'}} />
              </div>
            </div>
          )}

          {!videoDone && (
            <video ref={videoRef} src="/boceto-video.mp4" muted playsInline preload="auto"
              className="absolute inset-0 w-full aspect-[4/3] object-cover" aria-label="Video de boceto dibujandose" />
          )}

          {videoDone && (
            <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg cursor-ew-resize" style={{left:`${sliderX*100}%`}}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white shadow-lift flex items-center justify-center border border-ink/5">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 1.5L7.5 6L3 10.5" stroke="#151515" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
          )}

          {videoDone && (
            <>
              <span className="absolute bottom-3 left-4 text-xs font-semibold text-white/80 bg-ink/50 px-2.5 py-1 rounded-full backdrop-blur-sm pointer-events-none">Boceto</span>
              <span className="absolute bottom-3 right-4 text-xs font-semibold text-white/80 bg-ink/50 px-2.5 py-1 rounded-full backdrop-blur-sm pointer-events-none">Final</span>
            </>
          )}
        </div>

        <div>
          <h2 className="text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl text-wrap-balance">Del trazo a la materia</h2>
          <p className={`mt-5 text-lg leading-8 text-graphite/80 transition-all duration-500 ease-out ${s >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            Antes de elegir una pieza, vemos la proporcion. Despues ajustamos vidrio, superficie y metal. El bano final no empieza en el catalogo. Empieza en una imagen que ya tiene sentido.
          </p>
          {!videoDone && (
            <p className="mt-4 text-sm font-medium text-clay animate-pulse">Reproduciendo boceto...</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Contact({ step, isActive }) {
  const s = isActive ? step : 0;
  const [form, setForm] = useState({ nombre: '', telefono: '', mensaje: '' });

  return (
    <div className="flex h-full items-center bg-transparent px-4 sm:px-6">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-start">
        <div className={`transition-all duration-500 ease-out ${s >= 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h2 className="text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl text-wrap-balance">Elige con sentido</h2>
          <p className="mt-4 text-lg leading-8 text-graphite/80">Cuentanos tu proyecto y te preparamos una propuesta visual a medida.</p>
          <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); }}>
            <input type="text" placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} className="w-full rounded-2xl border border-ink/10 bg-white/70 px-5 py-3.5 text-ink placeholder:text-graphite/35 focus:outline-none focus:border-ink/30 focus:ring-2 focus:ring-ink/10 transition" />
            <input type="tel" placeholder="Telefono" value={form.telefono} onChange={(e) => setForm({...form, telefono: e.target.value})} className="w-full rounded-2xl border border-ink/10 bg-white/70 px-5 py-3.5 text-ink placeholder:text-graphite/35 focus:outline-none focus:border-ink/30 focus:ring-2 focus:ring-ink/10 transition" />
            <textarea placeholder="Medidas, estilo y plazo..." value={form.mensaje} onChange={(e) => setForm({...form, mensaje: e.target.value})} rows={3} className="w-full rounded-2xl border border-ink/10 bg-white/70 px-5 py-3.5 text-ink placeholder:text-graphite/35 focus:outline-none focus:border-ink/30 focus:ring-2 focus:ring-ink/10 transition resize-none" />
            <button type="submit" className="w-full rounded-full bg-ink px-6 py-3.5 font-semibold text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-graphite">Enviar consulta</button>
          </form>
        </div>

        <div className={`space-y-4 transition-all duration-500 ease-out delay-150 ${s >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay mb-3">Contacto directo</p>
          <a href="https://wa.me/34600000000" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-white/70 p-4 transition hover:shadow-soft hover:-translate-y-0.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#25D366]/15 text-[#25D366]"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></span>
            <span className="font-medium text-ink">WhatsApp</span>
          </a>
          <a href="tel:+34600000000" className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-white/70 p-4 transition hover:shadow-soft hover:-translate-y-0.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink/8 text-ink"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg></span>
            <span className="font-medium text-ink">Llamar</span>
          </a>
          <a href="https://maps.google.com/?q=Valencia" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-white/70 p-4 transition hover:shadow-soft hover:-translate-y-0.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-clay/12 text-clay"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></span>
            <span className="font-medium text-ink">Ver ubicacion</span>
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Stage ── */

function ChapterDots({ total, active }) {
  return <div className="fixed right-4 top-1/2 z-50 -translate-y-1/2 hidden md:flex flex-col gap-3">{Array.from({length:total},(_,i)=>(<button key={i} className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${i===active?'bg-ink scale-125':'bg-ink/20 hover:bg-ink/40'}`} aria-label={`Capitulo ${i+1}`} />))}</div>;
}

/* ── App ── */

export default function App() {
  const n = useNarrativeScroll();
  const { activeChapter, step, smoothProgress, setBlocked, isDesktop, activeSectionId } = n;

  if (!isDesktop) {
    const Ms = [
      <section id="inicio" key="inicio" className="relative flex min-h-[calc(100svh-5rem)] items-center overflow-hidden bg-porcelain px-4 sm:px-6">
        <img src="https://images.unsplash.com/photo-1763485956293-873ea83bf095?auto=format&fit=crop&w=2000&q=80" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" style={{background:'linear-gradient(135deg,#2e3134,#151515)'}} onError={(e)=>{e.target.style.display='none'}} />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/45 via-ink/35 to-ink/65" />
        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6">
          <h1 className="display-font text-5xl font-semibold leading-[0.92] tracking-[-0.04em] text-white sm:text-7xl text-wrap-balance">AREA</h1>
          <p className="mt-4 text-lg font-medium tracking-wide text-white/80 sm:text-xl">Tienda</p>
          <p className="mt-3 text-sm font-medium tracking-[0.18em] text-white/45 uppercase">Banos elegidos por capas</p>
        </div>
        <div className="absolute inset-x-0 bottom-12 z-20 px-4 sm:px-6">
          <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-3">{methodSteps.map((m,i)=>(<div key={m.title} className="rounded-2xl border border-white/12 bg-white/6 p-5 backdrop-blur-sm"><span className="grid h-8 w-8 place-items-center rounded-full bg-white/12 text-sm font-semibold text-white">{i+1}</span><h3 className="mt-3 text-base font-semibold text-white">{m.title}</h3><p className="mt-2 text-sm leading-relaxed text-white/60">{m.copy}</p></div>))}</div>
        </div>
      </section>,
      <section id="coleccion" key="coleccion" className="px-4 py-20 sm:px-6 bg-porcelain">
        <div className="mx-auto max-w-5xl"><h2 className="mb-10 text-center text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl text-wrap-balance">Piezas que ordenan el bano</h2><div className="grid gap-5 md:grid-cols-2">{categories.map((item)=>(<div key={item.title} className="flex gap-4 items-start"><div className="shrink-0 w-32 h-24 rounded-xl overflow-hidden shadow-soft"><img src={item.image} alt={item.imageAlt} className="w-full h-full object-cover" loading="lazy" style={{background:'linear-gradient(135deg,#f4f1ec,#d9e4e2)'}} /></div><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">{item.label}</p><h3 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-ink">{item.title}</h3><p className="mt-1 text-sm leading-relaxed text-graphite/80">{item.copy}</p></div></div>))}</div></div>
      </section>,
      <section id="reformas" key="reformas" className="px-4 py-20 sm:px-6 bg-stonewash"><div className="mx-auto max-w-7xl"><div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start"><div className="relative rounded-[2rem] overflow-hidden shadow-soft border border-white/70 bg-white/30"><video src="/reforma-bano.mp4" muted playsInline controls preload="auto" className="w-full" aria-label="Video stopmotion de reforma" /></div><div className="space-y-5"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Proyecto</p><h2 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl text-wrap-balance">Reformas que hablan</h2></div><div className="space-y-3 text-base leading-relaxed text-graphite/80">{[['L','Bano principal, Valencia'],['D','21 dias de obra. Entrega puntual.'],['A','Mampara fija a medida, plato mineral enrasado y griferia mural.'],['R','Satisfaccion: 9.6 / 10.']].map(([k,v])=>(<p key={k} className="flex items-center gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-clay/10 text-xs font-semibold text-clay">{k}</span><span>{v}</span></p>))}</div><div className="flex flex-wrap gap-2 pt-2"><span className="rounded-full border border-ink/8 bg-white/80 px-3 py-1.5 text-xs font-medium text-graphite/55">Mampara a medida</span><span className="rounded-full border border-ink/8 bg-white/80 px-3 py-1.5 text-xs font-medium text-graphite/55">Plato textura mineral</span><span className="rounded-full border border-ink/8 bg-white/80 px-3 py-1.5 text-xs font-medium text-graphite/55">Griferia mural</span></div></div></div></div></section>,
      <section id="vision" key="vision" className="px-4 py-20 sm:px-6 bg-mist"><div className="mx-auto max-w-5xl"><h2 className="mb-10 text-center text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl text-wrap-balance">Del trazo a la materia</h2><div className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] shadow-soft bg-ink/5"><img src="/boceto-final.png" alt="Imagen final" className="w-full aspect-[4/3] object-cover" style={{background:'linear-gradient(135deg,#d9e4e2,#f4f1ec)'}} /></div><p className="mx-auto mt-8 max-w-2xl text-center text-lg leading-8 text-graphite/80">Antes de elegir una pieza, vemos la proporcion. El bano final no empieza en el catalogo. Empieza en una imagen que ya tiene sentido.</p></div></section>,
      <section id="contacto" key="contacto" className="px-4 py-20 sm:px-6"><div className="mx-auto max-w-5xl"><h2 className="text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl text-wrap-balance">Elige con sentido</h2><p className="mt-4 text-lg leading-8 text-graphite/80">Cuentanos tu proyecto y te preparamos una propuesta visual a medida.</p><form className="mt-6 space-y-4" onSubmit={(e)=>{e.preventDefault()}}><input type="text" placeholder="Nombre" className="w-full rounded-2xl border border-ink/10 bg-white/70 px-5 py-3.5 text-ink placeholder:text-graphite/35 focus:outline-none focus:border-ink/30 focus:ring-2 focus:ring-ink/10 transition" /><input type="tel" placeholder="Telefono" className="w-full rounded-2xl border border-ink/10 bg-white/70 px-5 py-3.5 text-ink placeholder:text-graphite/35 focus:outline-none focus:border-ink/30 focus:ring-2 focus:ring-ink/10 transition" /><textarea placeholder="Medidas, estilo y plazo..." rows={3} className="w-full rounded-2xl border border-ink/10 bg-white/70 px-5 py-3.5 text-ink placeholder:text-graphite/35 focus:outline-none focus:border-ink/30 focus:ring-2 focus:ring-ink/10 transition resize-none" /><button type="submit" className="w-full rounded-full bg-ink px-6 py-3.5 font-semibold text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-graphite">Enviar consulta</button></form><div className="mt-6 space-y-3"><a href="https://wa.me/34600000000" className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-white/70 p-4 transition hover:shadow-soft"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#25D366]/15 text-[#25D366]"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></span><span className="font-medium text-ink">WhatsApp</span></a><a href="tel:+34600000000" className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-white/70 p-4 transition hover:shadow-soft"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink/8 text-ink"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg></span><span className="font-medium text-ink">Llamar</span></a><a href="https://maps.google.com/?q=Valencia" className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-white/70 p-4 transition hover:shadow-soft"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-clay/12 text-clay"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></span><span className="font-medium text-ink">Ver ubicacion</span></a></div></div></section>,
      <footer key="footer" className="px-4 pb-10 pt-6 sm:px-6"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 rounded-[2rem] border border-ink/5 bg-porcelain px-6 py-5 text-sm text-graphite/55 sm:flex-row"><span>AREA &copy; {new Date().getFullYear()}</span><div className="flex gap-6"><a href="mailto:hola@bathstudio.local" className="transition hover:text-ink">hola@bathstudio.local</a><a href="#inicio" className="transition hover:text-ink">Inicio</a></div></div></footer>,
    ];
    return <main className="min-h-screen overflow-x-hidden font-body text-ink" id="contenido"><a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lift">Saltar al contenido</a><Header activeSectionId={activeSectionId} />{Ms}</main>;
  }

  return (
    <main className="overflow-hidden font-body text-ink" id="contenido" style={{background:'#f8f6f1'}}>
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lift">Saltar al contenido</a>
      <Header activeSectionId={activeSectionId} />
      <div className="hidden md:block fixed inset-0" style={{height:'100svh'}}>
        <ChapterDots total={TOTAL_CHAPTERS} active={activeChapter} />
        <div className="absolute inset-0 transition-transform duration-500 ease-out" style={{transform:`translateY(${activeChapter*-100}svh)`}}>
          {[
            <Inicio step={activeChapter===0?step:0} isActive={activeChapter===0} />,
            <Coleccion step={activeChapter===1?step:0} isActive={activeChapter===1} />,
            <Reformas smoothProgress={activeChapter===2?smoothProgress:0} isActive={activeChapter===2} />,
            <Vision step={activeChapter===3?step:0} isActive={activeChapter===3} setBlocked={setBlocked} />,
            <Contact step={activeChapter===4?step:0} isActive={activeChapter===4} />,
          ].map((c,i)=>(<div key={i} className="w-full" style={{height:'100svh'}}>{c}</div>))}
        </div>
      </div>
    </main>
  );
}
