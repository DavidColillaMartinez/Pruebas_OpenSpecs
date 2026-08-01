## 1. Baseline and Contract Audit

- [x] 1.1 Compare the current catalog header with the pre-basket Git implementation and record the exact files, structure, spacing, and responsive behaviors to preserve.
- [x] 1.2 Inventory the current catalog, variant-selection, basket, summary, and budget-page modules and map their shared state boundaries.
- [x] 1.3 Query the real catalog configuration and listing endpoints and record status, published slugs, fields, facets, pagination, and image URLs.
- [x] 1.4 Query the real detail endpoint using one published Espejo slug, a second Espejo slug, and one GME slug; record exact URL, method, status, and response shape.
- [x] 1.5 Inspect the SQL views, n8n workflow nodes, catalog schema, and existing integration suites that own listing facets and detail responses.
- [x] 1.6 Audit the exact `Accesorios de baño` category, subcategories, products, variants, facets, images, foreign keys, and application references in read-only mode.

## 2. Historical Header and Media Surface

- [x] 2.1 Restore the pre-basket catalog header structure from Git with the smallest possible patch, preserving navigation, search, filters, and responsive behavior.
- [x] 2.2 Integrate the selection counter as a compact secondary action and add a regression test that it updates immediately from shared basket state.
- [x] 2.3 Replace unstable card/gallery image surfaces with a consistent reserved frame using centered `object-contain`, intrinsic proportions, and no backgrounds, overlays, or decorative rectangles.
- [x] 2.4 Keep A4/vertical images uncropped, reduce oversized sources through the frame rather than CSS distortion, and keep product metadata below the frame.
- [x] 2.5 Add stable loading, error fallback, `alt`, and appropriate lazy-loading behavior without changing the reserved frame height.
- [x] 2.6 Add tests that verify API image URLs are used verbatim and that slug-derived legacy filenames are never constructed.

## 3. Generic Variant Selection

- [x] 3.1 Define the normalized configurable-attribute contract and family metadata for Espejos, GME/Mamparas, and other publishable categories.
- [x] 3.2 Implement a shared resolver that derives controls only from complete real variants and declared configurable attributes.
- [x] 3.3 Render a single measure as information, render a measure selector only for multiple real commercial alternatives, and keep technical dimensions out of controls.
- [x] 3.4 Filter incompatible options as selections change, resolve a complete real `variantId`, and disable add-to-budget when no valid combination exists.
- [x] 3.5 Support Espejos attributes including measure, finish, version, LED, lighting type, technology, and light temperature without making the flow family-specific.
- [x] 3.6 Support GME/Mamparas attributes including measure, finish, glass, opening, orientation, and other explicit API fields without regressing existing contextual filters.
- [x] 3.7 Build quote-line snapshots with product ID, variant ID, reference/SKU, supplier, category, product/model name, primary image, complete selected attributes, and quantity, excluding prices.
- [x] 3.8 Add tests for one-measure models, multiple real measures, changing `variantId`, incompatible combinations, Espejos, GME, and another publishable family.

## 4. Basket Persistence and Catalog Summary

- [x] 4.1 Version and validate the localStorage schema, migrate safe legacy lines, and discard incompatible records without creating generic products or crashing hydration.
- [x] 4.2 Preserve identity as `productId + variantId`, increment quantity for the same variant, and create independent lines for different variants of one product.
- [x] 4.3 Add the compact desktop right-hand selection summary while keeping filters on the left and the product grid usable; make it sticky only within catalog bounds.
- [x] 4.4 Add compact line rows with image, name, relevant attributes, quantity controls, removal, empty state, and a clear `/presupuesto` action.
- [x] 4.5 Add the tablet/mobile summary bar or panel with accessible name, focus management, Escape/close behavior, internal scroll, and focus return.
- [x] 4.6 Verify that catalog summary, header counter, detail add action, and `/presupuesto` read and mutate exactly the same store.
- [x] 4.7 Add tests for navigation/reload persistence, localStorage migration/cleanup, immediate counter updates, quantity changes, removal, and shared-state rendering.

