import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CATALOG_RETURN_STORAGE_KEY } from '../model/catalogQuery';
import type { ProductCard } from '../model/types';

export function CatalogProductCard({ product }: { product: ProductCard }) {
  const [imageFailed, setImageFailed] = useState(false);
  const location = useLocation();
  const image = product.images[0];
  const metadata = product.brand || product.supplierName || product.categoryName;

  return (
    <article className="min-w-0">
      <Link
        to={`/productos/${encodeURIComponent(product.slug)}`}
        onClick={() => sessionStorage.setItem(CATALOG_RETURN_STORAGE_KEY, JSON.stringify({ search: location.search, scrollY: window.scrollY }))}
        className="group block rounded-2xl bg-white/72 p-3 shadow-soft ring-1 ring-ink/5 transition-all duration-200 ease-out hover:-translate-y-1 hover:bg-white hover:shadow-lift hover:ring-clay/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-4 focus-visible:ring-offset-porcelain motion-reduce:transition-none"
      >
        <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-stonewash p-5 transition-colors duration-200 ease-out group-hover:bg-mist motion-reduce:transition-none">
          {image && !imageFailed ? (
            <img
              src={image.url}
              alt={image.alt || product.name}
              className="h-full w-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
              loading="lazy"
              width={image.width}
              height={image.height}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <span className="text-center text-sm text-graphite">Imagen no disponible</span>
          )}
        </div>
        <div className="px-1 pb-2 pt-4">
          {metadata && <p className="text-xs font-semibold uppercase tracking-[0.16em] text-graphite">{metadata}</p>}
          <h2 className="mt-1 font-body text-lg font-semibold leading-snug text-ink transition-colors duration-200 ease-out group-hover:text-graphite motion-reduce:transition-none">{product.name}</h2>
          {(product.collection || product.subcategory) && (
            <p className="mt-1 text-sm text-graphite">{product.collection || product.subcategory}</p>
          )}
        </div>
      </Link>
    </article>
  );
}
