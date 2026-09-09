# Auditoría de rendimiento y seguridad del catálogo

- **Fecha:** 2026-09-08
- **Base auditada:** `main` @ `a46c299` (`fix(catalog): activate shower-tray filters from the category alone…`)
- **Alcance:** repositorio local (frontend `src/`, proxy `server/` + `api/`, configuración, assets, historial Git, tests). Sin acceso a n8n, Neon ni VPS: todo lo relativo a esos sistemas queda como análisis o propuesta de coordinación.
- **Método:** lectura de código, `git log`/`git grep` sobre todo el historial, escaneo de assets con `file`/`md5sum`, análisis del build existente en `dist/`. Las métricas de n8n citadas por el responsable backend (listado 481 ms med / 2,39 s p90 / 6,27 s máx; detalle 2,95 s med / 7,48 s p90 / 9,68 s máx; presupuesto 14 ms med / 314 ms p90) se toman como contexto, no se verificaron contra el servicio.

---

## 1. Mapa de carga del catálogo

### 1.1 Punto único de red

Todo el frontend pasa por **un solo `fetch()`**: `src/features/catalog/api/client.ts:95` (`performRequest()`), base `/api/catalog`.

| Función (client.ts) | Endpoint | Uso |
|---|---|---|
| `getCatalogConfig` (156–162) | `GET /api/catalog/config` | Solo detalle Duplach |
| `getProducts` (195–202) | `GET /api/catalog/products?limit&offset&include_facets&search&category_id&supplier_id&sort` | Listado y facetas |
| `getProductBySlug` (185–193) | `GET /api/catalog/products/{slug}` | Detalle |
| `createQuoteRequest` (220–226) | `POST /api/catalog/quote-requests` | Presupuesto (nunca cacheado) |
| `prefetchCatalogFirstPage` (216–218) | GET listado página 1 | Warmup en hover "Tienda" |
| `prefetchProductBySlug` (212–214) | GET detalle | Warmup en hover de tarjeta |

Infraestructura: dev proxy propio en `vite.config.js:13-66` → webhooks n8n vía env; producción → funciones Vercel `api/catalog/*.js` → `server/catalog/proxy.js`.

### 1.2 Cadenas de llamadas por flujo

| Flujo | GETs | Desglose |
|---|---|---|
| Landing `/` | 0 | Estático; 1 GET solo si el usuario pasa el cursor por un enlace "Tienda" (prefetch) |
| Montaje `/productos` | **≥2** | 1 items (`limit=24&include_facets=1`) + cadena "facet universe" (`limit=60`, en bucle hasta `hasRequiredFacets`) |
| Cambio de categoría/familia | 1..N | 1 items + 0..N facetas (caché de facetas por `facetKey`, solo en memoria del componente) |
| Cambio de filtro/búsqueda | 1..N | 1 items (búsqueda con debounce 300 ms) + facetas solo si el `facetKey` es nuevo |
| Apertura de detalle | 1 (2 si Duplach) | `GET /products/{slug}` (+ `GET /config` para platos Duplach) |
| Envío de presupuesto | 1 POST | Sin caché ni dedup (correcto) |

**Hallazgo principal:** los dos GETs del montaje difieren en `limit` (24 vs 60), por lo que la deduplicación del cliente no los unifica; y el bucle de facetas repite el GET cada 60 items hasta encontrar todas las facetas requeridas (`useCatalogDiscovery.ts:170-194`). Coordenadas: `src/features/catalog/model/useCatalogDiscovery.ts` (facetas 235-297, items 299-358).

### 1.3 Deduplicación, caché y cancelación existentes

- `responseCache` (60 s TTL, 60 entradas, eviction FIFO) + `inFlightRequests` (líder compartido) + stale-while-revalidate + `withAbort()` por vista: `client.ts:8-50, 88-154`.
- Caches por componente en `useCatalogDiscovery.ts` (`ItemCache` por `queryKey` 35-42, `facetCachesRef` 205, `globalFacetCacheRef` 206): se pierden al desmontar.
- AbortController por efecto (237, 271, 301) y en detalle (`ProductDetailPage.tsx:215-242`): las peticiones obsoletas se cancelan a nivel de vista.
- Persistencia no-cache: `sessionStorage['catalog:return-state']` (scroll/volver) y `localStorage['lrmq:quote-selection:v2']` (cesta de presupuesto).

### 1.4 Datos cargados que la vista no usa

