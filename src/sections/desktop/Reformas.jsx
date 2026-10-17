import { useRef, useState, useEffect } from 'react';
import { LRMQ_ASSETS } from '../../config/mediaAssets';
import { ProjectFacts } from '../../components/ProjectFacts';
import { projectFacts } from '../../data/projectFacts';
import { PHONE_INTL } from '../../data/business';

export function Reformas({ smoothProgress, isActive, narrative = true }) {
  const videoRef = useRef(null);
  const [duration, setDuration] = useState(13.7);
  const [nativeProgress, setNativeProgress] = useState(0);
  const progress = isActive ? smoothProgress : 0;
  const videoProgress = narrative ? Math.min(progress / 0.88, 1) : nativeProgress;

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.controls = !narrative;
    if (!narrative) return;
    if (!isActive) { videoRef.current.pause(); return; }
    videoRef.current.currentTime = videoProgress * duration;
  }, [duration, isActive, videoProgress, narrative]);

  return (
    <div className="flex h-full items-center bg-transparent px-6">
      <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.55fr_0.75fr] lg:items-center">
        <video ref={videoRef} src={LRMQ_ASSETS.renovationVideo} muted playsInline preload="metadata" onTimeUpdate={() => { const video = videoRef.current; if (!narrative && video?.duration) setNativeProgress(video.currentTime / video.duration); }} onLoadedMetadata={() => { if (videoRef.current) setDuration(videoRef.current.duration); }} className="w-full rounded-[1.2rem]" aria-label="Video stopmotion de reforma de baño completo" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Reforma de un baño</p>
          <h2 className="mt-3 font-display text-5xl leading-[0.96] tracking-[0.035em] text-primary text-wrap-balance">Tu proyecto, paso a paso.</h2>
          <p className="lrmq-native-only mt-4 text-base leading-7 text-secondary">Servicios de reforma y una amplia variedad de productos para dar forma a tu proyecto.</p>
          <ProjectFacts facts={projectFacts} />
          <div className="mt-7 h-1.5 w-full rounded-full bg-hairline/8"><div className="h-full rounded-full bg-clay transition-[width] duration-150 ease-linear" style={{ width: `${videoProgress * 100}%` }} /></div>
          <p className="mt-3 text-xs font-medium uppercase tracking-wider text-secondary/40">{videoProgress >= 1 ? (narrative ? 'Proyecto completo. Gira para continuar.' : 'Proyecto completo') : `Avance de obra ${Math.round(videoProgress * 100)}%`}</p>
          <a className="lrmq-native-only mt-8 min-h-11 items-center justify-center rounded-full bg-ink px-7 py-3 text-sm font-semibold text-white focus-visible:ring-2 focus-visible:ring-clay" href={`https://wa.me/${PHONE_INTL}?text=${encodeURIComponent('Hola AREA LRMQ, quiero información sobre una reforma.')}`} target="_blank" rel="noopener noreferrer">Pedir asesoría</a>
        </div>
      </div>
    </div>
  );
}
