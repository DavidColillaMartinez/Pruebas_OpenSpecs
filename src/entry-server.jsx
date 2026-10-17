import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from './App.jsx';
import { CatalogPage } from './features/catalog/pages/CatalogPage';
import { QuoteSelectionPage } from './features/quote/pages/QuoteSelectionPage';
import { LegalPage } from './features/legal/LegalPage';
import { normalizeProductList } from './features/catalog/model/normalize';
import { createInitialCatalogPage } from './features/catalog/model/useCatalogDiscovery';
import { catalogQueryToRequest, parseCatalogQuery, serializeCatalogQuery } from './features/catalog/model/catalogQuery';
import { HOME_META, QUOTE_META, getCatalogMeta, getLegalMeta, initialHeadMeta } from './routes/pageMeta';

const pages = { CatalogPage, QuoteSelectionPage, LegalPage };
const legalKinds = { '/aviso-legal': 'notice', '/privacidad': 'privacy', '/cookies': 'cookies' };

function render(initialPage, location, meta) {
  const markup = renderToString(<App Router={StaticRouter} routerProps={{ location }} pages={pages} initialDocument={initialPage} />);
  return { markup, initialPage, meta: initialHeadMeta(meta) };
}

export function renderStaticPage(pathname) {
  if (pathname === '/') return render({ kind: 'landing' }, pathname, HOME_META);
  if (pathname === '/presupuesto') return render({ kind: 'quote' }, pathname, QUOTE_META);
  if (legalKinds[pathname]) return render({ kind: 'legal' }, pathname, getLegalMeta(legalKinds[pathname]));
  throw new Error('STATIC_ROUTE_UNKNOWN');
}

export function catalogRequestForPage(search, page) {
  const query = parseCatalogQuery(search);
  return { targetPage: query.page, params: catalogQueryToRequest({ ...query, page }, page === 1) };
}

export function normalizeCatalogSearch(search) {
  return serializeCatalogQuery(parseCatalogQuery(search)).toString();
}

export function renderCatalogPage(rawPages, search, statusCode = 200) {
  const normalized = rawPages.map((raw) => normalizeProductList(raw));
  if (normalized.some((page) => page.discardedItemCount)) throw new Error('CATALOG_CONTRACT_INVALID');
  const catalog = createInitialCatalogPage(normalized, search, statusCode);
  return render({ kind: 'catalog', catalog }, `/productos${search ? `?${search}` : ''}`, getCatalogMeta(search, statusCode));
}
