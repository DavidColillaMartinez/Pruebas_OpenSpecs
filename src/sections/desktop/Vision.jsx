import { useRef, useState, useEffect } from 'react';
import { LogoMark } from '../../components/LogoMark';
import { CompareSlider } from '../../components/CompareSlider';

const visionSeenRef = { current: false };

export function Vision({ step, isActive, setBlocked }) {
  const videoRef = useRef(null);
  const sliderRef = useRef(null);
  const draggingRef = useRef(false);
  const activeRef = useRef(false);
  const [videoDone, setVideoDone] = useState(false);
  const [sliderX, setSliderX] = useState(0.5);
  const s = isActive ? step : 0;

  const finishPlayback = () => {
    if (!activeRef.current) return;
    videoRef.current?.pause();
    setVideoDone(true);
    setBlocked(false);
    visionSeenRef.current = true;
  };

  useEffect(() => {
    activeRef.current = isActive;
    if (!isActive) {
      videoRef.current?.pause();
      setBlocked(false);
      return () => { activeRef.current = false; videoRef.current?.pause(); setBlocked(false); };
    }
    if (!videoRef.current) return;
    const video = videoRef.current;
    const done = () => finishPlayback();
    video.addEventListener('ended', done);
    video.addEventListener('error', done);
    if (visionSeenRef.current) {
      video.pause();
      setVideoDone(true);
      setBlocked(false);
      return () => {
        video.removeEventListener('ended', done);
        video.removeEventListener('error', done);
        activeRef.current = false;
        video.pause();
        setBlocked(false);
      };
    }
    setBlocked(true);
    setVideoDone(false);
    video.currentTime = 0;
    video.play().catch(done);
    return () => {
      video.removeEventListener('ended', done);
      video.removeEventListener('error', done);
      activeRef.current = false;
      video.pause();
      setBlocked(false);
    };
  }, [isActive, setBlocked]);

  const handleReplay = () => {
    if (!videoRef.current) return;
    visionSeenRef.current = true;
    setBlocked(true);
    setVideoDone(false);
    setSliderX(0.5);
    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(finishPlayback);
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
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
        <CompareSlider
          videoRef={videoRef}
          sliderRef={sliderRef}
          sliderX={sliderX}
          onPointerDown={onPointerDown}
          onKeyDown={(e) => { if (!videoDone) return; if (e.key === 'ArrowRight') setSliderX((v) => Math.min(1, v + 0.05)); if (e.key === 'ArrowLeft') setSliderX((v) => Math.max(0, v - 0.05)); }}
          isCompare={videoDone}
          videoSrc="/boceto-video.mp4"
          poster="/boceto-poster.webp"
          finalImage="/boceto-final.png"
          finalImageAlt="Imagen final del proyecto"
        >
          <button type="button" onClick={handleReplay} aria-label="Reproducir video de nuevo" className="btn-replay grid min-h-[44px] min-w-[44px] place-items-center rounded-full bg-white/90 p-0 text-ink shadow-lift hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 absolute bottom-3 right-3 z-10">
            <span className="replay-arrow grid h-5 w-5 place-items-center" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full" aria-hidden="true" focusable="false">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </span>
          </button>
        </CompareSlider>
        <div className="relative self-stretch border-l-2 border-clay/30 pl-6">
          <div className={`absolute top-0 left-6 transition-all duration-500 ease-out ${s >= 1 ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}>
            <LogoMark className="h-[7.5rem] w-[7.5rem]" minimal />
          </div>
          <h2 className={`absolute left-6 right-0 font-display text-5xl leading-[0.96] tracking-[0.035em] text-ink sm:text-6xl text-wrap-balance transition-all duration-700 ease-out ${s >= 1 ? 'top-0 translate-y-0' : 'top-1/2 -translate-y-1/2'}`}>Del boceto al baño.</h2>
          <p className={`absolute left-6 right-0 text-lg leading-8 text-ink/72 transition-all duration-500 ease-out ${s >= 1 ? 'top-1/2 -translate-y-1/2 opacity-100' : 'top-1/2 -translate-y-1/2 translate-y-8 opacity-0'}`}>Antes de elegir una pieza, vemos proporción, paso de luz y continuidad. El resultado no empieza en catálogo, empieza en una imagen que ya encaja.</p>
        </div>
      </div>
    </div>
  );
}
