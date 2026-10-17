// Local production-artifact adapter. Page handlers and security policy are the
// same as the Vercel configuration; this is not evidence of Vercel packaging.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import productPage from '../../api/product-page.js';
import catalogPage from '../../api/catalog-page.js';
import sitemap from '../../api/sitemap.js';
import { CATALOG_ROUTES, handleCatalogRequest } from '../catalog/proxy.js';

const root = resolve('dist');
process.env.NODE_ENV ||= 'production';
const config = JSON.parse(await readFile('vercel.json', 'utf8'));
// Public reads only. Explicit environment overrides allow controlled fixtures.
for (const route of [CATALOG_ROUTES.config, CATALOG_ROUTES.products, CATALOG_ROUTES.productDetail]) {
  process.env[route.envKey] ||= 'https://arealrmq.es/api/catalog';
}
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };

const server = createServer(async (request, response) => {
  response.status = (code) => { response.statusCode = code; return response; };
  response.send = (body) => response.end(body);
  response.json = (body) => { response.setHeader('Content-Type', 'application/json'); return response.end(JSON.stringify(body)); };
  for (const { key, value } of config.headers[0].headers) response.setHeader(key, value);
  const url = new URL(request.url, 'http://localhost');
  request.query = Object.fromEntries([...new Set(url.searchParams.keys())].map((key) => {
    const values = url.searchParams.getAll(key);
    return [key, values.length > 1 ? values : values[0]];
  }));
  try {
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.setHeader('Allow', 'GET, HEAD');
      return response.status(405).end();
    }
    const redirect = config.redirects.find((rule) => rule.source === url.pathname);
    if (redirect) {
      response.setHeader('Location', `${redirect.destination}${url.search}`);
      return response.status(308).end();
    }
    const productAlias = url.pathname.match(/^\/productos\/([^/]+)\/$/);
    if (productAlias) {
      response.setHeader('Location', `/productos/${productAlias[1]}${url.search}`);
      return response.status(308).end();
    }
    const product = url.pathname.match(/^\/productos\/([^/]+)$/);
    if (product) { request.query.slug = product[1]; return await productPage(request, response); }
    if (url.pathname === '/productos') return await catalogPage(request, response);
    if (url.pathname === '/sitemap.xml') return await sitemap(request, response);
    const apiDetail = url.pathname.match(/^\/api\/catalog\/products\/([^/]+)$/);
    if (apiDetail) { request.query.slug = decodeURIComponent(apiDetail[1]); return await handleCatalogRequest(request, response, CATALOG_ROUTES.productDetail); }
    if (url.pathname === '/api/catalog/products') return await handleCatalogRequest(request, response, CATALOG_ROUTES.products);
    if (url.pathname === '/api/catalog/config') return await handleCatalogRequest(request, response, CATALOG_ROUTES.config);
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/server/')) return response.status(404).json({ error: 'NOT_FOUND' });
    const rewrite = config.rewrites.find((rule) => rule.source === url.pathname);
    const pathname = url.pathname === '/' ? '/index.html' : rewrite?.destination || url.pathname;
    const file = resolve(root, `.${decodeURIComponent(pathname)}`);
    if (!file.startsWith(`${root}/`)) return response.status(404).end();
    const body = await readFile(file);
    response.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream');
    return request.method === 'HEAD' ? response.end() : response.end(body);
  } catch {
    if (url.pathname.startsWith('/api/')) return response.status(503).json({ error: 'UNAVAILABLE' });
    if (extname(url.pathname)) {
      response.status(404).setHeader('Content-Type', 'text/plain; charset=utf-8');
      return response.end('Not found');
    }
    response.status(404).setHeader('Content-Type', 'text/html; charset=utf-8');
    return response.end('<!doctype html><html lang="es"><title>Página no encontrada · AREA LRMQ</title><meta name="robots" content="noindex, follow"><main><h1>Página no encontrada</h1><a href="/">Volver a Inicio</a></main></html>');
  }
});
server.listen(Number(process.env.PORT || 4182), '127.0.0.1', () => console.info(`SEO build preview: http://127.0.0.1:${server.address().port}`));
