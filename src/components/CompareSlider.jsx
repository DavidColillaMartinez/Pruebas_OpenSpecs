export function CompareSlider({ videoRef, sliderRef, sliderX, onPointerDown, onKeyDown, isCompare, cardless, videoSrc, poster, finalImage, finalImageAlt, children }) {
  return (
    <div
      ref={sliderRef}
      role={isCompare ? 'slider' : undefined}
      tabIndex={isCompare ? 0 : undefined}
      aria-label={isCompare ? 'Comparar boceto con imagen final' : undefined}
      aria-valuenow={isCompare ? Math.round(sliderX * 100) : undefined}
      aria-valuemin={isCompare ? 0 : undefined}
      aria-valuemax={isCompare ? 100 : undefined}
      onKeyDown={isCompare ? onKeyDown : undefined}
      onPointerDown={onPointerDown}
      className={`relative aspect-[4/3] select-none overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/40 ${cardless ? 'rounded-[1.2rem]' : 'rounded-[2.4rem] border border-white/70 bg-ink/8 p-3 shadow-lift'}`}
      style={{ touchAction: isCompare ? 'none' : 'auto' }}
    >
      <video ref={videoRef} src={videoSrc} muted playsInline preload="metadata" poster={poster} className={`absolute inset-0 h-full w-full object-cover bg-white ${cardless ? 'rounded-[1.2rem]' : 'rounded-[1.8rem]'}`} aria-label="Video de boceto dibujándose" />
      {isCompare && (
        <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${sliderX * 100}%)` }}>
          <img src={finalImage} alt={finalImageAlt} className={`absolute inset-0 h-full w-full object-contain bg-white ${cardless ? 'rounded-[1.2rem]' : 'rounded-[1.8rem]'}`} draggable={false} />
        </div>
      )}
      {isCompare && (
        <div className="absolute bottom-0 top-0 w-0.5 bg-clay shadow-lg pointer-events-none" style={{ left: `${sliderX * 100}%` }}>
          <div className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-clay/30 bg-white text-ink shadow-lift">
            <span className="text-[10px] font-bold tracking-[0.16em]">DRAG</span>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
