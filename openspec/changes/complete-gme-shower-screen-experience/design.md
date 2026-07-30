## Context

The catalog already normalizes products, variants, facets, and API-provided image URLs into a shared frontend model. Its generic filter panel currently follows object insertion order and truncates each facet after eight options. Its generic variant selector derives controls from every string attribute, which can expose technical values and can temporarily produce selections that do not identify a real variant.

The published GME enclosure dataset contains 21 product models: 17 shower models and 4 bath models. A product card represents one model. Shower variants carry unit imagery, while bath variants intentionally have no images and the product carries the model gallery. The backend package is supporting evidence only; the running API remains the frontend source of truth.

## Goals / Non-Goals

**Goals:**

- Extend the shared catalog contract with the API's `distribution` facet and variant attribute.
- Give the Mamparas category a deliberate, API-driven facet order and complete option access.
- Keep finish and distribution selection on an exact API-provided variant at all times.
- Apply the existing selected-unit image fallback correctly to both shower and bath models.
- Cover representative high-cardinality and gallery cases with catalog tests.

**Non-Goals:**

- Changing n8n, PostgreSQL, API routes, asset publication, or backend data.
- Constructing, repairing, or guessing image URLs in the frontend.
- Encoding model names, finish lists, distribution lists, or compatibility matrices in application code.
- Redesigning generic catalog behavior outside the Mamparas specialization.
- Displaying finish codes, arbitrary variant attributes, or product technical specifications as variant controls.

## Decisions

### Treat distribution as a first-class API field

Add `distribution` to the facet key and query key sets, facet aliases, and normalized variant shape. Read it from the API's named distribution fields rather than deriving it from IDs, references, filenames, or technical attributes. This keeps URL state, list requests, facet responses, and detail selection aligned.

Alternative considered: leave distribution in the free-form `attributes` map. Rejected because it would not support typed facet query state and would continue exposing unrelated technical attributes as controls.

### Specialize facet presentation by category, not by catalog data constants

When the active catalog context is Mamparas, render available groups in the fixed semantic order `subcategory`, `collection`, `distribution`, `finish`, labeled Tipo, Modelo, Distribución, and Acabado. Values, labels, counts, and group presence still come entirely from normalized API facets. Preserve existing generic labels and behavior outside Mamparas.

Each group may initially show eight options, but a stateful Ver todas/Ver menos control exposes and collapses the complete API list. Selected options must remain visible when collapsing so the control never hides active state.

Alternative considered: always show every option. It satisfies completeness but creates unnecessarily long filter drawers for model and distribution facets. The expandable list preserves scanability without losing access.

### Model variant selection as finish-constrained exact units

For GME enclosure variants, expose only Acabado and Distribución controls, in that order. Build both controls from normalized selectable units. A finish change searches real units for the same distribution and new finish; if none exists, it chooses the first source-ordered unit for that finish. Distribution options are then the distinct distributions among units with the active finish. A distribution click selects the exact matching unit rather than merging partial attribute state.

The selected state is therefore the selected unit itself, or attributes copied from an exact selected unit, never an independently composed finish/distribution pair. Existing commercial-offer selection remains outside this specialization.

Alternative considered: retain the generic Cartesian attribute-option algorithm. Rejected because independently changing attributes can produce combinations absent from the API and can expose `finishCode` and technical attributes.

### Trust API display names and URLs

Use `finish` as the customer-facing label and never render or translate `finishCode`. The backend's physical code can differ from the commercial display finish, including records whose technical source code corresponds to the published Cromo label. The frontend does not maintain an Aluminio-to-Cromo mapping; if the API publishes Aluminio as a display finish, validation reports a backend contract blocker rather than silently rewriting data.

Normalize only image URLs provided by the API under the existing URL policy. Do not derive paths from slug, finish, distribution, or the supplied migration package.

### Keep the existing gallery fallback as the media policy

Continue using `selectedUnit?.images?.length ? selectedUnit.images : product.images`. Shower selections with variant images replace the gallery as the selected unit changes. Bath selections have no variant images and therefore preserve the complete product gallery through every finish/distribution change.

Alternative considered: branch explicitly on shower versus bath subcategory. Rejected because the existing data-driven fallback already expresses the contract and is resilient to other products with the same image ownership pattern.

## Risks / Trade-offs

- [The live API omits `distribution`, facet counts, or public image URLs] -> Treat this as a real backend contract blocker and report it; do not infer missing values.
- [A model has duplicate units for the same visible finish and distribution] -> Preserve API/source order and select the first exact unit deterministically; retain its ID/reference for quoting.
- [Collapsing long facets hides a selected ninth-or-later option] -> Include selected values in the collapsed visible set or keep the group expanded after selection.
- [Mamparas context detection is too broad] -> Base specialization on normalized category identity already used by catalog filters, and add regression coverage for generic facets.
- [Backend technical finish codes resemble customer labels] -> Render only normalized `finish`; verify fixtures contain Cromo and never expose `finishCode` or arbitrary attributes.

## Migration Plan

1. Extend types, query handling, and normalization while preserving existing query keys.
2. Add Mamparas-only facet ordering and long-list controls without changing non-Mamparas filters.
3. Update unit selection and selector rendering, then verify exact variant IDs for all interactions.
4. Verify shower and bath gallery behavior through the existing fallback expression.
5. Run catalog-focused tests, the full `npm test` suite, `npm run build`, and desktop/mobile browser review of filters and representative detail pages.

Rollback is a targeted revert of the catalog-only implementation commit; no backend or persisted-data migration is involved.

## Open Questions

None. Any mismatch between the documented published dataset and the live API is an implementation-time blocker to report rather than a frontend inference opportunity.
