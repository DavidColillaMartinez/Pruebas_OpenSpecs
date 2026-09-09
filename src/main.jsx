import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import './styles/utilities.css';
import App from './App.jsx';
import { prefetchCatalogLocation } from './features/catalog/api/client';

prefetchCatalogLocation(window.location.pathname, window.location.search);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
