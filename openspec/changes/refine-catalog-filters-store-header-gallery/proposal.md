## Why

The catalog currently exposes a full taxonomy before the visitor has selected any context, making large finish, measure, collection, and technical facet lists difficult to understand. Once a model has many images, the product detail gallery also becomes visually dense, while the catalog route lacks a distinctive store presentation and needs a focused responsive and accessibility pass.

## What Changes

- Show only Categoría and Proveedor as general filters on the initial catalog state.
- Activate category- or supplier-scoped dependent filters only after a general context is selected, preserving API-provided values and counts.
- Treat category as one active context rather than introducing multi-category selection.
- Use the developed Mamparas filter profile when GME is selected: Tipo, Modelo, Distribución, and Acabado, limited to the active API context.
- Keep `Accesorios de baño` out of the catalog through the published data source rather than maintaining a frontend hardcoded exclusion list.
- Give the catalog a distinctive Tienda masthead for AREA LRMQ DESIGN S.L. with an approved image, brand reference, and clear store/catalog hierarchy without copying the landing header.
- Replace the all-thumbnail product gallery presentation with a five-thumbnail viewport and complete previous/next navigation for the main image and enlarged view.
- Improve catalog-only responsive behavior, filter scrolling, keyboard interaction, announcements, landmarks, labels, and image navigation.

## Capabilities

### New Capabilities
- `progressive-catalog-store-experience`: Defines context-aware catalog filters, the AREA LRMQ store presentation, responsive/accessibility behavior, and navigable product galleries.

### Modified Capabilities

None.

## Impact

- Affects catalog discovery state and facet presentation, filter components, catalog page presentation, product gallery behavior, responsive styling, accessibility semantics, and catalog tests.
- Consumes the existing public API for facet values, counts, product categories, product images, and image ordering.
- Requires the published data source to remove `Accesorios de baño`; this change does not edit PostgreSQL, n8n, API routes, or import workflows.
- Does not modify landing sections, Vision, user-provided media, protected catalog assets, quote behavior, or unrelated routes.
- Adds no dependency and does not construct image URLs in the frontend.