- **Listado se normaliza a fidelidad de detalle**: `normalizeProductCard` ejecuta `normalizeProductDetail` completo y descarta el resto (`normalize.ts:291-331`). Cada tarjeta paga parsing de variantes/specs que no renderiza.
- **Detalle recibe todas las variantes**: `ProductDetail` incluye `variants: ProductVariant[]` completo (`types.ts:52-85`); Duplach Stone 3D materializa 23.820 combinaciones y el navegador las procesa en cada selección (`selection.ts:74-111`). El detalle de Duplach alcanza varios MB; el corte es parte del contrato actual, no del frontend.
- `include_facets=1` en el listado devuelve facetas junto a productos aunque el usuario no abra filtros.

### 1.5 Reparto de responsabilidad

| Capa | Responsable hoy |
|---|---|
| Navegador | Todo el filtrado de variantes, construcción de selectores, derivación de facetas de respaldo (`deriveCatalogFacets`, `normalize.ts:333-396`) |
| Proxy del repositorio | Solo reenvío (ver §4); sin caché ni agregación |
| Contrato externo (n8n/Neon) | Productos completos con variantes materializadas, facetas del listado, config Duplach |

**Coordinación futura (fuera de alcance):** detalle ligero sin combinaciones materializadas, facetas precalculadas por query, resolución server-side de la variante al presupuestar. Documentado en `docs/proposals/catalog-api-v2.md`. La vista Neon `v_product_detail_public_grouped` queda fuera de alcance y no fue consultada.

---

## 2. Inventario de payloads

Sin acceso a n8n, la medición se limita a fixtures locales y a lo documentado en auditorías previas del repo. No se inventaron respuestas.

| Fuente | Tamaño | Contenido |
|---|---:|---|
| Fixture detalle Manillons (`product-detail.mt-espejos-alba.json`) | 3,9 KB | 16 variantes |
| Fixture detalle Royo (`product-detail.royo-alfa-compact-100.json`) | 5,1 KB | Variantes + commercial_offers |
| Fixture Duplach (`duplach-platos-contract.ts`) | 10,2 KB | Contract con familias 3D |
| Detalle Duplach real (histórico, `docs/catalog-basket-api-audit.md`) | varios MB | 23.820 variantes por combinación de medida/textura/color/rejilla/orientación/3D |
| Listado con facetas | incluye facetas | `include_facets=1`; el cliente además pide "universo" de facetas con `limit=60` |

Campos realmente usados por pantalla:

- **Tarjeta:** slug, nombre, marca/proveedor, categoría, subcategoría/colección, imagen principal, badges mínimos (`normalizeProductCard`, `types.ts:94-116`).
- **Detalle:** specs públicos, variantes (id, label, medidas, acabado, imágenes, atributos públicos), `commercialOffers`, familias 3D Duplach, `configurationFields`.
- **Selector Duplach:** familia → demo_images → swatches → medidas → rejilla/válvula. Todo derivado del array completo de variantes en cliente.
- **Presupuesto:** snapshot ligero (`VariantSnapshot`, `types.ts:177-186`).

Las cifras de latencia n8n (tabla del encabezado) corresponden al responsable backend y no se reprodujeron.

---

## 3. Dependencias y build

- **Sin code splitting:** ninguna aparición de `React.lazy`/`import()` en `src/`; las 5 rutas (`/`, `/productos`, `/productos/:slug`, `/presupuesto`, 404) y las dos variantes de landing (desktop + móvil, ambas montadas) viven en el chunk principal.
- **Bundle actual** (build `dist/` de `a46c299`, medido):
  - JS: **418.899 B raw / 119.193 B gzip** (chunk único `index-DXq2KVDF.js`)
  - CSS: 46.816 B raw / 9.094 B gzip
  - `vite.config.js` no define `build` (sin `manualChunks`, sin `chunkSizeWarningLimit`).
- **Dependencias:** runtime React 19 + react-router-dom 7; sin librería de datos (capa SWR propia). Riesgo de reproducibilidad: `react`, `vite`, `@vitejs/plugin-react`, `postcss`, `autoprefixer` están pinned a `"latest"`. No se regeneró el lockfile ni se actualizaron majors en esta auditoría.
- **Fuentes:** único recurso externo = Google Fonts (Marcellus + Manrope) con `preconnect` (`index.html:7-9`); sin scripts externos.
- **Typecheck incompleto:** `tsconfig.json` solo cubre `src/features/**` y `src/routes/**`; `api/`, `server/` y todo `.jsx` quedan fuera.
- **Herramientas:** scripts npm `dev/lint/typecheck/test/build/preview` (vitest 4, eslint 10, tsc 5.9). Coexisten `pnpm-lock.yaml` y `package-lock.json` (mezcla npm/pnpm a unificar en el futuro).
- **Proxy dev:** plugin propio con `loadEnv(mode, cwd, '')` (carga todo el entorno en el config de Vite; hoy inocuo, frágil a futuro).

---

## 4. Seguridad del proxy y del cliente

### 4.1 Estado actual (`server/catalog/proxy.js`, 94 líneas)

