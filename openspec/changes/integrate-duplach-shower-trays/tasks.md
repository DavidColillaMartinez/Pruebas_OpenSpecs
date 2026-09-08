## 1. Confirm API Contract and Scope

- [x] 1.1 Inspect the public Duplach list and detail responses and record the exact fields, parameter names, variant identity, references, image maps and missing fields in the change notes
- [x] 1.2 Add an exact `supplier_id=duplach` and `category_id=platos-de-ducha` scope guard without changing behavior for existing suppliers or categories
- [x] 1.3 Extend the shared catalog types and normalizer to preserve only API-delivered Duplach public attributes, optional finish families and image associations

## 2. Add Server-Side Duplach Discovery

- [x] 2.1 Add the Duplach query profile for `product_id`, `measure`, `texture`, `color`, `grille`, `valve`, `orientation`, `finish_family` and `finish` using the observed API parameter names
- [x] 2.2 Connect Duplach filters and dependent facets to the existing cache, in-flight deduplication, abort/timeout, pagination, prefetch and server-side facet flow
- [x] 2.3 Derive model filter options and card titles from API-delivered IDs and official model/name fields without appending selectable options or inventing missing values
- [x] 2.4 Verify that generic React-side filtering is not used for Duplach and that non-Duplach query serialization remains unchanged

## 3. Implement Real Duplach Variant Selection

- [x] 3.1 Build the Duplach selector adapter from complete API variants and active facets, exposing only compatible measure, texture, color, grille, valve and orientation values
- [x] 3.2 Preserve Stone Plus measure-specific texture restrictions and prevent incomplete or nonexistent combinations from becoming addable
- [x] 3.3 Add conventional color values and API swatch images without deriving colors or swatches from local files or unrelated images
- [x] 3.4 Implement Stone 3D family-first selection from API-delivered `finish_families`, `family_image_map`, `finish_family`, `finish` and variants
- [x] 3.5 Keep Stone 3D finishes scoped to the active family and leave the budget action unavailable until a complete real variant is selected

## 4. Preserve and Extend Product Galleries

- [x] 4.1 Add a pure Duplach gallery composer that keeps the API cover and complete `product.images` gallery while deduplicating an associated quick product image
- [x] 4.2 Wire quick-image changes only to manual compatible selector changes and preserve the active image when no associated quick image exists
- [x] 4.3 Keep swatches out of the main gallery and render Stone 3D family demonstration images in a separate navigable gallery
- [x] 4.4 Verify the shared detail layout and card structure remain unchanged for existing suppliers and the Duplach cover remains first on initial load

## 5. Integrate the Shared Budget Flow

- [x] 5.1 Connect valid Duplach selections to `useQuoteSelection` and `buildQuoteRequestItem` with real `productId`, `variantId`, reference, model, image, public attributes and quantity
- [x] 5.2 Preserve `productId + variantId` identity, repeated-variant quantity increments, independent variant lines and persistence across catalog, detail and `/presupuesto`
- [x] 5.3 Reject product-only or synthetic Duplach entries and preserve the existing no-automatic-navigation behavior after adding
- [x] 5.4 Ensure Duplach quote payloads retain public attributes while excluding price-like and private fields

## 6. Add Automated Coverage

- [x] 6.1 Add query and scope tests for Duplach parameters, exact identifiers, missing API fields and non-Duplach regression
- [x] 6.2 Add normalizer, facet and selector tests for real variant identity, dependent compatibility, Stone Plus restrictions, conventional swatches and Stone 3D family-first behavior
- [x] 6.3 Add gallery tests for cover order, complete-image preservation, quick-image deduplication, active-image preservation and separate Stone 3D family images
- [x] 6.4 Add budget store and payload tests for identity, quantities, persistence, public attributes, price exclusion and existing Royo, Espejos, Mamparas/GME and other providers

## 7. Validate and Deliver

- [x] 7.1 Run `npm test`
- [x] 7.2 Run `npm run lint`
- [x] 7.3 Run `npm run typecheck`
- [x] 7.4 Run `npm run build`
- [x] 7.5 Inspect `git diff` and `git status` to confirm only permitted frontend and OpenSpec files changed and protected assets, landing and infrastructure remain untouched
- [ ] 7.6 Create a focused commit for the completed Duplach integration and push it to the configured remote
