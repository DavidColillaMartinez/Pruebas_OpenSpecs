# Inventario de assets

- **Fecha:** 2026-09-08 · **Base:** `main` @ `a46c299`
- **Método:** `du`/`file`/`md5sum`/`cmp` + búsqueda de referencias en todo el árbol (`src/`, `index.html`, CSS, docs, tests, openspec, `dist/` generado). "Sin refs" = cero coincidencias en código y docs, salvo que se indique.
- **Protegidos (no tocar sin petición explícita del owner):** `assets/Catalogo/**`, `assets/Boceto/**`, `public/boceto-final.png`.

## Totales por directorio

| Directorio | Archivos | Tamaño | Estado Git |
|---|---:|---:|---|
| `public/` | 24 | 9,41 MB | trackeado |
| `assets/Catalogo/` | 486 | 224,70 MB | **untracked** |
| `assets/Boceto/` | 3 | 3,06 MB | trackeado (Imagen_Original.png modificado por otro agente) |
| `assets/Reformas/` | 1 | 2,65 MB | trackeado |
| `assets/` raíz (Logo.jpeg, logopng.png) | 2 | 0,71 MB | trackeado |
| `src/` | 0 | 0 | sin media |
| `dist/` | — | 9,5 MB | ignorado (build) |

## `public/`

| Archivo | Bytes | Formato real | Referencias | Acción propuesta |
|---|---:|---|---|---|
| `boceto-final.png` | 755.817 | **JPEG** 1200×896 | `desktop/Vision.jsx:96`, `mobile/Vision.jsx:70` + docs | **EN USO — conservar tal cual** (protegido). Solo documentar mismatch |
| `boceto-final.webp` | 159.816 | WebP 1600×1200 | ninguna | **Eliminar** (no es la misma imagen que el .png en uso) |
| `boceto-poster.jpg` | 3.389.729 | JPEG 1792×2400 | ninguna en código (solo openspec archivado) | **Eliminar** (sustituido por .webp) |
| `boceto-poster.webp` | 470.548 | WebP 1792×2400 | `Vision.jsx` desktop/mobile | conservar |
| `boceto-video.mp4` | 967.591 | MP4 | `Vision.jsx` desktop/mobile | conservar; **duplicado byte-idéntico** de `assets/Boceto/VideoBoceo.mp4` |
| `reforma-bano.mp4` | 2.645.339 | MP4 | `Reformas.jsx` desktop/mobile | conservar; **duplicado** de `assets/Reformas/Baño/WhatsApp Video…mp4` |
| `logo-area-lrmq.jpeg` | 685.679 | JPEG 2048×2048 | ninguna en código | **Eliminar** (sustituido por .webp; duplicado de `assets/Logo.jpeg`) |
| `logo-area-lrmq.webp` | 36.206 | WebP | favicon `index.html:28`, `CatalogMasthead.tsx:14`, `LogoMark.jsx:11` | conservar |
| `logopng.png` | 24.795 | PNG 500×306 | og/twitter `index.html:20,25`, `BusinessJsonLd.jsx:8`, `LogoMark.jsx:5` | conservar; **duplicado** de `assets/logopng.png` |
| `logopng.svg` | 33.310 | SVG válido | ninguna | **Eliminar** |
| `LogoMark.png` | 40.403 | PNG 558×557 | ninguna (documentado como backup) | **Eliminar** |
| `reviews/*.jpg` ×13 | 261.331 total | **PNG real** 128×128 | `reviewsContent.js:21-33` → avatares `Opiniones.jsx` | **Renombrar a `reviewer-01..13.png`** (quita PII del filename; sin cambio visual) |

### `public/reviews/` — detalle (nombres reales de reseñistas)

`fer-diaz`, `francisco-javier-morales-de-la-torre`, `faly-zarza`, `soledad-parra-serradilla`, `raul-parra`, `virginia-donoso-montesinos`, `sandra`, `oscar-diaz`, `beatriz-m-b`, `lucia-perez-corral`, `elena-mediavilla`, `maria-gemma-soriano-vazquez`, `laura-hernandez-parrado`. Contenido: avatares circulares ya públicos en Google; el riesgo es solo el filename en un repo público. Renombrado no altera el render.

## `assets/` (fuera de `Catalogo/`)

| Archivo | Bytes | Formato real | Referencias | Acción |
|---|---:|---|---|---|
| `Boceto/Boceto.jpeg` | 1.524.891 | **PNG** 1275×1079 | ninguna | **Eliminar** (autorización owner explícita; protegido por guardrail → constancia en commit) |
| `Boceto/Imagen_Original.png` | 568.531 | JPEG | solo docs openspec (media del owner) | **No tocar** (modificado por otro agente) |
| `Boceto/VideoBoceo.mp4` | 967.591 | MP4 | ninguna directa | **Eliminar** (duplicado exacto de `public/boceto-video.mp4`) |
| `Logo.jpeg` | 685.679 | JPEG | ninguna | **Eliminar** (duplicado exacto de `public/logo-area-lrmq.jpeg` — que a su vez se elimina; el logo activo es el .webp) |
| `logopng.png` | 24.795 | PNG | ninguna | **Eliminar** (duplicado exacto de `public/logopng.png`) |
| `Reformas/Baño/WhatsApp Video 2026-06-08 at 15.35.59.mp4` | 2.645.339 | MP4 | solo docs (origen del vídeo) | **Eliminar** (duplicado exacto de `public/reforma-bano.mp4`) |

## `assets/Catalogo/` (untracked, protegido — solo documentar)

224,7 MB · 486 archivos. Contenido: 7 PDFs de proveedores (~105 MB) duplicados entre `PdfsOriginales/` y `catalogo_final_productos_pre_db/source_catalogs/` (6/7 byte-idénticos; único Royo), ~460 WebP de producto, `products.catalog.json` (1,46 MB) + jsonl (963 KB), manifests y notas de contexto. Sin referencias de código (las imágenes del catálogo se sirven de `assets.colilladavid.es`). **~62,9 MB de bytes duplicados internos.** Propuesta: migrar a repositorio privado/artefacto del owner; no formar parte del repo público.

## Verificación de duplicados (md5 + cmp)

| Par | md5 | Resultado |
|---|---|---|
| `public/boceto-video.mp4` ↔ `assets/Boceto/VideoBoceo.mp4` | `471bd8e3…` | idénticos |
| `public/reforma-bano.mp4` ↔ `assets/Reformas/…WhatsApp Video…mp4` | `6caa5a4b…` | idénticos |
| `public/logopng.png` ↔ `assets/logopng.png` | `4ea99955…` | idénticos |
| `public/logo-area-lrmq.jpeg` ↔ `assets/Logo.jpeg` | `c1cea5fb…` | idénticos |
| `public/boceto-final.png` ↔ `assets/Boceto/Imagen_Original.png` | — | **distintos** (mismas dimensiones JPEG, bytes diferentes) |
| `public/boceto-poster.jpg` ↔ `.webp` | — | re-encode del mismo original (3,4 MB vs 470 KB) |

## Recursos externos

- `index.html:7-9`: preconnect + Google Fonts (Marcellus, Manrope) — único recurso externo; sin scripts remotos.
- URLs remotas en código: solo dominio propio (`arealrmq.es`) y fixtures de test (`assets.example`, `assets.colilladavid.es`).
