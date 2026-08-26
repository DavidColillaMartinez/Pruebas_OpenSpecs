import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CATALOG_RETURN_STORAGE_KEY } from '../model/catalogQuery';
import type { ProductCard } from '../model/types';

export function CatalogProductCard({ product }: { product: ProductCard }) {
  const images = useMemo(() => [...new Map(product.images.map((image) => [image.url, image])).values()], [product.images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState<Set<string>>(() => new Set());
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'failed'>(images.length > 0 ? 'loading' : 'failed');
  const location = useLocation();
  const metadata = product.brand || product.supplierName || product.categoryName;
  const modularityLabel = product.modularity === 'modular' ? 'Modular' : product.modularity === 'normal' ? 'Normal' : undefined;
  const activeImage = images[activeIndex] && !failedUrls.has(images[activeIndex].url) ? images[activeIndex] : null;

  useEffect(() => {
    setActiveIndex(0);
    setFailedUrls(new Set());
    setImageState(images.length > 0 ? 'loading' : 'failed');
  }, [images]);

  useEffect(() => {
    if (images.length === 0) return undefined;
    if (activeIndex < images.length && !failedUrls.has(images[activeIndex].url)) return undefined;
    const fallbackIndex = images.findIndex((image) => !failedUrls.has(image.url));
    if (fallbackIndex >= 0 && fallbackIndex !== activeIndex) setActiveIndex(fallbackIndex);
    return undefined;
  }, [activeIndex, failedUrls, images]);

  useEffect(() => {
    setImageState(activeImage ? 'loading' : 'failed');
  }, [activeImage]);

  const markImageFailed = (url: string) => {
    setImageState('failed');
    setFailedUrls((current) => new Set(current).add(url));
  };

  return (
    <article className="group min-w-0 border-b border-ink/10 pb-8">
      <Link
        to={`/productos/${encodeURIComponent(product.slug)}`}
        onClick={() => sessionStorage.setItem(CATALOG_RETURN_STORAGE_KEY, JSON.stringify({ search: location.search, scrollY: window.scrollY }))}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-4 focus-visible:ring-offset-porcelain"
      >
        <div className="relative flex aspect-[1489/2105] items-center justify-center overflow-hidden border-y border-ink/10" aria-busy={imageState === 'loading' && Boolean(activeImage)}>
          {activeImage ? (
            <img
              key={activeImage.url}
              src={activeImage.url}
              alt={activeImage.alt || product.name}
              className="h-full w-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
              loading="lazy"
              decoding="async"
              width={activeImage.width}
              height={activeImage.height}
              onLoad={() => setImageState('loaded')}
              onError={() => markImageFailed(activeImage.url)}
            />
          ) : (
            <span className="text-center text-sm text-graphite">Imagen no disponible</span>
          )}
          {activeImage && imageState === 'loading' && <span className="sr-only" role="status">Cargando imagen</span>}
        </div>
        <div className="pt-4">
          {metadata && <p className="text-xs font-semibold uppercase tracking-[0.16em] text-graphite">{metadata}</p>}
          <h2 className="mt-1 font-body text-lg font-semibold leading-snug text-ink transition-colors duration-200 ease-out group-hover:text-graphite motion-reduce:transition-none">{product.name}</h2>
          {(product.collection || product.subcategory) && (
            <p className="mt-1 text-sm text-graphite">{product.collection || product.subcategory}</p>
          )}
          {modularityLabel && <p className="mt-1 text-sm text-graphite">Modularidad: {modularityLabel}</p>}
        </div>
      </Link>
    </article>
  );
}
