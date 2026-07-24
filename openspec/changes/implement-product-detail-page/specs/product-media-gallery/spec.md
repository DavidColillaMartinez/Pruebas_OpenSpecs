## ADDED Requirements

### Requirement: Normalize and deduplicate public media
The gallery SHALL use only valid public image URLs from the normalized product and SHALL deduplicate repeated media deterministically.

#### Scenario: Duplicate image entries
- **WHEN** multiple entries resolve to the same public URL
- **THEN** the gallery renders one occurrence in stable order

#### Scenario: Invalid media entry
- **WHEN** an image has no resolvable public URL
- **THEN** it is ignored without breaking the page

### Requirement: Variant-aware media priority
The gallery SHALL prefer images associated with the current selection and SHALL fall back to general product images when the selection has none.

#### Scenario: Variant has own images
- **WHEN** the selected variant provides valid associated images
- **THEN** the gallery switches to that image set

#### Scenario: Variant has no own images
- **WHEN** the selected variant has no valid associated images
- **THEN** the gallery displays general product images

### Requirement: Deterministic active image
The gallery SHALL select its active image using a deterministic rule and SHALL keep the active state valid when the media set changes.

#### Scenario: Gallery initializes
- **WHEN** a non-empty image set loads
- **THEN** the confirmed primary image or first normalized image becomes active

#### Scenario: Current image disappears after variant change
- **WHEN** the current active URL is not present in the new media set
- **THEN** the gallery activates the new deterministic primary image

### Requirement: Operable gallery controls
When multiple images exist, the gallery SHALL let users change the active image with native controls operable by keyboard.

#### Scenario: Select thumbnail
- **WHEN** the user activates a thumbnail button
- **THEN** the corresponding image becomes active and the selected state is communicated

### Requirement: Missing and failed image fallback
The product page SHALL render a meaningful fallback when no image is available or an image fails to load.

#### Scenario: Product has no images
- **WHEN** product and selected variant image sets are empty
- **THEN** a non-breaking product-image fallback is rendered

#### Scenario: Active image fails
- **WHEN** the browser cannot load the active image URL
- **THEN** the fallback replaces it and the rest of the product remains usable

### Requirement: Meaningful alternative text
Product images SHALL have alternative text derived from public product, variant, and image position context.

#### Scenario: Product image renders
- **WHEN** an active image is displayed
- **THEN** its alt text identifies the product and includes relevant selected variant context without repeating technical IDs
