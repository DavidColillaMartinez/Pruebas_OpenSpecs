import { useEffect, useMemo, useState } from 'react';
import type { ProductImage } from '../model/types';

type ProductGalleryProps = {
  images: ProductImage[];
  productName: string;
  variantLabel?: string;
};

export function ProductGallery({ images, productName, variantLabel }: ProductGalleryProps) {
  const [activeUrl, setActiveUrl] = useState<string | undefined>(images[0]?.url);
  const [failedUrl, setFailedUrl] = useState<string | undefined>(undefined);
  const [zoomedImage, setZoomedImage] = useState<ProductImage | null>(null);

  useEffect(() => {
    const fallback = images.find((image) => image.url !== failedUrl)?.url ?? images[0]?.url;
    setActiveUrl(fallback);
  }, [images, failedUrl]);

  useEffect(() => {
    if (!zoomedImage) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setZoomedImage(null);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [zoomedImage]);

  const activeImage = useMemo(
    () => images.find((image) => image.url === activeUrl && image.url !== failedUrl) ?? null,
    [images, activeUrl, failedUrl]
  );

  const altPrefix = variantLabel ? `${productName}, ${variantLabel}` : productName;

  return (
    <section aria-labelledby="product-gallery-heading">
      <h2 id="product-gallery-heading" className="sr-only">Imágenes del producto</h2>
      <div className="group flex min-h-72 items-center justify-center overflow-hidden rounded-2xl bg-stonewash p-4 shadow-soft ring-1 ring-ink/5">
        {activeImage ? (
          <button
            type="button"
            onClick={() => setZoomedImage(activeImage)}
            className="flex h-full w-full items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-4 focus-visible:ring-offset-porcelain"
            aria-label={`Ampliar imagen de ${altPrefix}`}
          >
            <img
              src={activeImage.url}
              alt={`${altPrefix}, imagen principal`}
              className="max-h-[34rem] w-full object-contain"
              onError={() => setFailedUrl(activeImage.url)}
            />
          </button>
        ) : (
          <p role="status" className="text-sm text-graphite">Imagen no disponible</p>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2" aria-label="Seleccionar imagen">
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              className={`h-16 w-16 overflow-hidden rounded-lg border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 ${activeUrl === image.url ? 'border-ink shadow-lift' : 'border-ink/15 transition-all duration-200 ease-out hover:border-ink/40 hover:shadow-soft motion-reduce:transition-none'}`}
              aria-label={`Ver imagen ${index + 1}`}
              aria-pressed={activeUrl === image.url}
              onClick={() => setActiveUrl(image.url)}
            >
              <img src={image.url} alt="" className="h-full w-full object-cover" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/82 p-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`Imagen ampliada de ${altPrefix}`}
          onClick={() => setZoomedImage(null)}
        >
          <button
            type="button"
            onClick={() => setZoomedImage(null)}
            className="absolute right-6 top-6 inline-flex min-h-11 items-center justify-center rounded-full bg-white/90 px-4 text-sm font-semibold text-ink shadow-lift transition-transform duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 focus-visible:ring-offset-ink motion-reduce:transition-none"
          >
            Cerrar
          </button>
          <img
            src={zoomedImage.url}
            alt={`${altPrefix}, imagen ampliada`}
            className="max-h-[90vh] max-w-[90vw] rounded-2xl bg-white object-contain shadow-lift"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
