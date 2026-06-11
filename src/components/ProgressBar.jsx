export function ProgressBar({ progress }) {
  return (
    <>
      <div className="mt-7 h-1.5 w-full rounded-full bg-ink/8" role="progressbar" aria-label="Avance de obra" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-clay transition-[width] duration-150 ease-linear" style={{ width: `${progress * 100}%` }} />
      </div>
      <p className="mt-3 text-xs font-medium uppercase tracking-wider text-ink/40">{progress >= 1 ? 'Proyecto completo' : `Avance de obra ${Math.round(progress * 100)}%`}</p>
    </>
  );
}
