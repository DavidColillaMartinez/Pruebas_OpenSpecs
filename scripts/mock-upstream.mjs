/* Local mock of the n8n upstreams so the site can be reviewed offline.
 * Usage: node scripts/mock-upstream.mjs  (port 4120)
 * Data: local fixtures only (no production data, no secrets). */
import http from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const alba = JSON.parse(readFileSync(join(root, '../src/features/catalog/api/fixtures/product-detail.mt-espejos-alba.json'), 'utf8'));
const royo = JSON.parse(readFileSync(join(root, '../src/features/catalog/api/fixtures/product-detail.royo-alfa-compact-100.json'), 'utf8'));
const products = [alba, royo];

const config = {
  catalog_version: 'revison-local',
  api_contract_version: 'catalog-api-v1',
  asset_base_url: 'https://assets.colilladavid.es/proyectos/lrmq',
  source_catalog_base_url: 'https://assets.colilladavid.es/proyectos/lrmq',
  database_ready_for_public_api: true,
};

const json = (res, status, body) => {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=30' });
  res.end(JSON.stringify(body));
};

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;

  if (path.startsWith('/config')) return json(res, 200, config);

  const slug = decodeURIComponent(path.split('/products/')[1]?.split('?')[0] ?? '');
  if (slug) {
    const product = products.find((p) => p.slug === slug);
    if (product) return json(res, 200, product);
    return json(res, 200, { error: 'PRODUCT_NOT_FOUND', message: 'Producto no encontrado' });
  }

  if (path.endsWith('/products')) {
    const search = (url.searchParams.get('search') ?? '').toLowerCase();
    const items = search ? products.filter((p) => p.name.toLowerCase().includes(search)) : products;
    return json(res, 200, {
      items,
      pagination: { limit: 24, offset: 0, total: items.length },
      sort: { applied: 'relevance', supported: ['relevance', 'name_asc', 'name_desc'] },
      facets: {
        finish: [{ value: 'Terracota', label: 'Terracota', count: 4 }, { value: 'Blanco mate', label: 'Blanco mate', count: 2 }],
        supplier: [{ value: 'Manillons Torrent', label: 'Manillons Torrent', count: 1 }, { value: 'Royo', label: 'Royo', count: 1 }],
      },
    });
  }

  if (path.endsWith('/quote-requests')) {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    return req.on('end', () => {
      json(res, 201, { id: 'mock-quote-1', status: 'received', created_at: new Date().toISOString(), item_count: (JSON.parse(raw || '{}').items ?? []).length });
    });
  }

  if (path.startsWith('/chat')) {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    return req.on('end', () => {
      const body = JSON.parse(raw || '{}');
      json(res, 200, { version: 1, conversationId: 'mock-conv-1', requestId: body.requestId ?? 'r', message: 'Respuesta de revisión local (mock). Puedo seguir con más preguntas.', products: [{
        productId: 'mt-espejos-alba', slug: 'mt-espejos-alba', name: 'Alba', internalPath: '/productos/mt-espejos-alba',
        imageUrl: alba.images[0]?.url, facts: [alba.specs['Forma'] ?? 'Circular'], recommendationReason: 'Revisión local',
      }], actions: [{ type: 'navigate_internal', label: 'Ver Alba', target: '/productos/mt-espejos-alba' }] });
    });
  }

  return json(res, 404, { error: 'NOT_FOUND' });
}).listen(4120, () => console.log('mock upstream ready on 4120'));
