import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ChatRecommendedProduct } from '../transport/types';

const productImage = 'h-full w-full rounded-xl object-contain';
const productImageFrame = 'lrmq-dark-soften grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-border-hairline/8 bg-surface-elevated/70';

export function AssistantProductCard({ product }: { product: ChatRecommendedProduct }) {
  const label = product.name;
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = product.imageUrl && !imageFailed ? product.imageUrl : undefined;

  return (
    <article className="mt-3 flex gap-3 rounded-2xl border border-border-hairline/8 bg-surface-elevated/78 p-3 shadow-soft">
      <div className={productImageFrame} aria-busy={Boolean(imageUrl)}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={label}
            loading="lazy"
            decoding="async"
            width={80}
            height={80}
            className={productImage}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="px-1 text-center text-[10px] leading-tight text-secondary" aria-label="Imagen no disponible">Imagen no disponible</span>
        )}
      </div>
      <div className="min-w-0">
        <Link to={product.internalPath.replace(/^\/+/, '/')} className="font-display text-lg font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2">
          {label}
        </Link>
        {product.facts.length > 0 && (
          <p className="mt-1 text-sm text-secondary/85">{product.facts.join(' · ')}</p>
        )}
        <p className="mt-1 text-sm italic text-secondary/70">{product.recommendationReason}</p>
      </div>
    </article>
  );
}
