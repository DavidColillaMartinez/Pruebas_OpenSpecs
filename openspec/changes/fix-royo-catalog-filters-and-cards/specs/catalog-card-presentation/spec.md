## ADDED Requirements

### Requirement: Royo card titles use the API model only
An Royo furniture card SHALL use the API-delivered `collection` or explicit model field as its title and SHALL NOT construct a title from `product.name`, modularity, slug, URL or image filename.

#### Scenario: Royo card has a collection
- **WHEN** an exact Royo furniture card contains `collection=Logika`
- **THEN** its title is exactly `Logika`

#### Scenario: Royo card has no model field
- **WHEN** an exact Royo furniture card has no API-delivered collection or explicit model field
- **THEN** the card does not fabricate a model value from another text or asset field

### Requirement: Royo modularity is separate and exact
An Royo furniture card MAY show one metadata line below its title, and SHALL map `modularity=modular` to `Modular` and `modularity=normal` to `Normal` without reversing or duplicating the values.

#### Scenario: Modular Royo card
- **WHEN** the API delivers `modularity=modular`
- **THEN** the card shows `Modular` below the model title and does not repeat the model there

#### Scenario: Normal Royo card
- **WHEN** the API delivers `modularity=normal`
- **THEN** the card shows `Normal` below the model title and does not show `Modular`

#### Scenario: No modularity value
- **WHEN** the API omits or nulls `modularity`
- **THEN** the card does not infer or display a replacement modularity value

### Requirement: All catalog cards share one layout structure
All catalog cards SHALL use the same image frame, reserved image height, text block, minimum text height and title alignment, with `object-contain` and no content crop or distortion.

#### Scenario: Royo modular card layout
- **WHEN** a modular Royo card is rendered beside another catalog card
- **THEN** both cards use the same image-frame and text-block structure, with no horizontal Royo exception

#### Scenario: Different image aspect ratios
- **WHEN** cards receive API images with different natural aspect ratios
- **THEN** the reserved frame remains the shared catalog frame and the images remain uncropped and undistorted

#### Scenario: Short and long titles
- **WHEN** neighboring cards contain titles of different line counts
- **THEN** their text blocks reserve the common minimum height and keep titles aligned without silently removing important information

### Requirement: Existing card data and families remain unchanged
The card presentation change SHALL preserve `product.name`, API image URLs, existing non-Royo titles, existing filters and all landing files.

#### Scenario: Espejos or Mamparas/GME card
- **WHEN** a non-Royo provider card is rendered
- **THEN** its existing title, metadata, image behavior and filter behavior remain unchanged

#### Scenario: Landing files are reviewed
- **WHEN** the change is delivered
- **THEN** no landing, Vision, asset, backend, database, n8n or infrastructure file is modified
