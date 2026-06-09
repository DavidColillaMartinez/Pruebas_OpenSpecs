import { useEffect, useRef, useState } from 'react';

const navItems = [
  { label: 'Coleccion', href: '#coleccion' },
  { label: 'Metodo', href: '#metodo' },
  { label: 'Vision', href: '#vision' },
  { label: 'Contacto', href: '#contacto' },
];

const categories = [
  {
    title: 'Mamparas a medida',
    label: 'Vidrio templado',
    copy: 'Perfiles ligeros, cierre limpio y soluciones pensadas para ampliar visualmente el bano.',
    tone: 'from-mist/80 to-white',
    image: 'https://images.unsplash.com/photo-1572742482459-e04d6cfdd6f3?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'Cabina de ducha con mampara de vidrio en bano moderno',
  },
  {
    title: 'Platos de ducha',
    label: 'Textura mineral',
    copy: 'Superficies antideslizantes, cortes precisos y acabados sobrios para reformas elegantes.',
    tone: 'from-stonewash to-white',
    image: 'https://images.unsplash.com/photo-1656646523907-97b094c7e63a?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'Suelo de ducha con baldosas blancas de textura mineral',
  },
  {
    title: 'Griferia premium',
    label: 'Lineas puras',
    copy: 'Monomandos, columnas y accesorios con presencia escultural y uso diario confortable.',
    tone: 'from-clay/20 to-white',
    image: 'https://images.unsplash.com/photo-1623111771733-d3ab4d26ce41?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'Grifo monomando plateado con gotas de agua',
  },
  {
    title: 'Accesorios de bano',
    label: 'Detalle final',
    copy: 'Piezas funcionales que completan el proyecto sin romper la armonia visual del espacio.',
    tone: 'from-graphite/10 to-white',
    image: 'https://images.unsplash.com/photo-1608651061499-ff031fbf6645?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'Toalla sobre toallero en bano de estilo minimalista',
  },
];

const benefits = [
  'Asesoria tecnica para reformas reales',
  'Acabados sobrios y faciles de combinar',
  'Soluciones a medida para espacios dificiles',
];

const process = [
  ['01', 'Medimos el espacio', 'Analizamos dimensiones, estilo y uso diario antes de recomendar piezas.'],
  ['02', 'Componemos la solucion', 'Unimos mampara, plato, griferia y accesorios con una linea visual coherente.'],
  ['03', 'Preparamos la instalacion', 'Dejamos el proyecto listo para compra, entrega e instalacion sin improvisar.'],
];

