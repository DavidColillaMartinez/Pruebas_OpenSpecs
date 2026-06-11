import { useRef, useState, useEffect } from 'react';
import { ProgressBar } from '../../components/ProgressBar';
import { ProjectFacts } from '../../components/ProjectFacts';
import { projectFacts } from '../../data/projectFacts';

export function Reformas({ smoothProgress, isActive, cardless }) {
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
      <div className={`mx-auto grid w-full max-w-7xl gap-10 ${cardless ? 'lg:grid-cols-[1.55fr_0.75fr]' : 'lg:grid-cols-[1.18fr_0.82fr]'} lg:items-center`}>
        {cardless ? (
          <video ref={videoRef} src="/reforma-bano.mp4" muted playsInline preload="auto" onLoadedMetadata={() => { if (videoRef.current) setDuration(videoRef.current.duration); }} className="w-full rounded-[1.2rem]" aria-label="Video stopmotion de reforma de baño completo" />
        ) : (
          <div className="relative overflow-hidden rounded-[2.4rem] border border-white/70 bg-white/44 p-3 shadow-lift backdrop-blur-sm">
            <video ref={videoRef} src="/reforma-bano.mp4" muted playsInline preload="auto" onLoadedMetadata={() => { if (videoRef.current) setDuration(videoRef.current.duration); }} className="w-full rounded-[1.8rem]" aria-label="Video stopmotion de reforma de bano completo" />
          </div>
        )}
        {cardless ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Proyecto real</p>
            <h2 className="mt-3 font-display text-5xl leading-[0.96] tracking-[0.035em] text-ink text-wrap-balance">Reforma en 21 días.</h2>
            <ProjectFacts facts={projectFacts} />
            <div className="mt-7 h-1.5 w-full rounded-full bg-ink/8"><div className="h-full rounded-full bg-clay transition-[width] duration-150 ease-linear" style={{ width: `${videoProgress * 100}%` }} /></div>
            <p className="mt-3 text-xs font-medium uppercase tracking-wider text-ink/40">{videoProgress >= 1 ? 'Proyecto completo. Gira para continuar.' : `Avance de obra ${Math.round(videoProgress * 100)}%`}</p>
          </div>
        ) : (
          <div className="rounded-[2.4rem] border border-ink/6 bg-pearl/78 p-8 shadow-soft backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Proyecto real</p>
            <h2 className="mt-3 font-display text-5xl leading-[0.96] tracking-[0.035em] text-ink text-wrap-balance">Reforma en 21 días.</h2>
            <div className="mt-7 space-y-4 text-base leading-relaxed text-ink/75">
              {projectFacts.map((text, index) => (
                <p key={text} className="flex items-start gap-3"><span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-clay/12 text-xs font-semibold text-clay">{index + 1}</span><span>{text}</span></p>
              ))}
            </div>
            <div className="mt-7 h-1.5 w-full rounded-full bg-ink/8"><div className="h-full rounded-full bg-clay transition-[width] duration-150 ease-linear" style={{ width: `${videoProgress * 100}%` }} /></div>
            <p className="mt-3 text-center text-xs font-medium uppercase tracking-wider text-ink/40">{videoProgress >= 1 ? 'Proyecto completo. Gira para continuar.' : `Avance de obra ${Math.round(videoProgress * 100)}%`}</p>
          </div>
        )}
      </div>
    </div>
  );
}
