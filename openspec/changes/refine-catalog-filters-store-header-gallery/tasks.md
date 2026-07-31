## 1. Progressive Filter State

- [x] 1.1 Define root filter groups (`category`, `supplier`) and context-dependent profile resolution, including the GME-to-Mamparas supplier profile
- [x] 1.2 Update discovery facet selection so global data keeps only root options while active API facets provide dependent options for the selected context
- [x] 1.3 Make category selection single-context and clear dependent query values that become invalid after category or supplier changes
- [x] 1.4 Add discovery/query tests for the empty state, category context, supplier GME context, category-plus-supplier context, single category replacement, and stale dependent filters

## 2. Filter Panel Behavior

- [x] 2.1 Render only Categoría and Proveedor without a root context, then render the resolved profile with API-provided labels, values, and counts
- [x] 2.2 Render the Mamparas profile in Tipo, Modelo, Distribución, and Acabado order with only active-context options and no Medida or Tipo de producto
- [x] 2.3 Add independent desktop filter scrolling while preserving the mobile drawer scroll lock, focus trap, and touch scrolling
- [x] 2.4 Extend filter tests for progressive visibility, GME activation, Mamparas scoping, single category behavior, counts, long lists, and responsive scroll semantics

## 3. Store Masthead and Catalog Accessibility

- [x] 3.1 Create a catalog-only Tienda masthead using AREA LRMQ branding primitives, an approved existing image source, brand text, store context, catalog title, and breadcrumb
- [x] 3.2 Integrate the masthead without mounting the landing Header or changing landing routes, sections, media, or narrative behavior
- [x] 3.3 Add catalog skip-to-results navigation, named landmarks, result/filter announcements, accessible facet counts, and focus-visible states
- [x] 3.4 Refine desktop, tablet, and mobile catalog layout so the masthead, filters, search, results, and controls avoid clipping and horizontal overflow
- [x] 3.5 Add catalog page tests for masthead landmarks, skip navigation, accessible counts, progressive headings, and responsive-safe structure

## 4. Indexed Product Gallery

- [x] 4.1 Normalize gallery display order by API `sortOrder` with stable original-order fallback while preserving selected-unit versus product-image fallback behavior
- [x] 4.2 Replace the all-thumbnail rendering with a maximum five-thumbnail viewport and previous/next navigation through every image
- [x] 4.3 Add previous/next controls to the enlarged image dialog and keep controls keyboard- and touch-accessible without relying only on hover
- [x] 4.4 Handle image failures, duplicate URLs, empty galleries, and gallery reset when the product or selected image collection changes
- [x] 4.5 Add gallery tests for 23-image navigation, five-thumbnail visibility, ordered navigation, enlarged-view controls, bath product galleries, keyboard focus, and image fallback

## 5. Validation

- [x] 5.1 Run focused catalog tests for query/discovery, filters, catalog page, product gallery, and product detail behavior
- [x] 5.2 Run `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build` without issuing real quote POST requests
- [ ] 5.3 Review the catalog in a browser at desktop, tablet, and mobile widths with the published API available, including filters, header, navigation, image ratios, gallery arrows, keyboard focus, and responsive overflow
- [x] 5.4 Confirm `Accesorios de baño` is absent from the published API or report the data-source blocker without adding a frontend blacklist
- [x] 5.5 Report changed files, tests, build results, visual review evidence, and any real backend/data blocker without modifying PostgreSQL, n8n, routes, or protected assets
