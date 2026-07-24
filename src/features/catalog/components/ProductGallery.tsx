import { useEffect, useState } from 'react';
import type { ProductImage } from '../model/types';

type ProductGalleryProps = {
  images: ProductImage[];
  productName: string;
  variantLabel?: string;
};

export function ProductGallery({ images, productName, variantLabel }: ProductGalleryProps) {
  const [activeUrl, setActiveUrl] = useState(images[0]?.url);
  const [failedUrl, setFailedUrl] = useState<string>();

  useEffect(() => {
    setActiveUrl(images[0]?.url);
    setFailedUrl(undefined);
  }, [images]);

  const activeImage = images.find((image) => image.url === activeUrl && image.url !== failedUrl);
  const altPrefix = variantLabel ? `${productName}, ${variantLabel}` : productName;

  return (
    <section aria-labelledby="product-gallery-heading">
      <h2 id="product-gallery-heading" className="sr-only">Imágenes del producto</h2>
      <div className="flex min-h-72 items-center justify-center overflow-hidden rounded-2xl bg-stonewash p-4">
        {activeImage ? (
          <img
            src={activeImage.url}
            alt={`${altPrefix}, imagen principal`}
            className="max-h-[34rem] w-full object-contain"
            onError={() => setFailedUrl(activeImage.url)}
          />
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
              className="h-16 w-16 overflow-hidden rounded-lg border border-ink/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay"
              aria-label={`Ver imagen ${index + 1}`}
              aria-pressed={activeUrl === image.url}
              onClick={() => setActiveUrl(image.url)}
            >
              <img src={image.url} alt="" className="h-full w-full object-cover" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
