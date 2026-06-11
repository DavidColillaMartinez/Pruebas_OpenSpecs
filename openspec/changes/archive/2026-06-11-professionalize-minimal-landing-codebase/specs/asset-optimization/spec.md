## ADDED Requirements

### Requirement: Heavy assets are optimized
The page MUST NOT reference any image asset larger than 500 KB in its production render. Concretely, `boceto-poster.jpg` MUST be replaced with an optimized poster (WebP or AVIF) under 500 KB, and `logo-area-lrmq.jpeg` MUST be replaced with an optimized logo under 200 KB.

#### Scenario: Production build asset sizes
- **WHEN** the production build is built
- **THEN** the `public/` directory referenced assets are all under their respective size budgets

### Requirement: Images load lazily and have explicit dimensions
Every non-hero `<img>` element MUST have `loading="lazy"` and explicit `width`/`height` attributes (or aspect-ratio classes) to avoid CLS. Hero images MAY be eager but MUST have explicit dimensions.

#### Scenario: User opens the page
- **WHEN** a user opens the page
- **THEN** the browser reserves the correct vertical space for every image before the image data arrives, preventing layout shifts

### Requirement: Fonts are preconnected
The Google Fonts request MUST be served via a `<link rel="preconnect">` to `fonts.googleapis.com` and `fonts.gstatic.com`, plus a `<link rel="stylesheet">` in `index.html`. The `@import` directive in `styles.css` MUST be removed.

#### Scenario: First paint
- **WHEN** a user opens the page
- **THEN** the browser resolves the font connection in parallel with the HTML and CSS, reducing time-to-first-paint
