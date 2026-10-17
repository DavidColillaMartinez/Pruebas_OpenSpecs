import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import './styles/index.css';
import './styles/utilities.css';
import App from './App.jsx';
import { prefetchCatalogLocation } from './features/catalog/api/client';

async function start() {
  const root = document.getElementById('root');
  const pageData = document.getElementById('lrmq-page-data');
  if (pageData) {
    const data = JSON.parse(pageData.content.textContent);
    const props = { initialDocument: data, pages: {} };
    if (!data.kind) {
      const { ProductDetailPage } = await import('./features/catalog/pages/ProductDetailPage');
      props.ProductPage = ProductDetailPage;
      props.initialProductPage = data;
    } else if (data.kind === 'catalog') {
      props.pages = await import('./features/catalog/pages/CatalogPage');
    } else if (data.kind === 'quote') {
      props.pages = await import('./features/quote/pages/QuoteSelectionPage');
    } else if (data.kind === 'legal') {
      props.pages = await import('./features/legal/LegalPage');
    }
    hydrateRoot(root, <React.StrictMode><App {...props} /></React.StrictMode>);
    return;
  }
  prefetchCatalogLocation(window.location.pathname, window.location.search);
  createRoot(root).render(<React.StrictMode><App /></React.StrictMode>);
}

void start();
