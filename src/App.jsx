import { useState, useEffect } from 'react';
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

export default function App() {
  const { activeChapter, step, smoothProgress, setBlocked, isDesktop, reducedMotion, activeSectionId, navigateTo } = useNarrativeScroll();
  const [cardless, setCardless] = useState(true);
  const [mobileActiveSection, setMobileActiveSection] = useState('inicio');

  useEffect(() => {
    if (cardless) {
      document.body.style.background = '#ffffff';
    } else {
      document.body.style.background = '';
    }
    return () => { document.body.style.background = ''; };
  }, [cardless]);

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
    <Inicio key="inicio" step={activeChapter === 0 ? step : 0} isActive={activeChapter === 0} cardless={cardless} />,
    <Coleccion key="coleccion" step={activeChapter === 1 ? step : 0} isActive={activeChapter === 1} cardless={cardless} />,
    <Reformas key="reformas" smoothProgress={activeChapter === 2 ? smoothProgress : 0} isActive={activeChapter === 2} cardless={cardless} />,
    <Vision key="vision" step={activeChapter === 3 ? step : 0} isActive={activeChapter === 3} setBlocked={setBlocked} cardless={cardless} />,
    <Contacto key="contacto" step={activeChapter === 4 ? step : 0} isActive={activeChapter === 4} cardless={cardless} />,
  ];

  return (
    <main className="font-body text-ink" id="contenido">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lift">Saltar al contenido</a>
      <Header activeSectionId={currentSectionId} onNavigate={isDesktop ? (id) => navigateTo(sectionIds.indexOf(id), 0) : undefined} cardless={cardless} onToggleCardless={() => setCardless((v) => !v)} isDesktop={isDesktop} isInicio={isInicio} />
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
