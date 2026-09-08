# Propuesta: Catalog API v2 (para el responsable backend)

- **Fecha:** 2026-09-08 · **Autoría:** OpenCode (solo propuesta — este repositorio no implementa workflows n8n ni cambios en Neon)
- **Objetivo:** reducir el coste de todas las rutas del catálogo sin romper el contrato v1 (`catalog-api-v1`) que consume el frontend en producción, y dejar el frontend preparado para consumir la v2 detrás de una negociación de versión.
- **Restricción:** OpenCode no tiene acceso a n8n/Neon/VPS. Todo lo que sigue es una especificación para que el backend la aplique cuando proceda, idealmente vía MCP. El frontend ya queda compatible (ver §6).

## 0. Motivación (métricas de partida)

- Detalle Duplach hoy: 23.820 variantes materializadas por combinación de medida/textura/color/rejilla/orientación/3D → respuestas de varios MB parseadas en el navegador.
- Listado: cada tarjeta viaja con datos a fidelidad de detalle; `include_facets=1` en cada primera página.
- Latencias n8n reportadas por el backend (contexto, no medido por OpenCode): listado 481 ms med / 2,39 s p90; detalle 2,95 s med / 7,48 s p90.

## 1. Endpoints propuestos

| # | Endpoint | Uso | Sustituye a |
|---|---|---|---|
| 1 | `GET /catalog/cards` | Listado de tarjetas ligero (solo campos usados por tarjeta + paginación) | v1 `/products?limit=…` |
| 2 | `GET /catalog/filter-options` | Opciones/facetas precalculadas por contexto de query | v1 `/products?include_facets=1` + derivación local |
| 3 | `GET /catalog/products/{slug}/detail` | Detalle ligero: specs, imágenes, familias 3D y **opciones** (no variantes) | v1 `/products/{slug}` |
| 4 | `POST /catalog/quote-requests` | Igual que v1; el servidor resuelve la variante server-side | v1 (sin cambio de payload) |
| 5 | `HEAD`/`ETag` en todos los GET | Revalidación barata | — |

## 2. Tarjeta ligera (`/catalog/cards`)

Campos: `id`, `slug`, `name`, `brand`, `supplier_id`, `supplier_name`, `category_id`, `category_name`, `subcategory`, `collection`, `model`, `product_kind`, `shape`, `show_price`, `image` (una única URL optimizada, webp) y arrays de opciones usados por la UI (`available_finishes`, `available_measures`, `distributions`). Sin `variants`, sin `specs` completo, sin `commercial_offers`.

Tamaño estimado: ~1–2 KB por tarjeta frente a varios KB actuales cuando el listado arrastraba variantes.

## 3. Facetas precalculadas (`/catalog/filter-options`)

- Parámetro de contexto: la query activa sin `page`/`sort` (igual semántica que los parámetros v1 `category_id`, `supplier_id`, `search`, filtros).
- Respuesta: `{ facets: {...}, sort: {...} }` calculada en SQL/Neon con `GROUP BY` por clave relevante del perfil de familia activo, **con recuentos condicionados a los filtros ya aplicados** (los que el frontend hoy recalcula en cliente).
- Contract de permitidos por familia: el servidor devuelve solo las claves del perfil (`mamparas/espejos/royo/duplach`), evitando que el cliente tenga que podar.

## 4. Detalle ligero (`/catalog/products/{slug}`)

- Sin array de variantes materializado. En su lugar:
  - `options`: listas por campo de configuración (`measure` con `textures` habilitadas por medida, `finish_family` → `finishes`, `color`, `grille`, `orientation`, `valve`).
  - `rules`: combinaciones válidas por familia/modelo cuando existan dependencias cruzadas (o ya resueltas por las propias opciones anidadas de §3).
  - `selection_images`: mapa `"{textura}:{color}"` / `"{familia}:{acabado}"` → imagen, para galería por selección (el frontend ya lo consume con `selection_image_map`).
  - `3d_designs`: separados de las variantes normales — familias 3D con `demo_images` y una `design_id` reseleccionable, sin permutar variantes de producto físico cuando solo cambia la pieza 3D.
- Payload objetivo: decenas de KB en lugar de MB.

## 5. Presupuesto (resolución server-side)

- El cliente envía `POST /quote-requests` con el **snapshot de selección** (producto + opciones elegidas), igual que hoy.
- El servidor valida contra `options`/`rules` y resuelve `variant_id` (si la fila existe) o registra la combinación válida; el frontend no necesita conocer el `variant_id`.
- El anti-spam/rate limiting del webhook queda en backend (n8n o proxy de producción): no es responsabilidad del proxy del repositorio y OpenCode no lo implementa.

## 6. Compatibilidad v1 → v2 en el frontend

- Detectada por `config.api_contract_version`: v1 continúa funcionando tal cual; v2 activa las rutas nuevas.
- Estado ya preparado en `work/catalog-perf-security`:
  - El selector Duplach ya consume listas de opciones server-side (`specs.size_options`, `specs.finish_options`, `specs.color_options`, `grille/orientation`) y solo recurre al array completo de variantes cuando la respuesta lo trae (`getCompactDuplachOptions`, `DuplachVariantSelector.tsx`).
  - El listado ya funciona con una sola petición por página + fallback de derivación local de facetas (`useCatalogDiscovery.ts`).
  - El POST de presupuesto no envía datos que la v1 no acepte ya (`payload.ts` valida ≤50 items y ≤64 KB).
  - El proxy del repositorio hace allowlist de query params por ruta, por lo que sumar endpoints no requiere cambios de cliente (solo en `api/catalog/*.js` + `CATALOG_ROUTES` del proxy).
- Si la v2 exige respuestas nuevas, el frontend usa tipos y adapters ya definidos (`DuplachSelectorModel.compactOptions`); **no se cambia el contrato de producción hasta que el backend confirme**.

## 7. Compresión, caché y paginación

- `gzip`/**`br`** en n8n/hosting; `Cache-Control: public, max-age=60-300` en listados, `no-store` en quote POST (el proxy actual ya conserva `cache-control` upstream: revisar el valor que emite n8n).
- `ETag`/`If-None-Match` en listado y detalle (recorte real de p90).
- Paginación por `limit/offset` estable con `total`; keyset si el listado crece >1k.
- Las imágenes del catálogo se sirven de `assets.colilladavid.es`; en v2 servir una variante WebP recortada por tarjeta (`/cards` tarjeta única) reduce el coste del listado sin tocar el repositorio.

## 8. Coordinación explícita solicitada al backend

1. Rotar el path del webhook de detalle (el UUID actual es público por un error histórico de commit ya redactado en el repo).
2. Confirmar si n8n envía `429` (el proxy actual no puede) y dónde vivirá el rate limiting definitivo.
3. Confirmar posibilidad de `Cache-Control`/ETag por endpoint y los endpoints §1.
4. Confirmar hosting definitivo para HSTS y CSP enforce (hoy report-only en `vercel.json`).
