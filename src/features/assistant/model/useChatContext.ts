import { useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { CATALOG_FILTER_KEYS } from '../../catalog/model/catalogQuery';
import type { ChatContext } from '../transport/types';

export const PRODUCT_ROUTE_PATTERN = /^\/productos\/([^/?]+)\/?$/;

const ALLOWED_FILTER_KEYS = new Set<string>([...CATALOG_FILTER_KEYS, 'search']);

function readCatalogFilters(searchParams: URLSearchParams): Record<string, string> {
  const filters: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    if (!value || !ALLOWED_FILTER_KEYS.has(key) || value.length > 80) return;
    if (!/^[A-Za-z0-9 .,%:\-ñáéíóúÁÉÍÓÚÑ]{1,80}$/.test(value)) return;
    filters[key] = value;
  });
  return filters;
}

export function buildChatContext(pathname: string, search = ''): ChatContext {
  const productSlug = PRODUCT_ROUTE_PATTERN.exec(pathname)?.[1] ?? null;
  const filters = productSlug ? {} : readCatalogFilters(new URLSearchParams(search));
  return {
    pagePath: pathname,
    productSlug,
    filters,
    locale: 'es',
  };
}

export function useChatRouteEnrichment(): { enrichContext: (context: ChatContext) => ChatContext } {
  const location = useLocation();
  const params = useParams();
  return useMemo(() => ({
    enrichContext: (context: ChatContext): ChatContext => {
      const slug = typeof params.slug === 'string' ? params.slug : null;
      return slug
        ? { ...context, pagePath: location.pathname, productSlug: slug, filters: {} }
        : context;
    },
  }), [location.pathname, params.slug]);
}

