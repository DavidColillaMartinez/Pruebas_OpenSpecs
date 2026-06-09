import { useEffect, useRef, useState } from 'react';

const navItems = [
  { label: 'Coleccion', href: '#coleccion' },
  { label: 'Metodo', href: '#metodo' },
  { label: 'Proyectos', href: '#proyectos' },
  { label: 'Contacto', href: '#contacto' },
];

const categories = [
  {
    title: 'Mamparas a medida',
    label: 'Vidrio templado',
    copy: 'Perfiles ligeros, cierre limpio y soluciones pensadas para ampliar visualmente el bano.',
    tone: 'from-mist/80 to-white',
  },
  {
    title: 'Platos de ducha',
    label: 'Textura mineral',
    copy: 'Superficies antideslizantes, cortes precisos y acabados sobrios para reformas elegantes.',
    tone: 'from-stonewash to-white',
  },
  {
    title: 'Griferia premium',
    label: 'Lineas puras',
    copy: 'Monomandos, columnas y accesorios con presencia escultural y uso diario confortable.',
    tone: 'from-clay/20 to-white',
  },
  {
    title: 'Accesorios de bano',
    label: 'Detalle final',
    copy: 'Piezas funcionales que completan el proyecto sin romper la armonia visual del espacio.',
    tone: 'from-graphite/10 to-white',
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
      <div className="absolute left-8 top-10 h-36 w-24 rounded-b-[2rem] rounded-t-sm border border-white/80 bg-white/50 shadow-lift backdrop-blur" />
      <div className="absolute left-20 top-16 h-52 w-32 rounded-b-[2.8rem] rounded-t-sm border border-white/80 bg-gradient-to-b from-white/70 to-mist/80 shadow-soft backdrop-blur reveal-slab" />
      <div className="absolute bottom-16 left-12 right-12 h-28 rounded-[2rem] bg-graphite shadow-lift">
        <div className="absolute inset-x-10 top-0 h-2 rounded-full bg-white/50" />
        <div className="absolute bottom-4 left-8 h-8 w-28 rounded-full bg-clay/80" />
      </div>
      <div className="absolute right-10 top-14 h-52 w-24 rounded-full bg-gradient-to-b from-graphite to-ink shadow-lift">
        <div className="mx-auto mt-6 h-28 w-2 rounded-full bg-white/35" />
        <div className="absolute -right-6 top-24 h-3 w-16 rounded-full bg-graphite" />
      </div>
      <div className="absolute right-20 top-10 h-16 w-16 rounded-full border border-white/70 bg-white/30 shadow-soft backdrop-blur" />
    </div>
  );
}

