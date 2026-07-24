import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { normalizeCatalogResponseStatus } from './api/catalog/response.js';

async function readRequestBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const upstreamForPath = (path) => {
    if (/^\/api\/catalog\/products\/[^/]+/.test(path)) return env.N8N_CATALOG_PRODUCT_DETAIL_UPSTREAM_BASE_URL || env.N8N_CATALOG_UPSTREAM_BASE_URL;
    if (path.startsWith('/api/catalog/products')) return env.N8N_CATALOG_PRODUCTS_LIST_UPSTREAM_BASE_URL || env.N8N_CATALOG_UPSTREAM_BASE_URL;
    if (path.startsWith('/api/catalog/config')) return env.N8N_CATALOG_CONFIG_UPSTREAM_BASE_URL || env.N8N_CATALOG_UPSTREAM_BASE_URL;
    if (path.startsWith('/api/catalog/quote-requests')) return env.N8N_CATALOG_QUOTE_UPSTREAM_BASE_URL || env.N8N_CATALOG_UPSTREAM_BASE_URL;
    return env.N8N_CATALOG_UPSTREAM_BASE_URL;
  };

  const catalogDevProxy = {
    name: 'catalog-dev-proxy',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        if (!request.url?.startsWith('/api/catalog')) {
          next();
          return;
        }

        const publicUrl = new URL(request.url, 'http://localhost');
        const upstreamBase = upstreamForPath(publicUrl.pathname);
        if (!upstreamBase) {
          response.statusCode = 500;
          response.setHeader('content-type', 'application/json');
          response.end(JSON.stringify({ error: 'CATALOG_PROXY_NOT_CONFIGURED' }));
          return;
        }

        const upstreamUrl = new URL(upstreamBase);
        upstreamUrl.pathname = `${upstreamUrl.pathname.replace(/\/$/, '')}${publicUrl.pathname.replace(/^\/api\/catalog/, '')}`;
        upstreamUrl.search = publicUrl.search;

        try {
          const headers = { accept: request.headers.accept || 'application/json' };
          const options = { method: request.method, headers };
          if (request.method === 'POST') {
            headers['content-type'] = request.headers['content-type'] || 'application/json';
            options.body = await readRequestBody(request);
          }

          const upstreamResponse = await fetch(upstreamUrl, options);
          const body = Buffer.from(await upstreamResponse.arrayBuffer());
          response.statusCode = normalizeCatalogResponseStatus(upstreamResponse.status, body);
          ['content-type', 'cache-control'].forEach((name) => {
            const value = upstreamResponse.headers.get(name);
            if (value) response.setHeader(name, value);
          });
          response.end(body);
        } catch {
          response.statusCode = 502;
          response.setHeader('content-type', 'application/json');
          response.end(JSON.stringify({ error: 'CATALOG_UPSTREAM_ERROR', message: 'No se pudo consultar el catálogo.' }));
        }
      });
    },
  };

  return {
    plugins: [react(), catalogDevProxy],
  };
});
