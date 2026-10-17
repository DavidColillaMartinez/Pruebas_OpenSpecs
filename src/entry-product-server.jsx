import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from './App.jsx';
import { ProductDetailPage } from './features/catalog/pages/ProductDetailPage';
import { normalizeProductDetail } from './features/catalog/model/normalize';
import { getProductMeta, initialHeadMeta } from './routes/pageMeta';

export { renderStaticPage, renderCatalogPage, catalogRequestForPage, normalizeCatalogSearch } from './entry-server.jsx';

// Request-local data only. The existing normalizer selects the public view
// model; the raw upstream answer is never embedded in the document.
export function renderProductPage(result, slug) {
  const state = result.status === 'found'
    ? { status: 'success', product: normalizeProductDetail(result.rawProduct) }
    : result.status === 'not-found'
      ? { status: 'not-found' }
      : { status: 'error', message: 'El catálogo no está disponible temporalmente.' };
  if (state.status === 'success' && state.product.slug !== slug) throw new Error('PRODUCT_SLUG_MISMATCH');
  const initialPage = { slug, state };
  const markup = renderToString(
    <App Router={StaticRouter} routerProps={{ location: `/productos/${encodeURIComponent(slug)}` }} ProductPage={ProductDetailPage} initialProductPage={initialPage} />,
  );
  return { markup, initialPage, meta: initialHeadMeta(getProductMeta(state, slug)) };
}
