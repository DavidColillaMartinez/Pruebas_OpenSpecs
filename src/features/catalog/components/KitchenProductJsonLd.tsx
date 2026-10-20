import type { ProductDetail } from '../model/types';
import { buildKitchenStructuredData } from '../model/kitchenSeo';

export function KitchenProductJsonLd({ product }: { product: ProductDetail }) {
  const data = buildKitchenStructuredData(product);
  if (!data) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}
