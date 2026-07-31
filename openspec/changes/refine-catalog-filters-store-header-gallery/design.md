## Context

The catalog already has a typed facet contract, URL-backed query state, a global facet cache, an active-query facet cache, and a shared filter panel. `useCatalogDiscovery` currently merges global and active facet options, while `CatalogFilterPanel` renders every non-empty group it receives. That makes the first catalog view noisy and can retain unrelated dependent options after a general context is selected.

The catalog route is visually much plainer than the landing route. The product gallery renders every image thumbnail at once, which becomes a wrapped grid for products such as bath enclosures. The existing mobile filter drawer has its own scroll, but the desktop filter column does not have a viewport-bound scroll region. The route also needs a catalog-only accessibility pass without changing the landing narrative or navigation.

The public API remains the source of truth for option values, labels, counts, product membership, image URLs, and image order. `Accesorios de baño` is expected to be removed from the published data source separately; this change must not add a frontend exclusion list or alter PostgreSQL/n8n.

## Goals / Non-Goals

**Goals:**

- Make the initial filter surface understandable by showing only Categoría and Proveedor.
- Activate dependent filters progressively from the selected category or supplier context.
- Use the developed Mamparas profile when GME is selected, while keeping all option data API-driven.
- Keep category selection single-context and avoid introducing multi-category behavior.
- Give the store route its own AREA LRMQ masthead and improve its responsive/accessibility baseline.
- Present large product galleries through a five-thumbnail viewport with complete ordered navigation in the main and enlarged views.
- Preserve existing product selection, image fallback, navigation, quote, and landing behavior outside this scope.

**Non-Goals:**

- Editing PostgreSQL, n8n, import workflows, API routes, or the published `Accesorios de baño` data.
- Hardcoding GME models, finishes, distributions, compatibility, counts, or image paths.
- Copying the landing `Header` or changing landing sections, Vision, narrative scrolling, or protected media.
- Replacing or re-encoding user-provided images.
- Changing quote submission or product API semantics.

## Decisions

### Separate root filters from dependent profiles

Keep `category` and `supplier` as the only root filter groups. Hide `subcategory`, `collection`, `distribution`, `finish`, `measure`, and `product_kind` while no root context is selected; keep them in the API contract and query model.

Once a root context exists, resolve a dependent filter profile. A selected category takes precedence and selects that category's profile. A selected supplier can activate a developed supplier/category profile even before a category is selected; the current GME supplier context activates the Mamparas profile. If both category and supplier are selected, the category profile is scoped by the supplier query.

The profile defines group order and labels, not option values. The Mamparas profile is `subcategory` as Tipo, `collection` as Modelo, `distribution` as Distribución, and `finish` as Acabado. Options and counts are copied only from the active API facet response.

Alternative considered: render every facet and rely on zero counts. Rejected because zero-count technical and dependent options still overwhelm the initial view and communicate no useful context.

### Stop leaking global dependent options

Retain global facets for root groups so users can change context, but use active-query facets for dependent groups once a root filter is selected. Do not merge global collection, distribution, finish, measure, or product-kind options into an active profile.

When a parent context changes, remove dependent URL selections that are no longer valid for the new active profile. This prevents a hidden stale finish or distribution from silently narrowing results while the UI appears unfiltered. The frontend still never invents or validates values outside the API response.

Alternative considered: hide the groups visually while preserving all dependent query values. Rejected because invisible active filters make result counts and user intent impossible to understand.

### Keep category selection single-context

Render category as a single-choice control and serialize one category value. Selecting a new category replaces the previous category context and recalculates dependent facets. No multi-category intersection UI is introduced.

Alternative considered: retain generic checkbox semantics for category. Rejected because the current user flow has one active catalog category and multi-category results would not have a clear dependent filter profile.

### Treat the data source as responsible for removed categories

The frontend renders category options returned by the API and does not embed a local `Accesorios de baño` blacklist. Once the published database/import data removes that category, it naturally disappears from the general facet. If the API still returns it, validation reports a data-source blocker rather than silently hiding it.

### Give Tienda a separate editorial masthead

Add a catalog-only masthead component rather than reusing the landing `Header`. It uses existing AREA LRMQ branding primitives and an approved existing image source, but composes them as a store editorial panel: brand reference, `Tienda` label, catalog title, short orientation copy, and breadcrumb. Desktop uses an asymmetric image/text composition; mobile stacks the image and text with a bounded height so results remain near the top of the page.

Alternative considered: mount the landing header and hero on `/productos`. Rejected because its navigation and narrative state belong to the landing route and would make the store page feel like a partial landing page.

### Use an indexed five-image gallery window

Normalize gallery display order by `sortOrder`, with original API order as a stable tie-breaker. ProductGallery tracks an active image index rather than rendering every thumbnail at once. It shows at most five contiguous thumbnails and moves the window as previous/next navigation changes the active index.

The main image has previous/next controls, and the enlarged dialog has the same controls. Controls are visually subtle until hover but remain available to keyboard focus and touch. At the ends, the corresponding control is disabled. The existing API-image fallback remains unchanged: selected variant images win when present; otherwise product images remain the gallery.

Alternative considered: paginate thumbnails in batches of five while leaving the active image separate. Rejected because a sliding window keeps the selected thumbnail visible and makes one-step navigation predictable for galleries of any length.

### Improve catalog accessibility without touching the landing

Add a named catalog main region, skip-to-results link, explicit filter/result announcements, meaningful option count labels, stable focus behavior for the mobile drawer, and keyboard-operable gallery controls. Use semantic headings and landmarks for the masthead, filters, results, and gallery. Hover-only affordances must have equivalent focus-visible states.

## Risks / Trade-offs

- [The API does not return facets scoped to the selected root context] -> Keep the profile hidden or report a contract blocker; do not derive values from product names, IDs, or assets.
- [A supplier maps to several categories] -> Prefer an explicitly developed supplier/category profile; if no profile is unambiguous, keep only root filters until the user chooses a category.
- [A dependent URL filter becomes invalid after changing category or supplier] -> Clear only invalid dependent selections and preserve valid root selections.
- [The API returns `Accesorios de baño` after the data cleanup was expected] -> Report the published data-source blocker instead of adding a frontend blacklist.
- [A product has duplicate image URLs or missing sort orders] -> Deduplicate by URL and preserve stable API order as the fallback.
- [Five thumbnails are too dense on narrow screens] -> Use a horizontally clipped thumbnail rail with touch scrolling and accessible previous/next controls.
- [Existing tests depend on generic facet rendering] -> Keep generic root/dependent behavior explicit in fixtures and add regression coverage for non-Mamparas categories.

## Migration Plan

1. Introduce root/dependent facet visibility and profile resolution without changing API payloads.
2. Update query transitions and active facet merging so stale dependent filters cannot remain silently active.
3. Add the catalog masthead, independent filter scrolling, responsive refinements, and accessibility semantics.
4. Replace gallery thumbnail rendering with ordered indexed navigation while preserving the existing image fallback.
5. Add focused tests, run the full test/lint/typecheck/build suite, and review the catalog on desktop, tablet, and mobile against the live published API.

Rollback is a targeted revert of this catalog-only change. No database or API migration is performed by this change.

## Open Questions

- If a future supplier has several developed category profiles but no category is selected, which supplier profile should be preferred? The current scope only requires the developed GME-to-Mamparas behavior.
- Which already-approved existing image source should be selected for the new masthead if the landing background is not reused? No new or re-encoded asset should be introduced.
