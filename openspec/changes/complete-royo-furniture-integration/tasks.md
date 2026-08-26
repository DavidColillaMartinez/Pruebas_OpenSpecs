## 1. Contract And Scope

- [x] 1.1 Inspect the current catalog, product detail, gallery, quote store and `/presupuesto` flows and record the smallest frontend extension points without touching landing or asset files.
- [x] 1.2 Verify through the project proxy `GET /api/catalog/products?category_id=muebles-y-lavabos&supplier_id=royo&modularity=modular`, `GET /api/catalog/products?category_id=muebles-y-lavabos&supplier_id=royo&modularity=normal` and `GET /api/catalog/products/royo-modular-logika`.
- [x] 1.3 Document the exact endpoint and field for every requested value missing from the live responses, preserving missing values as `undefined` or `null` and not treating fixtures as production evidence.
- [x] 1.4 Add or reuse an exact `supplier_id=royo` plus `category_id=muebles-y-lavabos` scope guard and cover it with positive and negative tests.

## 2. Catalog API And Listing

- [x] 2.1 Extend catalog query types and serialization with the closed `modular | normal` value, sending `modularity` only for the exact Royo bathroom-furniture scope.
- [x] 2.2 Add the Modular/Normal control as the first Royo furniture filter, ensuring each change requests the API and does not filter the received page in React.
- [x] 2.3 Extend list/detail types and normalization for API-delivered `modularity`, `main_image_url`, `main_image_path`, `images` and Royo specification fields without deriving values from names, slugs or filenames.
- [x] 2.4 Render Royo card covers from API-delivered image data without splitting, renaming, replacing or reconstructing the complete `001-cover.webp` URL.
- [x] 2.5 Add catalog tests for modular/normal request parameters, exact scope gating, API-delivered covers, absent fields, and unchanged Espejos, Mamparas/GME and other-provider filters.

## 3. Real Variant Selection

- [x] 3.1 Extend the normalized Royo detail model to preserve `specs.modular_notice`, `specs.module_configuration`, `specs.finish_image_map` and all public real variant attributes, including optional values.
- [x] 3.2 Make selector options derive only from complete API variants and compatible combinations, preserving persistent `variantId` and reference values.
- [x] 3.3 Render a single measure or module value as information, and render module configuration as non-commercial information until exact references or API-backed options exist.
- [x] 3.4 Add normal-furniture type handling only for API-backed variants or options, including compatibility disabling and type-specific data where the API provides it.
- [x] 3.5 Keep the add action disabled for incomplete or impossible combinations and update `variantId`, reference and attributes when a valid finish, measure or type changes.
- [x] 3.6 Add selection tests covering real combinations, disabled incompatibilities, one-measure models, modular informational configuration, normal presentation types, and variant identity changes.

## 4. Product Gallery

- [x] 4.1 Implement or extend a pure gallery builder that deduplicates API URLs, places a valid selected-unit quick image first, and then preserves every unique `product.images` entry in API order.
- [x] 4.2 Integrate finish-image shortcuts from real variant data or `specs.finish_image_map` without replacing `product.images` with `selectedUnit.images`.
- [x] 4.3 Preserve the active image when the selected finish has no unambiguous API image, and support API-backed type plus finish shortcuts without inventing URLs.
- [x] 4.4 Add gallery tests for quick-image priority, complete-gallery navigation, duplicate removal, missing finish images, and unchanged active image behavior.

## 5. Generic Budget Selection

- [x] 5.1 Map valid modular and normal Royo selections into the generic basket with `productId`, `variantId`, SKU/reference, supplier, category, name, API image, public attributes, measure, finish, type, module type when present, and quantity.
- [x] 5.2 Exclude prices and price-like fields from Royo lines and payloads while preserving optional absent attributes as absent rather than inferred values.
- [x] 5.3 Enforce `productId + variantId` identity so repeated variants increase quantity and different real variants of one model create independent lines.
- [x] 5.4 Confirm persistence across catalog navigation and reload, and ensure the catalog summary and `/presupuesto` consume and mutate the same generic state.
- [x] 5.5 Keep add feedback local and brief without automatically navigating to `/presupuesto`.
- [x] 5.6 Add basket, summary, persistence and `/presupuesto` tests for duplicate variants, independent variants, full line data, shared state, all-items payloads and no prices.

## 6. Regression Coverage

- [x] 6.1 Add or update tests proving Espejos keeps its existing selectors, gallery, basket identity and payload behavior.
- [x] 6.2 Add or update tests proving Mamparas/GME keeps its existing selectors, gallery, basket identity and payload behavior.
- [x] 6.3 Add or update tests proving other suppliers and categories do not receive Royo modularity rules or changed filter behavior.
- [x] 6.4 Review the changed-file list and confirm no landing, main-page, Vision, mirror-specific, GME-specific, unrelated-provider, asset, backend, SQL, n8n or VPS file was modified.

## 7. Validation And Delivery

- [x] 7.1 Run `npm test` and confirm all catalog, detail, gallery, basket, budget and regression tests pass.
- [x] 7.2 Run `npm run lint` and `npm run typecheck` and resolve only issues within the allowed store/catalog/budget scope.
- [x] 7.3 Run `npm run build` and confirm the production build succeeds without requiring live API data.
- [x] 7.4 Review `git diff` and `git status`, preserve all pre-existing user changes, and confirm the diff is limited to the approved frontend and test scope.
- [x] 7.5 Create the descriptive commit `feat(catalog): complete Royo furniture variants and budget selection` after all validation passes.
- [x] 7.6 Push the current work branch and verify the push result and final commit hash.
