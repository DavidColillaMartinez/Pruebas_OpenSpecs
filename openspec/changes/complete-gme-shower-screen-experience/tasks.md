## 1. Catalog Contract

- [x] 1.1 Add `distribution` to the catalog facet and product variant types in `src/features/catalog/model/types.ts`
- [x] 1.2 Add `distribution` to URL parsing, serialization, request mapping, and query identity in `src/features/catalog/model/catalogQuery.ts`
- [x] 1.3 Normalize API-provided distribution facet aliases and variant distribution values in `src/features/catalog/model/normalize.ts` without deriving values or image paths
- [x] 1.4 Add query and normalization tests for repeated distribution filters, API facet labels/counts, variant values, Cromo display names, and API-provided image URLs

## 2. Mamparas Filters

- [x] 2.1 Detect the Mamparas catalog context from normalized catalog state and order its available groups as Tipo, Modelo, Distribución, and Acabado while preserving generic catalog behavior elsewhere
- [x] 2.2 Replace the permanent eight-option truncation with accessible per-group Ver todas/Ver menos controls that retain active selections when collapsed
- [x] 2.3 Extend `CatalogFilterPanel` tests to verify API option/count provenance, Mamparas labels/order, missing groups, more than eight options, collapse behavior, and non-Mamparas regression behavior

## 3. Exact Variant Selection

- [x] 3.1 Include normalized distribution in selectable variant units while keeping variant ID, reference, source order, and API-provided images attached to the exact unit
- [x] 3.2 Implement finish-primary selection that preserves the active distribution when compatible and otherwise chooses the first source-ordered variant for the new finish
- [x] 3.3 Restrict visible distribution options to exact variants for the selected finish and make each distribution action select its exact unit
- [x] 3.4 Render only Acabado and Distribución for GME enclosure variants, in that order, without exposing `finishCode` or arbitrary technical attributes
- [x] 3.5 Add selection and component tests using `gme-mamparas-ducha-open` and `gme-mamparas-ducha-glass` for compatible preservation, fallback, dependent options, exact IDs/references, Cromo display, and impossible-combination prevention

## 4. Product Gallery Behavior

- [x] 4.1 Preserve the `selectedUnit?.images?.length ? selectedUnit.images : product.images` gallery rule and verify no frontend code constructs GME image routes
- [x] 4.2 Add product-detail tests proving shower variant changes update imagery for Open and Glass using API URLs
- [x] 4.3 Add product-detail tests proving finish/distribution changes preserve the complete product gallery for `gme-mamparas-banera-basic` and `gme-mamparas-banera-screen` variants without images

## 5. Validation

- [x] 5.1 Run the catalog-focused query, normalization, filter, selection, and product-detail tests and resolve all failures within catalog scope
- [x] 5.2 Run `npm test` and record the result without issuing real quote POST requests
- [x] 5.3 Run `npm run build` and resolve catalog-caused build failures
- [ ] 5.4 Review the unchanged generic catalog plus Mamparas filters and the four representative detail pages in a browser on desktop and mobile, including long facets, finish/distribution interactions, image aspect ratios, and navigation
- [x] 5.5 Report changed files, executed tests/build, visual review evidence, and any live API contract blocker without modifying n8n, PostgreSQL, routes, assets, or non-catalog code