function useReveal() {
  useEffect(() => {
    const targets = document.querySelectorAll('[data-reveal]');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      targets.forEach((target) => target.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);
}

function ProductPanel({ compact = false }) {
  return (
    <div className={`product-panel ${compact ? 'min-h-[320px]' : 'min-h-[520px]'}`} aria-hidden="true">
      <div className="absolute inset-x-8 bottom-8 top-10 rounded-[2rem] bg-gradient-to-br from-white/80 to-mist/70 shadow-glass" />
      <div className="absolute left-8 top-10 h-36 w-24 rounded-b-[2rem] rounded-t-sm border border-white/80 bg-white/55 shadow-lift" />
      <div className="absolute left-20 top-16 h-52 w-32 rounded-b-[2.8rem] rounded-t-sm border border-white/80 bg-gradient-to-b from-white/75 to-mist/85 shadow-soft reveal-slab" />
      <div className="absolute bottom-16 left-12 right-12 h-28 rounded-[2rem] bg-graphite shadow-lift">
        <div className="absolute inset-x-10 top-0 h-2 rounded-full bg-white/50" />
        <div className="absolute bottom-4 left-8 h-8 w-28 rounded-full bg-clay/80" />
      </div>
      <div className="absolute right-10 top-14 h-52 w-24 rounded-full bg-gradient-to-b from-graphite to-ink shadow-lift">
        <div className="mx-auto mt-6 h-28 w-2 rounded-full bg-white/35" />
        <div className="absolute -right-6 top-24 h-3 w-16 rounded-full bg-graphite" />
      </div>
      <div className="absolute right-20 top-10 h-16 w-16 rounded-full border border-white/70 bg-white/40 shadow-soft" />
    </div>
  );
}

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');

  useEffect(() => {
    const sections = ['inicio', 'coleccion', 'metodo', 'vision', 'contacto'];
    const els = sections.map((id) => document.getElementById(id)).filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) setActiveSection(visible[0].target.id);
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 py-4 sm:px-6">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/70 bg-porcelain/80 px-4 py-3 shadow-soft backdrop-blur-xl">
        <a href="#inicio" className="flex items-center gap-3 font-semibold tracking-tight text-ink" aria-label="Bath Studio inicio">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-sm text-white">BS</span>
          <span>Bath Studio</span>
        </a>
        <div className="hidden items-center gap-7 text-sm font-medium md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              className={`transition hover:text-ink ${activeSection === item.href.slice(1) ? 'text-ink' : 'text-graphite/60'}`}
              href={item.href}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full bg-ink md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Cerrar menu' : 'Abrir menu'}
            aria-expanded={mobileOpen}
          >
            <span className={`block h-px w-4 bg-white transition ${mobileOpen ? 'translate-y-[3px] rotate-45' : ''}`} />
            <span className={`block h-px w-4 bg-white transition ${mobileOpen ? '-translate-y-[3px] -rotate-45' : ''}`} />
          </button>
          <a className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-graphite" href="#contacto">
            Pedir asesoria
          </a>
        </div>
      </nav>

      {mobileOpen && (
        <div className="mx-auto mt-3 max-w-7xl rounded-[2rem] border border-white/70 bg-porcelain p-6 shadow-lift md:hidden">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <a
                key={item.href}
                className={`rounded-2xl px-4 py-3 text-lg font-medium transition ${activeSection === item.href.slice(1) ? 'bg-ink/5 text-ink' : 'text-graphite/65'}`}
                href={item.href}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden px-4 pb-20 pt-32 sm:px-6 lg:pt-40">
      <div className="absolute left-1/2 top-0 -z-10 h-[680px] w-[680px] -translate-x-1/2 rounded-full bg-mist/70 blur-3xl" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
        <div data-reveal>
          <p className="mb-6 inline-flex rounded-full border border-graphite/10 bg-white/80 px-4 py-2 text-sm font-semibold text-graphite/70 shadow-soft">
            Mamparas, platos de ducha y griferia
          </p>
          <h1 className="max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] text-ink sm:text-7xl lg:text-8xl text-wrap-balance">
            Banos limpios, precisos y con presencia.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-graphite/75 sm:text-xl">
            Disenamos la primera impresion de tu reforma: vidrio, mineral y metal combinados para elegir mejor cada pieza.
          </p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <a className="rounded-full bg-ink px-7 py-4 text-center font-semibold text-white shadow-lift transition hover:-translate-y-1" href="#coleccion">
              Ver coleccion
            </a>
            <a className="rounded-full border border-ink/10 bg-white/80 px-7 py-4 text-center font-semibold text-ink shadow-soft transition hover:-translate-y-1" href="#vision">
              Inspiracion visual
            </a>
          </div>
        </div>
        <div className="relative" data-reveal>
          <div className="absolute -left-8 top-16 h-40 w-40 rounded-full bg-clay/25 blur-2xl" />
          <div className="absolute -right-6 bottom-20 h-52 w-52 rounded-full bg-mist blur-3xl" />
          <ProductPanel />
        </div>
      </div>
    </section>
  );
}

function CategorySection() {
  return (
    <section id="coleccion" className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end" data-reveal>
          <div>
            <h2 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-6xl text-wrap-balance">Piezas que ordenan el bano por capas.</h2>
          </div>
          <p className="max-w-md text-lg leading-8 text-graphite/70">Cada categoria se presenta como una capa del proyecto: proteccion, superficie, agua y detalle.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {categories.map((category, index) => (
            <article key={category.title} className={`group rounded-[2rem] bg-gradient-to-br ${category.tone} p-5 shadow-soft transition duration-500 hover:-translate-y-1 hover:shadow-lift`} data-reveal style={{ transitionDelay: `${index * 80}ms` }}>
              <div className="mb-8 flex h-52 items-end overflow-hidden rounded-[1.5rem] bg-mist/30 shadow-inner">
                <img
                  src={category.image}
                  alt={category.imageAlt}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  loading="lazy"
                  style={{ background: 'linear-gradient(135deg, #f4f1ec, #d9e4e2)' }}
                />
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-graphite/70">{category.label}</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-ink">{category.title}</h3>
              <p className="mt-4 leading-7 text-graphite/70">{category.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  return (
    <section id="metodo" className="px-4 py-20 sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2.5rem] bg-ink p-8 text-white shadow-lift sm:p-12" data-reveal>
          <h2 className="text-4xl font-semibold tracking-[-0.04em] sm:text-6xl text-wrap-balance">Una compra guiada, no una lista de productos.</h2>
          <div className="mt-10 space-y-4">
            {benefits.map((benefit) => (
              <p key={benefit} className="flex items-start gap-4 text-white/75">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white/20 text-xs">&#10003;</span>
                {benefit}
              </p>
            ))}
          </div>
        </div>
        <div className="grid gap-5" data-reveal>
          {process.map(([number, title, copy], index) => (
            <article key={number} className="flex gap-5 sm:gap-6">
              <div className="flex flex-col items-center">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-clay/15 font-semibold text-clay">{number}</span>
                {index < process.length - 1 && (
                  <span className="mt-2 h-10 w-px bg-clay/20" aria-hidden="true" />
                )}
              </div>
              <div className="pb-5">
                <h3 className="text-2xl font-semibold tracking-[-0.03em] text-ink">{title}</h3>
                <p className="mt-3 text-lg leading-8 text-graphite/70">{copy}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function useScrollVideo({ videoRef, sectionRef, duration = 13.7 }) {
  const [progress, setProgress] = useState(0);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion.current) return;

    let raf;
    const virtualHeight = duration * 150;

    const onScroll = () => {
      if (!sectionRef.current || !videoRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const stickyTop = rect.top + viewportH * 0.15;
      const raw = (viewportH * 0.70 - stickyTop) / (virtualHeight * 0.85);
      const p = Math.max(0, Math.min(1, raw));
      if (!raf) {
        raf = requestAnimationFrame(() => {
          if (videoRef.current && isFinite(p)) {
            videoRef.current.currentTime = p * duration;
            setProgress(p);
          }
          raf = null;
        });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [duration]);

  return { progress, reducedMotion: reducedMotion.current, virtualHeight: duration * 150 };
}

function ReformasSection() {
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const [videoDuration, setVideoDuration] = useState(13.7);

  const onLoadedMetadata = () => {
    if (videoRef.current) setVideoDuration(videoRef.current.duration);
  };

  const { progress, reducedMotion, virtualHeight } = useScrollVideo({
    videoRef,
    sectionRef,
    duration: videoDuration,
  });

  return (
    <section id="reformas" className="px-4 py-20 sm:px-6 bg-mist">
      <div className="mx-auto max-w-7xl">
        <div data-reveal>
          <h2 className="text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl text-wrap-balance">
            Reformas que hablan por si solas
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-graphite/70">
            Asi transformamos este bano con mampara a medida, plato de ducha texturizado y griferia premium.
            Tres semanas de obra condensadas en trece segundos. Desliza para ver la reforma paso a paso.
          </p>
        </div>

        <div className="mt-10" ref={sectionRef} data-reveal>
          <div
            className="rounded-[2rem] overflow-hidden shadow-soft border border-white/70 bg-white/30"
            style={{ minHeight: `${reducedMotion ? 'auto' : virtualHeight}px` }}
          >
            <video
              ref={videoRef}
              src="/reforma-bano.mp4"
              muted
              playsInline
              preload="auto"
              controls={reducedMotion}
              onLoadedMetadata={onLoadedMetadata}
              className={`w-full ${reducedMotion ? '' : 'sticky'}`}
              style={reducedMotion ? {} : { top: '6rem' }}
              aria-label="Video stopmotion de reforma de bano completo"
            />
          </div>

          {!reducedMotion && (
            <div className="mt-4 h-1 w-full rounded-full bg-ink/10">
              <div
                className="h-full rounded-full bg-ink transition-[width] duration-75 ease-linear"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-3 text-sm font-medium text-graphite/60" data-reveal>
          <span className="rounded-full border border-ink/8 bg-white/80 px-4 py-2">Mampara a medida</span>
          <span className="rounded-full border border-ink/8 bg-white/80 px-4 py-2">Plato textura mineral</span>
          <span className="rounded-full border border-ink/8 bg-white/80 px-4 py-2">Griferia linea pura</span>
        </div>
      </div>
    </section>
  );
}

function EditorialSpread() {
  return (
    <section id="vision" className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl rounded-[2.8rem] bg-stonewash p-6 shadow-soft md:p-10 lg:p-14" data-reveal>
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <h2 className="text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl text-wrap-balance">El producto se completa al mirarlo.</h2>
            <p className="mt-5 max-w-md text-lg leading-8 text-graphite/70">
              Cada pieza se entiende mejor cuando forma parte de un conjunto. Vidrio, mineral y metal en una sola imagen, con la continuidad visual que define un proyecto bien resuelto.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 text-sm font-medium text-graphite/60">
              <span className="rounded-full border border-ink/8 bg-white/80 px-4 py-2">Vidrio templado</span>
              <span className="rounded-full border border-ink/8 bg-white/80 px-4 py-2">Textura mineral</span>
              <span className="rounded-full border border-ink/8 bg-white/80 px-4 py-2">Metal cepillado</span>
            </div>
          </div>
          <div className="overflow-hidden rounded-[2.2rem] bg-mist/30 shadow-glass">
            <img
              src="https://images.unsplash.com/photo-1763485956293-873ea83bf095?auto=format&fit=crop&w=800&q=80"
              alt="Bano moderno con cabina de ducha de vidrio y doble lavabo"
              className="h-80 w-full object-cover lg:h-[420px]"
              loading="lazy"
              style={{ background: 'linear-gradient(135deg, #d9e4e2, #f4f1ec)' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contacto" className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl rounded-[3rem] bg-ink p-8 text-white shadow-lift sm:p-12 lg:p-16" data-reveal>
        <div className="grid gap-10 lg:grid-cols-[1fr_0.75fr] lg:items-end">
          <div>
            <h2 className="max-w-4xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl text-wrap-balance">Convierte una reforma fria en una decision visual clara.</h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">Preparamos una propuesta con mampara, plato, griferia y accesorios para que el bano tenga continuidad desde el primer vistazo.</p>
          </div>
          <div className="rounded-[2rem] bg-white p-5 text-ink shadow-glass">
            <p className="text-lg font-semibold">Agenda una asesoria</p>
            <p className="mt-2 leading-7 text-graphite/70">Envia medidas, estilo y plazo. Te devolvemos una seleccion inicial.</p>
            <a href="mailto:hola@bathstudio.local" className="mt-6 block rounded-full bg-clay px-6 py-4 text-center font-semibold text-white shadow-lift transition hover:-translate-y-1">hola@bathstudio.local</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="px-4 pb-10 pt-6 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 rounded-[2rem] border border-ink/5 bg-porcelain px-6 py-5 text-sm text-graphite/55 sm:flex-row">
        <span>Bath Studio &copy; {new Date().getFullYear()}</span>
        <div className="flex gap-6">
          <a href="mailto:hola@bathstudio.local" className="transition hover:text-ink">hola@bathstudio.local</a>
          <a href="#inicio" className="transition hover:text-ink">Inicio</a>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  useReveal();

  return (
    <main className="min-h-screen overflow-x-hidden bg-porcelain font-body text-ink">
      <Header />
      <Hero />
      <CategorySection />
      <Benefits />
      <ReformasSection />
      <EditorialSpread />
      <Contact />
      <Footer />
    </main>
  );
}
