import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { normalizeCatalogResponseStatus } from './server/catalog/response.js';
import { CATALOG_BODY_BYTE_LIMIT, catalogQueryKeysForPath, pickAllowedSearchParams } from './server/catalog/proxy.js';
import { handleChatRequest } from './server/chat/proxy.js';

async function readRequestBody(request, limit) {
  const chunks = [];
  let total = 0;
  for await (const chunk of request) {
    total += chunk.length;
    if (total > limit) return null;
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const upstreamForPath = (path) => {
    if (/^\/api\/catalog\/products\/[^/]+/.test(path)) return env.N8N_CATALOG_PRODUCT_DETAIL_UPSTREAM_BASE_URL;
    if (path.startsWith('/api/catalog/products')) return env.N8N_CATALOG_PRODUCTS_UPSTREAM_BASE_URL;
    if (path.startsWith('/api/catalog/config')) return env.N8N_CATALOG_CONFIG_UPSTREAM_BASE_URL;
    if (path.startsWith('/api/catalog/quote-requests')) return env.N8N_CATALOG_QUOTE_REQUESTS_UPSTREAM_BASE_URL;
    return null;
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
        upstreamUrl.search = pickAllowedSearchParams(publicUrl.searchParams, catalogQueryKeysForPath(publicUrl.pathname)).toString();

        try {
          const headers = { accept: request.headers.accept || 'application/json' };
          const options = { method: request.method, headers };
          if (request.method === 'POST') {
            headers['content-type'] = request.headers['content-type'] || 'application/json';
            const body = await readRequestBody(request, CATALOG_BODY_BYTE_LIMIT);
            if (body === null) {
              response.statusCode = 413;
              response.setHeader('content-type', 'application/json');
              response.end(JSON.stringify({ error: 'PAYLOAD_TOO_LARGE' }));
              return;
            }
            options.body = body;
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

  const chatDevProxy = {
    name: 'chat-dev-proxy',
    configureServer(server) {
      // In dev, /api/chat/messages runs through the same sanitize/validation contract
      // as production; upstream comes from CHAT_UPSTREAM_BASE_URL when available.
      server.middlewares.use(async (request, response, next) => {
        if (request.url?.startsWith('/api/chat/') || request.url === '/api/chat') {
          request.method = request.method || 'POST';
          if (request.method === 'POST') {
            const limitedBody = await readRequestBody(request, CATALOG_BODY_BYTE_LIMIT);
            if (limitedBody === null) {
              response.statusCode = 413;
              response.setHeader('content-type', 'application/json');
              response.end(JSON.stringify({ error: 'PAYLOAD_TOO_LARGE' }));
              return;
            }
            try {
              request.body = JSON.parse(limitedBody.toString('utf8') || 'null');
            } catch {
              request.body = null;
            }
          }
          await handleChatRequest(request, response);
          return;
        }
        next();
      });
    },
  };

  return {
    plugins: [react(), catalogDevProxy, chatDevProxy],
  };
});
