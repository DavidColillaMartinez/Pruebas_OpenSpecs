import { buildSitemapResponse } from '../server/seo/sitemap.js';

export default async function handler(request, response) {
  const method = request.method || 'GET';
  if (method !== 'GET' && method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    return response.status(405).send('Method Not Allowed');
  }

  const result = await buildSitemapResponse({ env: process.env });
  for (const [name, value] of Object.entries(result.headers)) response.setHeader(name, value);
  return response.status(result.status).send(result.body);
}
