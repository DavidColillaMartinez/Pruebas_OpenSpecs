import { Link } from 'react-router-dom';
import type { ChatRecommendedProduct } from '../transport/types';

const productImage = 'aspect-square w-20 shrink-0 rounded-xl object-cover';

export function AssistantProductCard({ product }: { product: ChatRecommendedProduct }) {
  const label = product.name;
  return (
    <article className="mt-3 flex gap-3 rounded-2xl border border-ink/8 bg-white/78 p-3 shadow-soft">
      {product.imageUrl && (
        <img src={product.imageUrl} alt={label} loading="lazy" className={productImage} />
      )}
      <div className="min-w-0">
        <Link to={product.internalPath.replace(/^\/+/, '/')} className="font-display text-lg font-medium text-ink underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2">
          {label}
        </Link>
        {product.facts.length > 0 && (
          <p className="mt-1 text-sm text-graphite/85">{product.facts.join(' · ')}</p>
        )}
        <p className="mt-1 text-sm italic text-graphite/70">{product.recommendationReason}</p>
      </div>
    </article>
  );
}
