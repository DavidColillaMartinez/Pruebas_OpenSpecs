## ADDED Requirements

### Requirement: Manifest-backed model gallery
The Espejos detail page SHALL render the model gallery from API-provided image URLs in manifest order. A model SHALL support one, two, three or four images without assuming a fixed gallery length, and changing a variant SHALL not replace the model gallery.

#### Scenario: Gallery cardinality and order
- **WHEN** a product response contains one to four ordered images
- **THEN** the detail page renders exactly those unique images in ascending `sort_order` and keeps the first image as the initial active image

#### Scenario: Swing page order
- **WHEN** the product is `mt-espejos-swing`
- **THEN** its gallery contains the page 158 image first and the page 159 image second, using the URLs returned by the API

#### Scenario: Finish does not change gallery
- **WHEN** the user changes the Acabado in the listing or product detail for an Espejos model
- **THEN** the gallery URL sequence and active model images remain unchanged

### Requirement: Complete configurable variant selection
The product detail SHALL expose configurable fields only from real variants and in the order `dimension`, `finish`, `version`, labelled `Medida`, `Acabado` and `Versión`. A selector SHALL render only when more than one real option exists. The current selection SHALL always identify a complete real variant.

#### Scenario: Single real value
- **WHEN** a model has one value for a configurable field
- **THEN** that field has no selector while its value remains available in the selected variant snapshot and public specifications

#### Scenario: Change preserves compatible attributes
- **WHEN** the user changes one configurable field and a variant exists with all other selected attributes
- **THEN** the selector preserves those other attributes and selects that complete variant

#### Scenario: Change falls back to first compatible variant
- **WHEN** the user changes one configurable field and no variant exists with every previously selected attribute
- **THEN** the selector chooses the first compatible complete variant by `sort_order` and never creates a synthetic combination

#### Scenario: Version semantics
- **WHEN** a model exposes Básica and Plus versions
- **THEN** Básica is represented with standard LED and Plus with TRILED and sensors, and the selected version remains present in specifications and the budget snapshot

### Requirement: Required Manillons Torrent fixtures
The normalized API fixtures SHALL preserve the required model characteristics and expose them through the detail selection and gallery flows.

#### Scenario: Basic fixture
- **WHEN** the product is `mt-espejos-basic`
- **THEN** it is a Canto recto model without LED, has one finish, five measures and two images

#### Scenario: Alba fixture
- **WHEN** the product is `mt-espejos-alba`
- **THEN** it is a Circular model without LED, has four finishes, four measures and two images

#### Scenario: Retro fixture
- **WHEN** the product is `mt-espejos-retro`
- **THEN** it is retroiluminado, has one finish, five measures, Básica and Plus versions, and two images

#### Scenario: Nova fixture
- **WHEN** the product is `mt-espejos-nova`
- **THEN** it is frontal, has three finishes, Básica and Plus versions, four measures and four images

#### Scenario: Tango fixture
- **WHEN** the product is `mt-espejos-tango`
- **THEN** it has integrated TRILED lighting, three finishes, four measures and four images

#### Scenario: Hula fixture
- **WHEN** the product is `mt-espejos-hula`
- **THEN** its Tipo de espejo is Circular while its Forma is Semicircular

### Requirement: Price-free public detail
The Espejos listing, detail response, image metadata rendered by the UI and public variant snapshot SHALL contain no prices.

#### Scenario: Price-free response
- **WHEN** a Manillons Torrent product or variant is normalized
- **THEN** price fields are absent or excluded from displayed specs, cards, detail content and selected attributes

#### Scenario: Price-free UI
- **WHEN** a user browses, configures or requests a quote for an Espejos model
- **THEN** no price, currency amount or source price is rendered in the card, gallery, detail or selection summary
