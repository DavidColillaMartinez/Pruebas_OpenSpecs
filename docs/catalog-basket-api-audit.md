# Catalog Basket and API Audit

Audit scope: `audit-harden-catalog-basket-api`.

No screenshots, browser harness, POST quote requests, VPS changes, n8n edits, or database writes were performed.

## Git Baseline

The catalog header in `b8454e7^` is the dark rounded masthead with the image panel, while the current `HEAD` (`7148f4a`) is the later transparent/light masthead. The basket integration currently sits in the light masthead. The implementation target is to restore the exact `b8454e7^` structure and add only a compact selection action.

## Real GET Checks

All checks below were read-only requests to `https://n8n.colilladavid.es` on 2026-08-01.

| Request | Status | Evidence |
|---|---:|---|
| `GET /webhook/lrmq/catalog/config` | 200 | `catalog-api-v1`, `database_ready_for_public_api=true`, asset base URL returned |
| `GET /webhook/lrmq/catalog/products?limit=3&offset=0&include_facets=1&category_id=espejos` | 200 | 53 total; direct `shape`, `has_led`, `lighting_type`, `lighting_technology` fields and facets `shape`, `has_led`, `lighting_type`, `finish`, `measure` |
| `GET /webhook/lrmq/catalog/products?limit=3&offset=0&include_facets=1&category_id=mamparas` | 200 | 21 total; GME family fields include `configuration_fields=[distribution,finish]` and real image URLs |
| `GET /webhook/lrmq/catalog/products?limit=1&offset=0&include_facets=1&category_id=accesorios-de-bano` | 200 | 206 public rows; category and all related facets are still exposed |
| `GET /webhook/lrmq/catalog/products?limit=1&offset=0&include_facets=1` | 200 | 451 public rows; `Accesorios de baño` facet count is 206 |
| `GET /webhook/lrmq/catalog/products/mt-espejos-alba` | 404 | Shared list webhook path is not registered for detail |
| `GET /webhook/lrmq/catalog/products/mt-espejos-alvero` | 404 | Shared list webhook path is not registered for detail |
| `GET /webhook/lrmq/catalog/products/gme-mamparas-ducha-akr` | 404 | Shared list webhook path is not registered for detail |
| `GET /webhook/35f1a0c4-e2e1-443d-8390-56f0027d0742/lrmq/catalog/products/mt-espejos-alba` | 200 | Configured detail workflow returns 16 real variants and `mt26-esp-alba-*.webp` images |
| `GET /webhook/35f1a0c4-e2e1-443d-8390-56f0027d0742/lrmq/catalog/products/mt-espejos-alvero` | 200 | Configured detail workflow returns 4 real variants and `mt26-esp-alvero-*.webp` images |
| `GET /webhook/35f1a0c4-e2e1-443d-8390-56f0027d0742/lrmq/catalog/products/gme-mamparas-ducha-akr` | 404 | Configured detail workflow returns `PRODUCT_NOT_FOUND` for a slug published by the list |
| `GET /webhook/35f1a0c4-e2e1-443d-8390-56f0027d0742/lrmq/catalog/products/gme-mamparas-ducha-aktual` | 200 | Configured detail workflow returns a real GME variant contract and API-provided variant images |

The live list publishes these detail slugs: `mt-espejos-alba`, `mt-espejos-alvero`, and `gme-mamparas-ducha-aktual`. The configured detail workflow is operational for both Espejos slugs and the GME Aktual slug. The shared list webhook path is not the detail contract.

The live unfiltered response currently exposes category `accesorios-de-bano`; this is not a frontend-only omission and requires an API/database publication change to disappear from production.

## Local Snapshot Audit

Read-only package: `assets/Catalogo/catalogo_final_productos_pre_db/`, version `final-pre-db-001`.

- 467 product rows and 2,620 variant rows are present locally.
- 206 rows belong exactly to category ID `accesorios-de-bano` / name `Accesorios de baño`.
- Those rows contain 500 local variants and 206 rows with a main image.
- 29 exact accessory subcategory values are present.
- `categories.json` includes `accesorios-de-bano` with `product_count=206`.
- The package has no relational schema, foreign-key metadata, or migration history, so SQL impact cannot be safely inferred from this snapshot.

## Repository Ownership and Blockers

- Frontend proxy routes exist in `api/catalog/` and forward to resource-specific environment variables in `server/catalog/proxy.js`.
- No SQL view, migration directory, n8n workflow export, import log, or database schema exists in this repository.
- The public GETs are sufficient to implement response normalization and frontend behavior, but not to repair production faceting, detail registration, or retire database rows.
- No production POST was sent.
