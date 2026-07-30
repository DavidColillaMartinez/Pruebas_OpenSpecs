## Why

The published GME enclosure catalog now exposes 21 models and their real finish, distribution, and image relationships, but the storefront cannot yet filter or select those relationships safely. The catalog experience must consume that API contract directly so customers see only purchasable variants and the correct shower or bath imagery.

## What Changes

- Add `distribution` to the catalog facet, query, and normalization contract.
- Present API-provided GME enclosure facets as Tipo, Modelo, Distribución, and Acabado, in that order, with all values and counts available beyond the first eight options.
- Make Acabado the primary variant selector and constrain Distribución to variants that exist for the selected finish.
- Preserve a selected distribution across finish changes when that exact pairing exists; otherwise select the first valid variant for the new finish.
- Drive shower detail imagery from the selected unit while preserving the product gallery for bath models whose variants have no images.
- Exclude finish codes, technical attributes, and the invalid display finish Aluminio from customer-facing variant controls while displaying the API-provided Cromo finish.
- Add catalog-only coverage for query serialization, response normalization, facet presentation, dependent variant selection, and shower/bath gallery behavior using the supplied GME model fixtures.

## Capabilities

### New Capabilities
- `gme-enclosure-catalog-experience`: Defines API-driven GME enclosure facets, valid finish/distribution selection, and model-specific gallery behavior.

### Modified Capabilities

None.

## Impact

- Affects only catalog types, query serialization, normalization, filters, variant selection, product detail media behavior, and their tests.
- Relies on the already-published catalog API for model, subcategory, distribution, finish, counts, compatibility, and image URLs.
- Does not change n8n, PostgreSQL, API routes, quote behavior, user-provided assets, or non-catalog UI.
- Introduces no new runtime dependency and does not construct image paths in the frontend.
