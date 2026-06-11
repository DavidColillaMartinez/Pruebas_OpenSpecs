## MODIFIED Requirements

### Requirement: Page title and meta description
The page SHALL set a meaningful `<title>` and `<meta name="description">` reflecting the brand, the offer, and the city (Madrid). The title MUST be unique and concise (under 60 characters). The description MUST be unique and concise (under 160 characters).

#### Scenario: Search engine crawls the page
- **WHEN** a search engine crawls the page
- **THEN** the page exposes a `<title>` under 60 characters and a `<meta name="description">` under 160 characters that reference the brand, the service, and Madrid

### Requirement: Open Graph and Twitter metadata
The page SHALL expose Open Graph and Twitter card metadata. `og:title`, `og:description`, `og:type`, `og:image`, `og:url`, and `og:locale` MUST be present. `twitter:card`, `twitter:title`, `twitter:description`, and `twitter:image` MUST be present.

#### Scenario: User shares the page on social
- **WHEN** a user shares the page URL on a social platform
- **THEN** the platform renders a preview with the configured title, description, and image

### Requirement: LocalBusiness structured data
The page SHALL embed a `LocalBusiness` JSON-LD script generated from the same data module the React components use. The JSON-LD MUST include name, address, telephone, image, url, and `sameAs` (Instagram). `geo` and `openingHoursSpecification` MUST NOT be present unless the data module exposes them.

#### Scenario: Search engine reads structured data
- **WHEN** a search engine parses the page
- **THEN** the JSON-LD reflects the real address, phone, image, and Instagram URL from the data module

### Requirement: Locale and canonical link
The page SHALL declare `lang="es"` on `<html>` and SHALL expose a canonical link element.

#### Scenario: Browser reads the document language
- **WHEN** a browser parses the document
- **THEN** the document is declared in Spanish and exposes a canonical URL

### Requirement: Image alternative text
Every `<img>` element on the page MUST expose meaningful `alt` text. Decorative images MUST use `alt=""` and `aria-hidden="true"`.

#### Scenario: Screen reader reads images
- **WHEN** assistive technology encounters an image
- **THEN** the image is announced with a meaningful description, or is hidden from the accessibility tree if purely decorative
