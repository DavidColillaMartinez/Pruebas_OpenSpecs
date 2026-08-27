## 1. Royo Catalog Context

- [x] 1.1 Inspect the current query profile, filter pruning, discovery cache, normalizer and card implementation, preserving all pre-existing worktree changes and recording the smallest extension points.
- [x] 1.2 Add or adjust a catalog-context predicate that activates Royo for exact `category=muebles-y-lavabos` with no supplier or only `supplier=royo`, and add positive/negative unit tests.
- [x] 1.3 Update active-family detection, `getCatalogFilterKeys` and facet labels so Royo-specific keys appear first in the required order followed by Category and Supplier.
- [x] 1.4 Update filter pruning, URL parsing/serialization and request construction so valid Royo state persists, incompatible Royo state is removed when context changes, and no Royo-only parameter reaches unrelated or mixed suppliers.

## 2. Facets And Server Filtering

- [x] 2.1 Add component/query tests for category-only Royo, exact Royo supplier, unrelated supplier and multiple suppliers, including URL and API request assertions.
- [x] 2.2 Verify the Modular/Normal control uses API facet values and counts, requests a new server-filtered page on change, resets page according to existing query behavior and does not filter received items in React.
- [x] 2.3 Cover API facet responses, missing optional facets, normalized-product fallback values and selected zero-count options without inventing fields or values.
- [x] 2.4 Recheck the live proxy responses for the Royo category/facets and document the exact endpoint and missing field whenever a required facet is absent.

## 3. Royo Card Data And Presentation

- [x] 3.1 Extend the normalized card model only for API-delivered `collection`, an explicit model field if present, and optional `modularity`, preserving absent values without deriving them.
- [x] 3.2 Render exact Royo model titles from API data, map `modular` to `Modular` and `normal` to `Normal` in one separate metadata line, and never mutate or duplicate `product.name`.
- [x] 3.3 Remove any Royo-specific card layout branch and apply one shared image frame, `object-contain` behavior and reserved text block height to every catalog card.
- [x] 3.4 Ensure short and long titles, optional modularity and permitted metadata align within the same card structure without hiding important data or changing image contents.

## 4. Regression Coverage

- [x] 4.1 Add card tests for collection-only Royo titles, absent model/modularity, correct Modular/Normal mapping and no repeated model text.
- [x] 4.2 Add structural tests proving Royo, Espejos, Mamparas/GME and other cards share the same image-frame and text-block classes and preserve API image URLs.
- [x] 4.3 Add or update regression tests proving Espejos, Mamparas/GME, other suppliers and existing filter profiles retain their current titles, filters, URLs and request parameters.
- [x] 4.4 Review the final changed-file list and confirm no landing, Vision, asset, backend, database, SQL, n8n or infrastructure file was modified.

## 5. Validation And Delivery

- [x] 5.1 Run `npm test` and confirm catalog, facet, card and regression tests pass.
- [x] 5.2 Run `npm run lint` and `npm run typecheck` and resolve only issues within the approved catalog scope.
- [x] 5.3 Run `npm run build` and confirm the production build succeeds without live API data.
- [x] 5.4 Review `git diff`, `git status` and the staged file list, preserving all pre-existing user changes.
- [ ] 5.5 Create the descriptive commit `fix(catalog): align Royo filters and cards` after all validation passes.
- [ ] 5.6 Push the current work branch and verify the push result and final commit hash.
