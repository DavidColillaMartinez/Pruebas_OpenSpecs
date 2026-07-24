import { useRef, useState, useEffect } from 'react';
import { ProjectFacts } from '../../components/ProjectFacts';
import { projectFacts } from '../../data/projectFacts';

export function Reformas({ smoothProgress, isActive }) {
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
      <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.55fr_0.75fr] lg:items-center">
        <video ref={videoRef} src="/reforma-bano.mp4" muted playsInline preload="auto" onLoadedMetadata={() => { if (videoRef.current) setDuration(videoRef.current.duration); }} className="w-full rounded-[1.2rem]" aria-label="Video stopmotion de reforma de baño completo" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Proyecto real</p>
          <h2 className="mt-3 font-display text-5xl leading-[0.96] tracking-[0.035em] text-ink text-wrap-balance">Reforma en 21 días.</h2>
          <ProjectFacts facts={projectFacts} />
          <div className="mt-7 h-1.5 w-full rounded-full bg-ink/8"><div className="h-full rounded-full bg-clay transition-[width] duration-150 ease-linear" style={{ width: `${videoProgress * 100}%` }} /></div>
          <p className="mt-3 text-xs font-medium uppercase tracking-wider text-ink/40">{videoProgress >= 1 ? 'Proyecto completo. Gira para continuar.' : `Avance de obra ${Math.round(videoProgress * 100)}%`}</p>
        </div>
      </div>
    </div>
  );
}
