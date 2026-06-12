import { useRef, useState, useEffect } from 'react';
import { LogoMark } from '../../components/LogoMark';
import { CompareSlider } from '../../components/CompareSlider';

const visionSeenRef = { current: false };

export function Vision({ step, isActive, setBlocked, cardless }) {
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
    if (visionSeenRef.current) { videoRef.current.pause(); setShowReveal(true); return; }
    if (videoDone) { videoRef.current.pause(); return; }
    setBlocked(true);
    videoRef.current.currentTime = 0;
    setShowReveal(false);
    videoRef.current.play().catch(() => { setVideoDone(true); setBlocked(false); });
    const done = () => { videoRef.current?.pause(); setShowReveal(true); setBlocked(false); visionSeenRef.current = true; };
    videoRef.current.addEventListener('ended', done);
    return () => { videoRef.current?.removeEventListener('ended', done); setBlocked(false); };
  }, [isActive, setBlocked, videoDone]);

  const handleReveal = () => { setVideoDone(true); };

  const handleReplay = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    setShowReveal(false);
    setVideoDone(false);
    videoRef.current.play().catch(() => {});
  };

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
        <CompareSlider
          videoRef={videoRef}
          sliderRef={sliderRef}
          sliderX={sliderX}
          onPointerDown={onPointerDown}
          onKeyDown={(e) => { if (!videoDone) return; if (e.key === 'ArrowRight') setSliderX((v) => Math.min(1, v + 0.05)); if (e.key === 'ArrowLeft') setSliderX((v) => Math.max(0, v - 0.05)); }}
          isCompare={videoDone}
          cardless={cardless}
          videoSrc="/boceto-video.mp4"
          poster="/boceto-poster.webp"
          finalImage="/boceto-final.png"
          finalImageAlt="Imagen final del proyecto"
        >
          {showReveal && !videoDone && (
            <>
              <div className="absolute inset-0 flex items-center justify-center bg-ink/20">
                <button type="button" onClick={handleReveal} className="rounded-full border border-clay/40 bg-white px-8 py-3.5 text-sm font-semibold text-ink shadow-lift transition hover:-translate-y-0.5 hover:shadow-lg">Revelar</button>
              </div>
              <button type="button" onClick={handleReplay} aria-label="Reproducir video de nuevo" className="btn-replay relative isolate grid min-h-[44px] min-w-[44px] place-items-center rounded-full bg-white/90 p-0 text-ink shadow-lift hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 absolute bottom-3 right-3 z-10">
                <span className="replay-orbit" aria-hidden="true" />
                <span className="replay-arrow grid h-5 w-5 place-items-center" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full" aria-hidden="true" focusable="false">
                    <path d="M20 12a8 8 0 1 1-2.34-5.66" />
                    <path d="M20 4v4.5h-4.5" />
                  </svg>
                </span>
              </button>
            </>
          )}
        </CompareSlider>
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
