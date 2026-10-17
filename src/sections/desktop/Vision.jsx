import { useRef, useState, useEffect, useCallback } from 'react';
import { LRMQ_ASSETS } from '../../config/mediaAssets';
import { LogoMark } from '../../components/LogoMark';
import { CompareSlider } from '../../components/CompareSlider';
import { usePreparedMedia } from '../../hooks/usePreparedMedia';

// Browser-session playback memory, as before. Server rendering never reads or
// writes this flag: it is used only by playback events and effects.
const visionSeenRef = { current: false };

export function Vision({ step, isActive, onHold, narrative = true, prepareMedia = isActive }) {
  const videoRef = useRef(null);
  const sliderRef = useRef(null);
  const prepared = usePreparedMedia(sliderRef, narrative, prepareMedia);
  const draggingRef = useRef(false);
  const activeRef = useRef(false);
  const [videoDone, setVideoDone] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [sliderX, setSliderX] = useState(0.5);
  const holdRef = useRef(onHold);
  holdRef.current = onHold;
  const s = isActive ? step : 0;

  const finishPlayback = useCallback(() => {
    if (!prepared || !activeRef.current || !videoRef.current?.getAttribute('src') || videoRef.current.readyState < 2) return;
    videoRef.current?.pause();
    setVideoDone(true);
    setPlaying(false);
    holdRef.current?.(false);
    visionSeenRef.current = true;
  }, [prepared]);

  useEffect(() => {
    activeRef.current = !narrative || isActive;
    if (narrative && !isActive) {
      videoRef.current?.pause();
      const video = videoRef.current;
      return () => { activeRef.current = false; video?.pause(); };
    }
    if (!prepared || !videoRef.current) return;
    const video = videoRef.current;
    const done = () => finishPlayback();
    const failed = () => {
      if (!activeRef.current) return;
      setPlaying(false);
      holdRef.current?.(false);
    };
    let loadingTimer;
    const started = () => {
      clearTimeout(loadingTimer);
      if (narrative && activeRef.current) holdRef.current?.(true);
    };
    video.addEventListener('ended', done);
    video.addEventListener('error', failed);
    video.addEventListener('playing', started);
    if (!narrative) {
      video.pause();
      setPlaying(false);
      return () => { video.removeEventListener('ended', done); video.removeEventListener('error', failed); video.removeEventListener('playing', started); video.pause(); };
    }
    if (visionSeenRef.current) {
      video.pause();
      setVideoDone(true);
      holdRef.current?.(false);
      return () => {
        video.removeEventListener('ended', done);
        video.removeEventListener('error', failed);
        video.removeEventListener('playing', started);
        activeRef.current = false;
        video.pause();
      };
    }
    holdRef.current?.(true);
    setVideoDone(false);
    setPlaying(true);
    video.currentTime = 0;
    // A stalled, not-yet-playable source must not trap narrative navigation or
    // be remembered as completed. Late playback may still start normally.
    loadingTimer = setTimeout(() => {
      if (activeRef.current && video.readyState < 2) {
        setPlaying(false);
        holdRef.current?.(false);
      }
    }, 8000);
    video.play().catch(error => { if (error.name !== 'AbortError') failed(); });
    return () => {
      clearTimeout(loadingTimer);
      video.removeEventListener('ended', done);
      video.removeEventListener('error', failed);
      video.removeEventListener('playing', started);
      activeRef.current = false;
      video.pause();
    };
  }, [isActive, narrative, prepared, finishPlayback]);

  const handleReplay = () => {
    if (!prepared || !videoRef.current) return;
    if (narrative) holdRef.current?.(videoRef.current.readyState >= 2);
    setVideoDone(false);
    setPlaying(true);
    setSliderX(0.5);
    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(error => {
      if (error.name !== 'AbortError' && activeRef.current) {
        setPlaying(false);
        holdRef.current?.(false);
      }
    });
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
    window.addEventListener('pointercancel', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); };
  }, []);

  return (
    <div className="flex h-full items-center bg-transparent px-6">
      <div className="lrmq-vision-layout mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
        <CompareSlider
          videoRef={videoRef}
          sliderRef={sliderRef}
          sliderX={sliderX}
          onPointerDown={onPointerDown}
          onKeyDown={(e) => { if (!videoDone) return; if (e.key === 'ArrowRight') setSliderX((v) => Math.min(1, v + 0.05)); if (e.key === 'ArrowLeft') setSliderX((v) => Math.max(0, v - 0.05)); }}
          isCompare={videoDone}
          videoSrc={prepared ? LRMQ_ASSETS.sketchVideo : undefined}
          videoPreload={prepared ? 'auto' : 'none'}
          poster={prepared ? LRMQ_ASSETS.sketchPoster : undefined}
          finalImage={LRMQ_ASSETS.sketchFinal}
          finalImageAlt="Imagen final del proyecto"
        >
          {!videoDone && !playing && <div className="lrmq-native-only absolute inset-0 items-center justify-center bg-ink/15"><button type="button" onClick={handleReplay} className="min-h-11 rounded-full border border-clay/40 bg-white px-7 py-3 text-sm font-semibold text-ink shadow-lift focus-visible:ring-2 focus-visible:ring-clay">Reproducir boceto</button></div>}
          <button type="button" onClick={handleReplay} aria-label="Reproducir video de nuevo" className={`btn-replay ${!videoDone && !playing ? 'lrmq-replay-idle' : ''} grid min-h-[44px] min-w-[44px] place-items-center rounded-full bg-white/90 p-0 text-ink shadow-lift hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 absolute bottom-3 right-3 z-10`}>
            <span className="replay-arrow grid h-5 w-5 place-items-center" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full" aria-hidden="true" focusable="false">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </span>
          </button>
        </CompareSlider>
        <div className="lrmq-vision-copy relative self-stretch border-l-2 border-clay/30 pl-6" data-phase={s >= 1 ? 'final' : 'initial'}>
          <div className={`absolute top-0 left-6 transition-all duration-500 ease-out ${s >= 1 ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}>
            <LogoMark className="lrmq-contact-mark h-[7.5rem] w-[7.5rem]" minimal />
          </div>
          <h2 className={`absolute left-6 right-0 font-display text-5xl leading-[0.96] tracking-[0.035em] text-ink sm:text-6xl text-wrap-balance transition-all duration-700 ease-out ${s >= 1 ? 'top-0 translate-y-0' : 'top-1/2 -translate-y-1/2'}`}>Del boceto a tu nuevo baño.</h2>
          <p className={`absolute left-6 right-0 text-lg leading-8 text-ink/72 transition-all duration-500 ease-out ${s >= 1 ? 'top-1/2 -translate-y-1/2 opacity-100' : 'top-1/2 -translate-y-1/2 translate-y-8 opacity-0'}`}>Renovamos tu baño para conseguir un espacio funcional, cómodo y actual. El boceto nos ayuda a visualizar la distribución y sus elementos antes de llevar la propuesta a la obra.</p>
        </div>
      </div>
    </div>
  );
}
