## ADDED Requirements

### Requirement: Clean catalogue imagery
Catalog cards and galleries SHALL show API-provided catalog pages without colored backing rectangles, decorative overlays or unnecessary shadows. Images SHALL preserve their real portrait ratio and use contain behavior.

#### Scenario: Model card image
- **WHEN** a catalog card renders a Manillons Torrent page image
- **THEN** the image uses the API URL, preserves the A4 ratio, fits with `object-contain` and has no colored panel behind it

#### Scenario: Gallery image
- **WHEN** a detail gallery renders a page image
- **THEN** the page remains uncropped, the active image is readable on mobile and no overlay obscures catalog content

### Requirement: Responsive minimal layout
The catalog SHALL use whitespace, typography and subtle separators for hierarchy while keeping filters, cards and selection controls legible on desktop and mobile. Existing GME interactions SHALL continue to work.

#### Scenario: Desktop catalogue
- **WHEN** the catalog is rendered on a wide viewport
- **THEN** the filter rail, model list and actions remain aligned without nested card surfaces or visual clutter

#### Scenario: Mobile catalogue
- **WHEN** the catalog is rendered on a narrow viewport
- **THEN** filters, cards, gallery controls and budget access remain reachable without horizontal overflow or clipped A4 images