| Aspecto | Estado |
|---|---|
| Rutas | 4 fijas (config, products, detail, quote-requests); el test garantiza que no existe catch-all |
| Métodos | Allowlist por ruta → 405 sin contactar upstream (53-57) |
| Slug | Validación + `encodeURIComponent` (59-62) |
| Query params | **Reenvío verbatim sin allowlist** (33-40) — superficie de parameter pollution |
| Body POST | **Sin límite** (depende del límite de plataforma ~4,5 MB) |
| Errores | JSON limpio, sin stack traces ni env ni URLs upstream (87-93) ✔ |
| Timeout | `AbortSignal.timeout(10000)` → 502 (71) |
| CORS | No configurado (same-origin por defecto); sin validación de origen explícita |
| Rate limiting | **Ninguno**; el cliente anticipa `429` (`client.ts:106-108`) que el proxy nunca emite |
| Cabeceras seguridad | Ninguna en el proxy; `vercel.json` sin bloque `headers` (sin CSP/XFO/Referrer-Policy/HSTS) |
| Logging | Sin registro de fallos upstream (observabilidad 0) |

### 4.2 Env y filtración al bundle

- `src/` e `index.html` **no usan** `import.meta.env`/`process.env`/`VITE_*` (0 coincidencias): el cliente solo usa rutas relativas `'/api/catalog'`. **Ninguna variable llega al bundle** (verificado con grep sobre `dist/assets/*.js`).
- `.env.example` contenía **URLs reales de producción n8n**, incluida la ruta de webhook con UUID en su línea 6 (ya redactada en `work/catalog-perf-security`). En n8n la ruta del webhook **es** la credencial de acceso: anyone con la URL invoca el workflow.
- El UUID también está en `docs/catalog-basket-api-audit.md:17-28` y `openspec/changes/implement-product-detail-page/design.md:9` (+ tasks afines). Repo público en GitHub ⇒ **rotación del path de webhook = coordinación backend urgente** (fuera de alcance; documentado en la propuesta).
- Sin `neon.tech`/credenciales de BD/IPs de producción en el árbol.

### 4.3 Historial Git

- Nunca se committeó un `.env` real ni secretos: pickaxe sobre `postgresql://`, `neon.tech`, `api_key`, `Bearer`, `password`, etc. solo arroja documentación y skills con placeholders.
- Archivos sensibles añadidos en toda la historia: solo `.env.example` (commit 66366d0). Sin `.pem/.key/.sqlite/.sql/dumps/logs`.
- Fixtures con dominio de assets real (`assets.colilladavid.es`) — no es secreto, pero es público.
- Ramas `backup/*` (4): todas ancestros estrictos de `main`, sin commits únicos (redundantes).

---

## 5. Inventario de assets

Resumen aquí; detalle completo en `docs/audit/assets-inventory.md`.

- `public/` = 9,4 MB (24 archivos, todos trackeados); `assets/` = 231 MB (224,7 MB corresponden a `assets/Catalogo/`, **sin trackear**, protegido por guardrails).
- Candidatos sin referencias confirmados: `boceto-poster.jpg` (3,4 MB), `boceto-final.webp` (160 KB, **imagen distinta** a la usada), `logo-area-lrmq.jpeg` (686 KB), `LogoMark.png`, `logopng.svg`, `assets/Boceto/Boceto.jpeg` (1,5 MB).
- Duplicados byte-idénticos `public/` ↔ `assets/`: `boceto-video.mp4`, `reforma-bano.mp4`, `logopng.png`, `logo-area-lrmq.jpeg` (~4,3 MB).
- Extensiones incorrectas: `boceto-final.png` (JPEG real, **en uso y protegido**), 13 avatares `public/reviews/*.jpg` (PNG real, con **nombres reales de personas en el filename**), `assets/Boceto/Boceto.jpeg` (PNG), `assets/Boceto/Imagen_Original.png` (JPEG, modificado por otro agente).
- `assets/Catalogo/`: 486 archivos, ~62,9 MB de duplicados internos, sin referencias de código (solo docs). Propuesta: repositorio privado.

---

## 6. Métricas baseline (punto de partida)

| Métrica | Valor @ a46c299 |
|---|---|
| Bundle JS | 418,9 KB raw / 119,2 KB gzip (1 chunk) |
| CSS | 46,8 KB raw / 9,1 KB gzip |
| GETs montaje catálogo | ≥2 (items + bucle de facetas) |
| GETs detalle | 1 (+1 config Duplach) |
| Variantes en detalle Duplach 3D | 23.820 (contrato actual) |
| Tests | 269/269 |
| Tamaño repo de media | ~25 MB en Git (media pesada: 3,4 MB poster, 2,6 MB vídeo) |
| Assets sin usar en `public/` | ~4,3 MB |
| Duplicados `public/`↔`assets/` | ~4,3 MB |

