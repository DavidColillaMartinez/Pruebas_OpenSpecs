import { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useNarrativeScroll } from './hooks/useNarrativeScroll';
import { Header } from './components/Header';
import { Inicio } from './sections/desktop/Inicio';
import { Coleccion } from './sections/desktop/Coleccion';
import { Reformas } from './sections/desktop/Reformas';
import { Vision } from './sections/desktop/Vision';
import { Contacto } from './sections/desktop/Contacto';
import { MobileInicio } from './sections/mobile/Inicio';
import { MobileColeccion } from './sections/mobile/Coleccion';
import { MobileReformas } from './sections/mobile/Reformas';
import { MobileVision } from './sections/mobile/Vision';
import { MobileContacto } from './sections/mobile/Contacto';
import { sectionIds, chapterLabels } from './data/copy';
import { BusinessJsonLd } from './components/BusinessJsonLd';
import { CatalogPage } from './features/catalog/pages/CatalogPage';
import { ProductDetailPage } from './features/catalog/pages/ProductDetailPage';
import { NotFoundPage } from './routes/NotFoundPage';
import { ThemeProvider } from './theme/ThemeContext';

function ChapterDots({ active, labels, onNavigate }) {
  const [hovered, setHovered] = useState(null);
  const [focused, setFocused] = useState(null);
  const previewIndex = hovered ?? focused;
  const displayed = previewIndex != null ? labels[previewIndex] : labels[active];
  const transitionKey = previewIndex != null ? `hover-${previewIndex}` : `active-${active}`;
  return (
    <div className="fixed right-4 top-1/2 z-50 hidden -translate-y-1/2 flex-col items-end gap-3 md:flex">
      {sectionIds.map((id, index) => {
        const isActive = index === active;
        const isPreview = previewIndex === index;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onNavigate?.(index)}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered((h) => (h === index ? null : h))}
            onFocus={() => setFocused(index)}
            onBlur={() => setFocused((f) => (f === index ? null : f))}
            aria-label={`Ir a ${labels[index]}`}
            aria-current={isActive ? 'step' : undefined}
            className={`h-2.5 w-2.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 focus-visible:ring-offset-porcelain ${
              isActive || isPreview ? 'scale-125 bg-action' : 'bg-ink/20'
            }`}
          />
        );
      })}
      <span
        key={transitionKey}
        className="mt-2 inline-block text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/50 transition-all duration-300 ease-out animate-side-label"
      >
        {displayed}
      </span>
    </div>
  );
}

function MobileSections({ reducedMotion }) {
  return (
    <div className="bg-transparent text-ink">
      <MobileInicio />
      <MobileColeccion />
      <MobileReformas reducedMotion={reducedMotion} />
      <MobileVision reducedMotion={reducedMotion} />
      <MobileContacto />
    </div>
  );
}

export function LandingPage() {
  const { activeChapter, step, smoothProgress, setBlocked, isDesktop, reducedMotion, activeSectionId, navigateTo } = useNarrativeScroll();
  const [mobileActiveSection, setMobileActiveSection] = useState('inicio');

  useEffect(() => {
    if (isDesktop) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setMobileActiveSection(entry.target.id);
          }
        }
      },
      { threshold: 0, rootMargin: '-40% 0px -40% 0px' }
    );
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [isDesktop]);

  const currentSectionId = isDesktop ? activeSectionId : mobileActiveSection;
  const isInicio = currentSectionId === 'inicio';

  const chapters = [
    <Inicio key="inicio" step={activeChapter === 0 ? step : 0} isActive={activeChapter === 0} />,
    <Coleccion key="coleccion" step={activeChapter === 1 ? step : 0} isActive={activeChapter === 1} />,
    <Reformas key="reformas" smoothProgress={activeChapter === 2 ? smoothProgress : 0} isActive={activeChapter === 2} />,
    <Vision key="vision" step={activeChapter === 3 ? step : 0} isActive={activeChapter === 3} setBlocked={setBlocked} />,
    <Contacto key="contacto" step={activeChapter === 4 ? step : 0} isActive={activeChapter === 4} />,
  ];

  return (
    <main className="font-body text-ink" id="contenido">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-action focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-action-foreground focus:shadow-lift">Saltar al contenido</a>
      <BusinessJsonLd />
      <Header activeSectionId={currentSectionId} onNavigate={isDesktop ? (id) => navigateTo(sectionIds.indexOf(id), 0) : undefined} isDesktop={isDesktop} isInicio={isInicio} />
      {isDesktop ? (
        <div className="fixed inset-0 hidden overflow-hidden md:block" style={{ height: '100svh' }}>
          <ChapterDots active={activeChapter} labels={chapterLabels} onNavigate={(index) => navigateTo(index, 0)} />
          <div className={`absolute inset-0 ease-out ${reducedMotion ? 'transition-none' : 'transition-transform duration-500'}`} style={{ transform: `translateY(${activeChapter * -100}svh)` }}>
            {chapters.map((chapter, index) => <div key={index} className="w-full" style={{ height: '100svh' }}>{chapter}</div>)}
          </div>
        </div>
      ) : <MobileSections reducedMotion={reducedMotion} />}
    </main>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/productos" element={<CatalogPage />} />
          <Route path="/productos/:slug" element={<ProductDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