function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 py-4 sm:px-6">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/70 bg-porcelain/80 px-4 py-3 shadow-soft backdrop-blur-xl">
        <a href="#inicio" className="flex items-center gap-3 font-semibold tracking-tight text-ink" aria-label="Bath Studio inicio">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-sm text-white">BS</span>
          <span>Bath Studio</span>
        </a>
        <div className="hidden items-center gap-7 text-sm font-medium text-graphite/75 md:flex">
          {navItems.map((item) => (
            <a key={item.href} className="transition hover:text-ink" href={item.href}>
              {item.label}
            </a>
          ))}
        </div>
        <a className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-graphite" href="#contacto">
          Pedir asesoria
        </a>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden px-4 pb-20 pt-32 sm:px-6 lg:pt-40">
      <div className="absolute left-1/2 top-0 -z-10 h-[680px] w-[680px] -translate-x-1/2 rounded-full bg-mist/70 blur-3xl" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
        <div data-reveal>
        
          <button installurl="http://localhost:5173"><p className="mb-5 inline-flex rounded-full border border-clay/20 bg-white/70 px-4 py-2 text-sm font-semibold text-clay shadow-soft backdrop-blur">
            Mamparas, platos de ducha y griferia premium
          </p></button>
          <h1 className="max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] text-ink sm:text-7xl lg:text-8xl">
            Banos limpios, precisos y con presencia.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-graphite/72 sm:text-xl">
            Disenamos la primera impresion de tu reforma: vidrio, mineral y metal combinados en una landing visual para elegir mejor cada pieza.
          </p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <a className="rounded-full bg-ink px-7 py-4 text-center font-semibold text-white shadow-lift transition hover:-translate-y-1" href="#coleccion">
              Ver coleccion
            </a>
            <a className="rounded-full border border-ink/10 bg-white/75 px-7 py-4 text-center font-semibold text-ink shadow-soft transition hover:-translate-y-1" href="#proyectos">
              Inspiracion visual
            </a>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3 text-sm text-graphite/70">
            <div className="rounded-3xl bg-white/65 p-4 shadow-soft backdrop-blur"><strong className="block text-2xl text-ink">24h</strong> respuesta</div>
            <div className="rounded-3xl bg-white/65 p-4 shadow-soft backdrop-blur"><strong className="block text-2xl text-ink">+80</strong> acabados</div>
            <div className="rounded-3xl bg-white/65 p-4 shadow-soft backdrop-blur"><strong className="block text-2xl text-ink">3D</strong> enfoque visual</div>
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
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-clay">Coleccion esencial</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-6xl">Piezas que ordenan el bano por capas.</h2>
          </div>
          <p className="max-w-md text-lg leading-8 text-graphite/70">Cada categoria se presenta como una capa del proyecto: proteccion, superficie, agua y detalle.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {categories.map((category, index) => (
            <article key={category.title} className={`group rounded-[2rem] bg-gradient-to-br ${category.tone} p-5 shadow-soft transition duration-500 hover:-translate-y-2 hover:shadow-lift`} data-reveal style={{ transitionDelay: `${index * 70}ms` }}>
              <div className="mb-8 flex h-52 items-end overflow-hidden rounded-[1.5rem] bg-white/55 p-5 shadow-inner">
                <div className="image-complete h-40 w-full rounded-[1.2rem] border border-white/80 bg-gradient-to-br from-white via-mist to-graphite/30 shadow-soft" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-clay">{category.label}</p>
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
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-clay">Metodo</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">Una compra guiada, no una lista de productos.</h2>
          <div className="mt-10 space-y-4">
            {benefits.map((benefit) => (
              <div key={benefit} className="rounded-2xl border border-white/10 bg-white/7 p-4 text-white/82">{benefit}</div>
            ))}
          </div>
        </div>
        <div className="grid gap-5">
          {process.map(([number, title, copy], index) => (
            <article key={number} className="rounded-[2rem] border border-ink/5 bg-white/70 p-6 shadow-soft backdrop-blur transition hover:-translate-y-1 hover:shadow-lift" data-reveal style={{ transitionDelay: `${index * 90}ms` }}>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-clay/15 font-semibold text-clay">{number}</span>
                <div>
                  <h3 className="text-2xl font-semibold tracking-[-0.03em] text-ink">{title}</h3>
                  <p className="mt-3 text-lg leading-8 text-graphite/70">{copy}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Showcase() {
  const [active, setActive] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    timer.current = window.setInterval(() => setActive((value) => (value + 1) % categories.length), 2600);
    return () => window.clearInterval(timer.current);
  }, []);

  return (
    <section id="proyectos" className="px-4 py-20 sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-8 rounded-[2.8rem] bg-stonewash p-5 shadow-soft md:p-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="overflow-hidden rounded-[2.2rem] bg-porcelain p-6 shadow-glass" data-reveal>
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-clay">Imagen dinamica</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl">El producto se completa al mirarlo.</h2>
            </div>
          </div>
          <div className="dynamic-image rounded-[2rem] bg-gradient-to-br from-white via-mist/80 to-clay/25 p-7 shadow-soft">
            <ProductPanel compact />
          </div>
        </div>
        <div className="flex flex-col justify-center gap-4" data-reveal>
          {categories.map((category, index) => (
            <button key={category.title} type="button" onClick={() => setActive(index)} className={`rounded-[1.6rem] border p-5 text-left shadow-soft transition ${active === index ? 'border-clay/35 bg-white text-ink' : 'border-white/60 bg-white/45 text-graphite/65 hover:bg-white/80'}`}>
              <span className="text-sm font-semibold uppercase tracking-[0.22em] text-clay">{category.label}</span>
              <strong className="mt-2 block text-2xl tracking-[-0.03em]">{category.title}</strong>
              <span className="mt-2 block leading-7">{category.copy}</span>
            </button>
          ))}
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
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-clay">Proyecto listo</p>
            <h2 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">Convierte una reforma fria en una decision visual clara.</h2>
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

export default function App() {
  useReveal();

  return (
    <main className="min-h-screen overflow-x-hidden bg-porcelain font-body text-ink">
      <Header />
      <Hero />
      <CategorySection />
      <Benefits />
      <Showcase />
      <Contact />
    </main>
  );
}