## 5. Budget Review and Submission

- [x] 5.1 Refine `/presupuesto` into a compact review layout that distinguishes variants of the same model and exposes complete selected attributes without prices.
- [x] 5.2 Preserve return-to-catalog behavior, the empty state, quantity editing, removal, and all selection snapshots.
- [x] 5.3 Implement coherent loading, success, error, and retry feedback for one `items[]` submission without using mocks as production evidence.
- [x] 5.4 Guard the submit action against double sends and keep the action disabled while the request is in flight.
- [x] 5.5 Ensure the mobile review layout does not require uncontrolled horizontal table scrolling.
- [x] 5.6 Add tests for complete no-price payloads, variant distinction, empty state, quantity/removal actions, request loading, success/error, and duplicate-submit prevention.

## 6. Espejos API Projection and Contextual Filters

- [x] 6.1 Locate the authoritative SQL view or n8n projection for the public listing and compare stored fields with the current response.
- [x] 6.2 Consume the updated API fields `shape`, `has_led`, `lighting_type`, `lighting_technology`, `light_temp`, `finish`, `collection`, and `subcategory` without removing existing response fields.
- [x] 6.3 Consume valid API facets and counts for those fields from the real contract, not frontend fixtures.
- [x] 6.4 Preserve Espejos activation by `category=espejos` or `supplier=manillons-torrent`, remove dependent options with zero results, and clear Espejos URL parameters outside that context.
- [x] 6.5 Preserve GME/Mamparas filter profiles and add regression tests for their existing combinations.
- [x] 6.6 Normalize missing values as absent, not `false`, and ensure LED, lighting, shape, and finish filters use the API request names and result contract.
- [x] 6.7 Add/update API contract and frontend tests for returned fields, facets, dependent counts, absent values, and variant-specific detail attributes.

## 7. Real Detail Endpoint

- [x] 7.1 Update the detail client and route construction to use the exact slug/identifier published by the listing contract.
- [x] 7.2 Use the configured detail upstream `.../35f1a0c4-e2e1-443d-8390-56f0027d0742/lrmq/catalog` without modifying the production workflow.
- [x] 7.3 Verify GET detail responses for `mt-espejos-alba`, `mt-espejos-alvero`, and `gme-mamparas-ducha-aktual` with status `200` and expected fields.
- [x] 7.4 Record the exact configured upstream and avoid using the unregistered shared list webhook as the detail contract.
- [x] 7.5 Add integration tests for published-slug usage, successful detail normalization, not-found/error state, retry behavior, and no generic fallback variant.

## 8. Remove Obsolete Accessories Frontend Content

- [x] 8.1 Audit frontend source, fixtures, and expectations for `Accesorios de baño` references.
- [x] 8.2 Remove the obsolete landing category and any frontend public fixture/expectation that exposes it.
- [x] 8.3 Add/update frontend tests proving the removed category is not rendered as public content.
- [x] 8.4 Verify no source-controlled frontend content still presents `Accesorios de baño` as a public category.
- [x] 8.5 Record that backend publication data is outside this frontend-only change and remains untouched.
- [x] 8.6 Confirm no SQL, migration, n8n, Neon, Supabase, VPS, or asset operation was executed.

## 9. Validation and Delivery Evidence

- [x] 9.1 Run the full frontend and API/database test suites available in the repository and record results without substituting fixtures for production checks.
- [x] 9.2 Run `npm test` and confirm selector, basket, summary, payload, filter, detail, media, and regression tests pass.
- [x] 9.3 Run `npm run lint`, `npm run typecheck`, and `npm run build` and resolve all failures.
- [x] 9.4 Do not run screenshot, harness, or automated visual review; record that visual review is intentionally deferred to the owner.
- [x] 9.5 Produce the final evidence summary separated into frontend, API/n8n/SQL, database changes, migrations and affected IDs, real endpoint responses, tests, and remaining blockers.
