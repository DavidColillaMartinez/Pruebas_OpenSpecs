## ADDED Requirements

### Requirement: Theme color matches the brand gold
The `<meta name="theme-color">` tag in `index.html` MUST use the current brand gold hex code (`#c1aa67`) and MUST NOT use the legacy clay (`#b98364`).

#### Scenario: Mobile browser chrome
- **WHEN** a user opens the page on a mobile browser
- **THEN** the browser chrome (status bar, address bar) is tinted with the brand gold

### Requirement: LocalBusiness JSON-LD is generated from a single source
The `LocalBusiness` JSON-LD embedded in the page MUST be generated from the same data module that the React components use. The JSON-LD MUST include name, address, telephone, image, url, and `sameAs` (Instagram). The `geo` and `openingHoursSpecification` fields MUST NOT be present unless the brand confirms the data in the same data module.

#### Scenario: Search engine reads structured data
- **WHEN** a search engine parses the page
- **THEN** the JSON-LD reflects the real address, phone, image, and Instagram URL from the data module and does not include unverified `geo` or `openingHoursSpecification`
