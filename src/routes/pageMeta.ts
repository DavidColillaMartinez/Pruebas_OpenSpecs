import type { RouteMeta } from './routeMeta';
import type { ProductDetail } from '../features/catalog/model/types';
import { parseCatalogQuery, serializeCatalogQuery } from '../features/catalog/model/catalogQuery';
import { LEGAL_DOCUMENTS } from '../features/legal/content';
import { LEGAL_BUSINESS } from '../features/legal/business';
import { getKitchenSeo } from '../features/catalog/model/kitchenSeo';

export const HOME_META: RouteMeta = {
  title: 'AREA LRMQ · Reformas integrales y tienda en Madrid',
  description: 'Reformas integrales de viviendas y locales en Madrid. Cocinas, baños, oficios especializados y tienda de exposición. Cuéntanos tu proyecto a AREA LRMQ.',
  socialDescription: 'Reformas de viviendas y locales, cocinas y baños en Madrid. Oficios especializados y tienda de exposición para tu proyecto.',
  canonicalPath: '/',
};

export const QUOTE_META: RouteMeta = {
  title: 'Mi presupuesto · AREA LRMQ',
  description: 'Revisa las variantes seleccionadas y envía una solicitud única de presupuesto para tu reforma con AREA LRMQ.',
  canonicalPath: '/presupuesto', noindex: true,
};

export function getLegalMeta(kind: keyof typeof LEGAL_DOCUMENTS): RouteMeta {
  const { title, description, path } = LEGAL_DOCUMENTS[kind];
  return { title: `${title} · ${LEGAL_BUSINESS.brand}`, description, canonicalPath: path, noindex: true };
}

export function getCatalogMeta(search: string, statusCode = 200): RouteMeta {
  const query = parseCatalogQuery(search);
  const normalized = serializeCatalogQuery(query).toString();
  return {
    title: 'Catálogo de baño y grifería de cocina · AREA LRMQ',
    description: 'Explora muebles de baño, mamparas, platos de ducha, espejos y grifería de baño y cocina en AREA LRMQ, Madrid. Consulta opciones y solicita presupuesto.',
    canonicalPath: statusCode >= 400 ? null : `/productos${normalized ? `?${normalized}` : ''}`,
    noindex: statusCode === 404 || (statusCode !== 503 && Boolean(query.search || Object.keys(query.filters).length || query.sort !== 'relevance')),
  };
}

export function getProductMeta(state: { status: string; product?: ProductDetail }, slug: string): RouteMeta | null {
  if (state.status === 'success' && state.product) return {
    title: `${state.product.name} · AREA LRMQ`,
    description: state.product.description || `${state.product.name} de ${state.product.brand || state.product.supplierName || 'AREA LRMQ'}. Solicita presupuesto.`,
    canonicalPath: `/productos/${encodeURIComponent(slug)}`,
    ...getKitchenSeo(state.product),
  };
  if (state.status === 'not-found') return {
    title: 'Producto no encontrado · AREA LRMQ',
    description: 'No hemos encontrado una ficha pública para este producto. Explora el catálogo completo de AREA LRMQ.',
    canonicalPath: null, noindex: true,
  };
  if (state.status === 'error') return {
    title: 'Catálogo no disponible · AREA LRMQ',
    description: 'El catálogo no está disponible en este momento. Inténtalo de nuevo en unos minutos.',
    canonicalPath: null,
  };
  return null;
}

export function initialHeadMeta(meta: RouteMeta) {
  return { ...meta, robots: meta.noindex ? 'noindex, follow' : 'index, follow' };
}
