# Catalog Discovery Review

Date: 2026-07-24
Scope: `/productos` discovery, with route-level scroll isolation shared by `/productos/:slug`.
Method: revision basada en codigo, CSS, tokens y `.md` del proyecto. La comprobacion visual la realiza el propietario.

## Authority Order

1. `AGENTS.md` y reglas de media protegida.
2. Comportamiento implementado y tokens fuente.
3. Contratos actuales de catalogo/detalle/API.
4. Decisiones OpenSpec vigentes.
5. Documentos historicos solo si no contradicen lo anterior.

## Referencias usadas

### Identidad y sistema visual

- `PRODUCT.md`: voz sobria, precisa, premium; claridad de investigacion.
- `DESIGN.md`: Mist Atelier, Marcellus/Manrope, paleta mineral, acento clay escaso.
- `tailwind.config.js`: tokens implementados `ink`, `stonewash`, `pearl`, `porcelain`, `clay` (#c1aa67), `graphite`, `mist`, sombras `soft/lift/glass`.
- `src/styles/index.css`: atmosfera global, reduced-motion y la media query de bloqueo desktop que hoy fuga a producto (lineas 48-53).
- `index.html`: carga de fuentes Marcellus/Manrope.

### Landing implementada (referencia, no objetivo)

- `src/App.jsx`: shell de rutas y composicion de capitulos.
- `src/hooks/useNarrativeScroll.js`: controlador wheel/teclado solo de landing.
- `src/sections/desktop/*` y `src/sections/mobile/*`: composicion editorial cardless, imagen protagonista, rails de clay, movimiento corto.
- `src/components/Header.jsx`, `MobileDrawer.jsx`, `LogoMark.jsx`, `Button.jsx`: lenguaje de controles; no se generalizan al catalogo.

### Catalogo y contratos

- `src/features/catalog/pages/CatalogPage.tsx`: shell de descubrimiento con total, búsqueda, filtros, sort condicionado, estados y carga incremental.
- `src/features/catalog/components/CatalogProductCard.tsx` y `CatalogFilterPanel.tsx`: tiles route-local, fallback de imagen y drawer modal con cleanup de foco/overflow.
- `src/features/catalog/model/{catalogQuery,useCatalogDiscovery}.ts`: URL compartible, debounce, cancelación, chunks y deduplicación.
- `src/features/catalog/pages/ProductDetailPage.tsx` + `ProductGallery` + `ProductVariantSelector` + `QuoteRequestForm`: protegidos durante la fase visual; el follow-up aprobado añade solo mapping opcional de imágenes por variante y conserva quote.
- `src/features/catalog/api/client.ts`: solo `/api/catalog/*`.
- `src/features/catalog/model/{types,normalize}.ts`: modelos, facets, sort, normalización, fallback transitorio de facets por firma completa y mapping opcional de imágenes por variante.
- `docs/catalog-api-contract.md`, `docs/catalog-api-proxy.md`: contrato publico y cuatro handlers Vercel con helper compartido fuera de `api/`.
- `server/catalog/{proxy,response}.js`: forwarding, timeout, normalizacion `PRODUCT_NOT_FOUND`.

### Datos e importacion (solo lectura)

- `assets/Catalogo/CONTEXTO_CATALOGO_OPENCODE.md`: reglas de proveedor, agrupacion de variantes, politica de imagen y publicacion.
- `assets/Catalogo/catalogo_final_productos_pre_db/{import_summary.json,products.catalog.jsonl,README.md}`: evidencia local; README (433) es historico y contradice metadata (467).

## Contrato observado del listado

```text
GET /api/catalog/products?limit=24&offset=0
items[] + pagination { limit, offset, total }
```

Parametros con evidencia: `search`, `category|category_id`, `supplier|supplier_id`, `subcategory`, `collection`, `product_kind`, `finish` (case-sensitive), `measure`, `limit` (max 60), `offset`. Combinaciones AND entre dimensiones. Sin objeto `facets` y sin enum `sort` demostrado (probes `sort`/`order` no alteran el primer resultado).

Campos raw disponibles por item: `id, name, slug, brand, collection, category_id/name, subcategory, supplier_id/name, product_kind, variant_count, main_image_url/path, available_finishes[], available_measures[], configuration_fields[], specs, show_price, min/max_price_eur` y campos internos que no deben renderizarse (`search_text`, `quality_status`, `publication_status`, `image_status`, `source_page`, `component_refs`, `price_status`).

## Evidencia de conteos

| Fuente | Cantidad | Estado |
|---|---:|---|
| Filas del paquete local | 467 | Fuerte, no publico |
| Variantes del paquete | 2.620 | Fuerte, no son productos |
| `publication_status=publishable` local | 439 | 28 filas sin estado (mamparas) |
| README del paquete | 433 | Historico contradictorio |
| Snapshot reportado | 465 | Sin fuente/version |
| `pagination.total` observado | 190 | Publico actual |
| Snapshot API reportado | 192 | Sin fuente/version |

Localizacion por familia (local -> publico): Accesorios 206->0, Espejos 44->44, Griferia 79->54, Mamparas 28->0, Muebles 102->84, Platos 8->8. La resta (277) esta localizada pero sus motivos exigen SQL/vista/workflow read-only.

## Decisiones de diseno (desde codigo)

- Superficie `bg-porcelain`, `max-w-7xl`, gutters 20/32 px.
- Jerarquia: Marcellus para h1 de pagina; Manrope para nombres de producto, metadata y controles.
- `clay` solo en indicadores, seleccion y foco; nunca texto esencial pequeno.
- Tiles: enlace semantico completo, pozo `stonewash` estable, `object-contain`, sin sombras pesadas en reposo, sin precio ni badges inventados.
- Desktop: rail lateral de filtros; mobile/tablet: busqueda y sort visibles + drawer modal route-local con foco y cleanup de overflow.
- Movimiento: 150-250 ms opacity/transform; estatico con reduced motion.
- Scroll: la landing es propietaria del lock via clase de body; catalogo/ficha conservan scroll nativo.
- Discovery: el navegador solo usa `/api/catalog/products`; el contrato de facets/sort sigue siendo provisional hasta evidencia read-only del backend.

## Limites de fase

Cada fase <= 5 archivos y termina en commit local: revision, scroll, auditoria/contrato, cliente/modelo, query-state, shell/tiles, filtros/sort, cargar-mas, regresion/entrega. Cualquier necesidad de tocar landing, detalle, proxy, n8n, Neon o media protegida detiene la fase y exige aprobacion. La revisión visual de landing/catalogo/ficha permanece pendiente del propietario.
