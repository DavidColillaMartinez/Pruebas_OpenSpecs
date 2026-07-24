import { CATALOG_ROUTES, handleCatalogRequest } from '../../server/catalog/proxy.js';

export default function handler(request, response) {
  return handleCatalogRequest(request, response, CATALOG_ROUTES.quoteRequests);
}