---

## 7. Riesgos y coordinación pendiente (backend/hosting)

| # | Riesgo | Acción local | Acción externa (coordinar) |
|---|---|---|---|
| 1 | UUID de webhook n8n público (`.env.example`, docs, openspec) | Placeholders + redacción | **Rotar el path del webhook** y regenerar upstreams |
| 2 | Sin rate limiting en `POST /quote-requests` | Documentado; proxy no puede ser la defensa final | Rate limiting/anti-spam en n8n o proxy de producción |
| 3 | Sin cabeceras de seguridad | CSP report-only + XFO + Referrer-Policy en `vercel.json` | Confirmar HTTPS permanente antes de HSTS; CSP enforce |
| 4 | Query params sin allowlist, body sin límite | Allowlist + límite 64 KB en proxy local | Mantener en el proxy definitivo de producción |
| 5 | Detalle Duplach multi-MB (23.820 variantes) | Adaptador/propuesta `catalog-api-v2` | Vista/endpoint de detalle ligero en n8n/Neon |
| 6 | Facetas calculadas en bucle de GETs | Reutilizar respuesta de items | Facetas precalculadas por query |
| 7 | Backup branches y docs históricos con datos de recon (row counts, webhooks) | Limpieza/marcado | Ninguna |

## 8. Acciones recomendadas por fase

1. **Informativos (esta auditoría):** los dos documentos de `docs/audit/` y la propuesta `docs/proposals/catalog-api-v2.md`.
2. **Local, sin backend:** hardening de `.env.example`/docs, cabeceras `vercel.json`, allowlist/límites del proxy, unificación del doble GET, fast-path de normalización de tarjetas, `React.lazy` por rutas, limpieza de assets y `.gitignore`, renombrado PII de reseñas, borrado de backup branches.
3. **Requieren backend/hosting (no ejecutar aquí):** rotación de webhook, rate limiting, detalle/facetas server-side, HSTS, CSP enforce, migración de `assets/Catalogo/` y tooling a repos privado.

## 9. Addendum de ejecución (rama `work/catalog-perf-security`)

- El hallazgo del doble GET (§1.2) se resolvió integrando el trabajo concurrente de otro agente (`d7dfd7a`): el montaje queda en un único GET de listado con facetas incluidas y fallback de derivación local; el selector Duplach ya consume listas de opciones server-side en lugar de variantes materializadas.
- Code splitting por ruta y fast-path de tarjetas implementados localmente (`1365eff`). Métricas finales en la entrega B4 de la rama de trabajo.
- Seguridad aplicada (`82bd685`) y limpieza de assets con PII/redacción (`504e7d5`); la rotación del webhook sigue siendo acción externa obligatoria.

### Métricas finales (build de `work/catalog-perf-security`)

| Métrica | Antes (a46c299) | Después | Delta |
|---|---|---|---|
| JS del chunk principal | 418,9 KB raw / 119,2 KB gz | 331,5 KB / 99,4 KB gz | **−87,4 KB raw / −19,8 KB gz (−21 % / −17 %)** |
| Página de catálogo | en el chunk principal | chunk separado 32,1 KB (8,9 KB gz) | carga bajo demanda |
| Detalle de producto | en el chunk principal | chunk separado 40,5 KB (10,7 KB gz) | carga bajo demanda |
| Presupuesto | en el chunk principal | chunk separado 8,9 KB (2,9 KB gz) | carga bajo demanda |
| GETs en montaje de catálogo | ≥2 (histórico pre-integración) | 1 | −1 solicitud por visita |
| Bytes de media eliminados del repo | — | ≈10,2 MB (10 archivos) | perfil de clonado |
| Tests | 269/269 | 273/273 | +4 |
| typecheck / lint / build | verdes | verdes | — |
| Filtración al bundle | 0 | 0 (grep `n8n|webhook|colilladavid|N8N_` sobre `dist/`) | — |

## 10. Addendum de assets — 2026-09-09

- `assets/Catalogo/` se retiró del workspace porque no tenía referencias de runtime; sus PDFs, JSON y WebP de trabajo no eran consumidos por el frontend.
- Los recursos estáticos que sí usa la landing se sirven ahora desde `https://assets.colilladavid.es/proyectos/lrmq/site/`, con una única base centralizada en `src/config/mediaAssets.ts`.
- Las copias locales de esos recursos se eliminaron del repositorio después de verificar las respuestas HTTPS `200` en la VPS.
- La política CSP de Vercel permite únicamente `assets.colilladavid.es` para imágenes y multimedia remota, además de `images.unsplash.com` para la imagen externa del masthead.
