## ADDED Requirements

### Requirement: Complete initial Stone 3D demo gallery
Stone 3D SHALL use the main product gallery to show the API cover and all API-delivered demonstration images from every available finish family when the detail first opens.

#### Scenario: Stone 3D detail opens
- **WHEN** the user enters the Stone 3D detail before selecting a family
- **THEN** the main gallery SHALL contain the API cover followed by every unique published demo image from all available families

#### Scenario: Initial gallery has no selected family
- **WHEN** no family is selected
- **THEN** the gallery SHALL remain complete and the UI SHALL NOT render a separate `Imágenes de demostración · ...` block

### Requirement: Family-scoped Stone 3D gallery
Selecting a Stone 3D family SHALL replace the main gallery contents with only the unique API-delivered demos available for that family.

#### Scenario: Family with demos is selected
- **WHEN** the user selects a family with entries in `family_image_map` or `finish_families[].demo_images`
- **THEN** the main gallery SHALL show only that family's demos in API order, without demos from other families

#### Scenario: User changes the selected family
- **WHEN** the user selects a different family
- **THEN** the main gallery SHALL update to the second family's available demos and SHALL remove the first family's demo images

#### Scenario: Family has no published demos
- **WHEN** the API provides a family with no usable demo image
- **THEN** the UI SHALL not invent or infer an image and SHALL present the documented empty state without adding a fake gallery entry

### Requirement: Finish selection does not contaminate the Stone 3D gallery
Stone 3D finish swatches SHALL remain selector-only assets, while the main gallery SHALL remain scoped to the active family's demos after family selection.

#### Scenario: Finish is selected within a family
- **WHEN** the user selects a valid finish after selecting a family
- **THEN** the main gallery SHALL continue to contain only demos of the active family, the finish swatch SHALL not become a main image, and the real variant selection SHALL be preserved

#### Scenario: Finish swatch is the only finish image
- **WHEN** the API publishes a finish swatch but no product demo for that finish
- **THEN** the swatch SHALL remain visible in the finish selector and SHALL NOT be promoted into the main gallery

### Requirement: Existing gallery behavior remains isolated
The Stone 3D gallery changes SHALL be guarded to Duplach Stone 3D and SHALL not change the gallery, cover order or manual image behavior of other suppliers.

#### Scenario: Existing provider detail opens
- **WHEN** a Royo, Espejos, GME or other existing provider detail is rendered
- **THEN** its current gallery composition and image navigation SHALL remain unchanged

#### Scenario: Conventional Duplach detail opens
- **WHEN** a conventional Duplach model is rendered
- **THEN** its complete product gallery SHALL remain available and Stone 3D family filtering SHALL not run
