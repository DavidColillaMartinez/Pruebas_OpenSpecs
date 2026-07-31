import { useEffect, useMemo, useState } from 'react';
import type { ProductImage } from '../model/types';

type ProductGalleryProps = {
  images: ProductImage[];
  productName: string;
  variantLabel?: string;
};

export function ProductGallery({ images, productName, variantLabel }: ProductGalleryProps) {
  const orderedImages = useMemo(() => {
    const uniqueImages = [...new Map(images.map((image) => [image.url, image])).values()];
    return uniqueImages
      .map((image, index) => ({ image, index }))
      .sort((a, b) => (a.image.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.image.sortOrder ?? Number.MAX_SAFE_INTEGER) || a.index - b.index)
      .map(({ image }) => image);
  }, [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState<Set<string>>(() => new Set());
  const [zoomOpen, setZoomOpen] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
    setFailedUrls(new Set());
    setZoomOpen(false);
  }, [orderedImages]);

  useEffect(() => {
    if (orderedImages.length === 0) return undefined;
    if (activeIndex < orderedImages.length && !failedUrls.has(orderedImages[activeIndex].url)) return undefined;
    const fallbackIndex = orderedImages.findIndex((image) => !failedUrls.has(image.url));
    if (fallbackIndex >= 0 && fallbackIndex !== activeIndex) setActiveIndex(fallbackIndex);
    return undefined;
  }, [activeIndex, failedUrls, orderedImages]);

  useEffect(() => {
    if (!zoomOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setZoomOpen(false);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setActiveIndex((current) => Math.max(0, current - 1));
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        setActiveIndex((current) => Math.min(orderedImages.length - 1, current + 1));
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [orderedImages.length, zoomOpen]);

  const activeImage = orderedImages[activeIndex] && !failedUrls.has(orderedImages[activeIndex].url) ? orderedImages[activeIndex] : null;
  const thumbnailStart = Math.min(Math.max(0, activeIndex - 2), Math.max(0, orderedImages.length - 5));
  const visibleThumbnails = orderedImages.slice(thumbnailStart, thumbnailStart + 5);

  const altPrefix = variantLabel ? `${productName}, ${variantLabel}` : productName;

  const goToImage = (index: number) => setActiveIndex(Math.max(0, Math.min(orderedImages.length - 1, index)));
  const goPrevious = () => setActiveIndex((current) => Math.max(0, current - 1));
  const goNext = () => setActiveIndex((current) => Math.min(orderedImages.length - 1, current + 1));
  const markImageFailed = (url: string) => {
    setFailedUrls((current) => new Set(current).add(url));
  };

  return (
    <section aria-labelledby="product-gallery-heading">
      <h2 id="product-gallery-heading" className="sr-only">Imágenes del producto</h2>
      <div className="group relative flex aspect-[1489/2105] max-h-[min(72vh,52rem)] items-center justify-center overflow-hidden border-y border-ink/10">
        {activeImage ? (
          <button
            type="button"
            onClick={() => setZoomOpen(true)}
             className="flex h-full w-full items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-4 focus-visible:ring-offset-porcelain"
            aria-label={`Ampliar imagen de ${altPrefix}`}
          >
            <img
              src={activeImage.url}
              alt={`${altPrefix}, imagen principal`}
               className="h-full w-full object-contain"
              onError={() => markImageFailed(activeImage.url)}
            />
          </button>
        ) : (
          <p role="status" className="text-sm text-graphite">Imagen no disponible</p>
        )}
        {orderedImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrevious}
              disabled={activeIndex === 0}
              aria-label="Imagen anterior"
              className="absolute left-3 top-1/2 inline-flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/88 text-xl text-ink shadow-soft transition hover:bg-white disabled:pointer-events-none disabled:opacity-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay motion-reduce:transition-none"
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={activeIndex === orderedImages.length - 1}
              aria-label="Imagen siguiente"
              className="absolute right-3 top-1/2 inline-flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/88 text-xl text-ink shadow-soft transition hover:bg-white disabled:pointer-events-none disabled:opacity-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay motion-reduce:transition-none"
            >
              <span aria-hidden="true">→</span>
            </button>
          </>
        )}
      </div>
      {orderedImages.length > 1 && (
        <div className="mt-3 flex items-center gap-2" aria-label="Seleccionar imagen">
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex gap-2">
              {visibleThumbnails.map((image) => {
                const imageIndex = orderedImages.indexOf(image);
                return (
            <button
              key={image.url}
              type="button"
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 ${activeIndex === imageIndex ? 'border-ink shadow-lift' : 'border-ink/15 transition-all duration-200 ease-out hover:border-ink/40 hover:shadow-soft motion-reduce:transition-none'}`}
              aria-label={`Ver imagen ${imageIndex + 1} de ${orderedImages.length}`}
              aria-pressed={activeIndex === imageIndex}
              onClick={() => goToImage(imageIndex)}
            >
              <img src={image.url} alt="" className="h-full w-full object-cover" aria-hidden="true" />
            </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {zoomOpen && activeImage && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/82 p-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`Imagen ampliada de ${altPrefix}`}
          onClick={() => setZoomOpen(false)}
        >
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            className="absolute right-6 top-6 inline-flex min-h-11 items-center justify-center rounded-full bg-white/90 px-4 text-sm font-semibold text-ink shadow-lift transition-transform duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 focus-visible:ring-offset-ink motion-reduce:transition-none"
          >
            Cerrar
          </button>
          {orderedImages.length > 1 && (
            <>
              <button type="button" onClick={(event) => { event.stopPropagation(); goPrevious(); }} disabled={activeIndex === 0} aria-label="Imagen anterior" className="absolute left-6 top-1/2 inline-flex min-h-12 min-w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-2xl text-ink shadow-lift disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay"><span aria-hidden="true">←</span></button>
              <button type="button" onClick={(event) => { event.stopPropagation(); goNext(); }} disabled={activeIndex === orderedImages.length - 1} aria-label="Imagen siguiente" className="absolute right-6 top-1/2 inline-flex min-h-12 min-w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-2xl text-ink shadow-lift disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay"><span aria-hidden="true">→</span></button>
            </>
          )}
          <img
            src={activeImage.url}
            alt={`${altPrefix}, imagen ampliada`}
            className="max-h-[90vh] max-w-[90vw] rounded-2xl bg-white object-contain shadow-lift"
            onClick={(event) => event.stopPropagation()}
            onError={() => markImageFailed(activeImage.url)}
          />
        </div>
      )}
    </section>
  );
}
