## ADDED Requirements

### Requirement: Historical catalog header is preserved
The catalog SHALL retain the structure, hierarchy, spacing, navigation, search, filters, and responsive behavior from the Git version immediately before the budget basket change, while allowing a compact selection counter to be added.

#### Scenario: Header comparison precedes implementation
- **WHEN** the header change is implemented
- **THEN** the current header is compared with the pre-basket Git version and only the required basket integration is layered onto the valid historical structure

#### Scenario: Basket counter updates in the header
- **WHEN** a line is added, removed, or its quantity changes
- **THEN** the header counter updates immediately without a page reload

#### Scenario: Responsive navigation remains usable
- **WHEN** the catalog is rendered at desktop, tablet, or mobile widths
- **THEN** navigation, search, filters, and the compact basket action remain available without oversized blocks or clipped controls

### Requirement: Catalog media uses a stable, non-cropping frame
Catalog cards and galleries SHALL reserve a consistent image area, center the API-provided image, preserve its intrinsic proportion, and use `object-fit: contain` without decorative backgrounds or overlays.

#### Scenario: A vertical A4 source is rendered
- **WHEN** a product image has a page-like vertical proportion
- **THEN** the entire image remains visible inside the reserved frame without cropping or distortion

#### Scenario: Different source sizes share a grid
- **WHEN** adjacent products have different image dimensions or proportions
- **THEN** their image frames and card metadata rows remain aligned

#### Scenario: Minimal card surface is rendered
- **WHEN** a card has a valid image
- **THEN** the image is shown without a forced panel, shadow, overlay, or colored rectangle behind it, and the product name/data remain below the frame
