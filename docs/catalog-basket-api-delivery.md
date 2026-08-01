# Catalog Basket API Delivery Evidence

Change: `audit-harden-catalog-basket-api`.

## 1. Frontend

- Restored the pre-basket dark catalog masthead from `b8454e7^` and added the basket action as a compact secondary control.
- Added stable A4 image frames, `object-contain`, API URL preservation, lazy loading, loading state, and failure fallback without image re-encoding.
- Reworked variant controls to use real `configuration_fields` and complete variants for Espejos, GME/Mamparas, offers, and other families.
- Removed the incorrect single-value measure control behavior.
- Added complete quote snapshots with product/variant identity, reference, supplier, category, image URL, attributes, and quantity; prices remain excluded.
- Versioned basket storage as `lrmq:quote-selection:v2` and discard-only migration for incompatible legacy lines.
- Added a synchronized desktop selection summary and accessible tablet/mobile drawer.
- Refined `/presupuesto` to review compact variant lines, quantities, images, attributes, loading/error/success states, and duplicate-submit protection.
- Added frontend tests for header counter, media, variant resolution, summary focus/escape behavior, basket migration, payloads, and regressions.

## 2. API, n8n, and SQL

- No n8n workflow, SQL view, proxy route, VPS, or API production code was modified.
- Real listing GETs now expose direct `shape`, `has_led`, `lighting_type`, `lighting_technology` fields and facets `shape`, `has_led`, `lighting_type`, `finish`, and `measure`. The frontend consumes those fields directly and preserves absent values as `undefined`.
- The configured detail workflow is `N8N_CATALOG_PRODUCT_DETAIL_UPSTREAM_BASE_URL` from `.env.example`.
- The shared list webhook detail path is unregistered and returns `404`.

## 3. Database

- No database was queried directly or changed.
- The local protected package contains category ID `accesorios-de-bano`, 206 rows, 500 variants, 206 rows with images, and 29 exact subcategory values.
- No SQL schema, foreign-key metadata, n8n export, import log, or database connection is present in the repository, so indirect references cannot be safely identified.

## 4. Migrations and Affected Records

- No migration was created or executed because the authoritative table names, foreign keys, exact database IDs, and owner-approved retirement mode are unavailable.
- The live public category currently contains 206 rows and remains published; deleting or archiving it from frontend code would be an incorrect substitute for a scoped database/publication migration.

## 5. Real Endpoints

Read-only GET evidence from 2026-08-01 is recorded in `docs/catalog-basket-api-audit.md`.

- Config endpoint: `200`.
- Espejos list: `200`, total `53`.
- Mamparas/GME list: `200`, total `21`.
- Accesorios list: `200`, total `206`.
- Unfiltered list: `200`, total `451`.
- Configured detail workflow, Alba: `200`, 16 variants.
- Configured detail workflow, Alvero: `200`, 4 variants.
- Configured detail workflow, GME Akord: `404 PRODUCT_NOT_FOUND` (the published Aktual slug was used for successful GME verification).
- Configured detail workflow, GME Aktual: `200` with the expected real variant contract.
- No production POST was executed.

## 6. Tests

- `npm test`: 27 files, 124 tests passed.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- `openspec validate audit-harden-catalog-basket-api --strict`: passed.
- Screenshot, browser harness, and automated visual review were intentionally not run.

## 7. Remaining Blockers

- The production list projection/workflow must add real `shape`, `has_led`, `lighting_type`, and their facets/counts.
- Visual review remains intentionally deferred to the owner.
