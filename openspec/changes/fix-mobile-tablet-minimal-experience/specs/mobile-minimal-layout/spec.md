## ADDED Requirements

### Requirement: Stacked mobile/tablet experience uses Minimal visual language
The page SHALL render a stacked, natively-scrolling experience for viewports below the desktop narrative gate. The visual treatment of that experience SHALL default to the Minimal mode: white surface, raw `logopng.png` logo, left clay/gold borders on text blocks, no card shadows, and the same display/body font system as the desktop.

#### Scenario: Mobile user opens the page
- **WHEN** a user opens the page on a phone or narrow viewport
- **THEN** the page renders five sections stacked vertically with a white background, the raw minimal logo, and section content framed by left clay borders instead of card components

#### Scenario: Tablet user opens the page
- **WHEN** a user opens the page on a tablet portrait viewport
- **THEN** the page renders the same stacked minimal sections used on mobile, with the tablet breakpoint scaling typography and spacing appropriately

#### Scenario: Tarjetas toggle is available on mobile/tablet
- **WHEN** a user toggles the "Tarjetas" / "Minimal" control on a mobile/tablet viewport
- **THEN** the visual treatment of the stacked sections updates to match the chosen mode without breaking the layout

### Requirement: Inicio mobile/tablet is a centered minimal hero
The mobile/tablet Inicio section SHALL be a centered minimal hero with a subtle optional background image, a centered raw logo mark, the H1 `AREA LRMQ`, the `DESIGN S.L.` tagline, a short lead, and a single primary `Pedir asesoría` CTA linking to WhatsApp. It MUST NOT contain the dark stacked hero or a forced three-card method strip on small viewports.

#### Scenario: User opens Inicio on a phone
- **WHEN** a user opens Inicio on a phone
- **THEN** the section shows the centered logo, the H1, the tagline, a short lead, and a single primary CTA, with no method cards forcing visible content below

#### Scenario: Lead copy stays readable
- **WHEN** the Inicio hero is rendered on a phone
- **THEN** the lead copy wraps without horizontal overflow and uses a font size that respects the mobile scale

### Requirement: Coleccion mobile/tablet uses minimal blocks
The mobile/tablet Coleccion section SHALL present the four resources as minimal blocks with one strong lead image, a title, a label, and a short copy. It MUST NOT rely on the legacy card grid.

#### Scenario: User reaches Coleccion on mobile/tablet
- **WHEN** a user reaches the Coleccion section on a mobile/tablet viewport
- **THEN** the section presents the four resources as a vertical sequence of minimal blocks with a single lead image at the top

### Requirement: Reformas mobile/tablet shows the renovation video and a minimal story
The mobile/tablet Reformas section SHALL display `reforma-bano.mp4` with native browser controls, the `Reforma en 21 días.` title, a `Proyecto real` label, and a vertical list of the four project facts framed by minimal left-bordered blocks. A progress indicator SHALL reach 100% when the video reaches its end.

#### Scenario: User watches the Reformas video
- **WHEN** a user plays the renovation video on a mobile/tablet viewport
- **THEN** the video plays with browser-native controls and the progress bar fills to 100% when the video ends

#### Scenario: Project facts are readable
- **WHEN** a user reaches the Reformas section on a mobile/tablet viewport
- **THEN** the four project facts appear as a vertical list with clay dot markers and copy sized for mobile reading

### Requirement: Vision mobile/tablet uses the real sketch video and reveal interaction
The mobile/tablet Vision section SHALL use `boceto-video.mp4` and `boceto-final.png`. It MUST NOT use a static split image or the legacy `Boceto` / `Final` corner labels. The section SHALL provide a reveal control to switch the video into a compare interaction after the video ends. On reduced motion or low-end devices, the section MUST show a poster and a `Reproducir boceto` button instead of autoplaying the video.

#### Scenario: User reaches Vision on a mobile/tablet viewport
- **WHEN** a user reaches the Vision section on a mobile/tablet viewport
- **THEN** the section shows the sketch video, the heading `Del boceto al baño.`, the lead copy, and a reveal control after the video ends

#### Scenario: Reduced motion user reaches Vision
- **WHEN** a user with `prefers-reduced-motion: reduce` reaches the Vision section on a mobile/tablet viewport
- **THEN** the video does not autoplay, a poster image is shown, and a `Reproducir boceto` button is required to start the video

#### Scenario: Corner labels are absent
- **WHEN** the Vision section is rendered on a mobile/tablet viewport
- **THEN** the section does not include the legacy `Boceto` or `Final` corner labels

### Requirement: Contacto mobile/tablet exposes real contact data
The mobile/tablet Contacto section SHALL expose the real `ADDRESS`, `PHONE`, `PHONE_INTL`, `INSTAGRAM_URL`, and `MAPS_URL` constants as accessible rows with working links (`tel:`, `https://wa.me/...`, `https://www.instagram.com/...`, `https://maps.google.com/?q=...`). It MUST NOT use a dark contact card. It SHALL provide a form that pre-fills a `https://wa.me/${PHONE_INTL}?text=...` link on submit.

#### Scenario: User taps a contact row
- **WHEN** a user taps the WhatsApp row on a mobile/tablet viewport
- **THEN** the system opens `https://wa.me/${PHONE_INTL}` in a new tab or the native WhatsApp app

#### Scenario: User submits the contact form
- **WHEN** a user fills in the contact form and submits
- **THEN** the system opens a `https://wa.me/${PHONE_INTL}?text=...` link with the encoded form data

#### Scenario: Real address is shown
- **WHEN** the Contacto section is rendered on a mobile/tablet viewport
- **THEN** the section displays the real address `C. de Aquitania, 69, San Blas-Canillejas, 28032 Madrid` as a link to the Maps URL

### Requirement: Header and navigation work on small viewports
The header SHALL remain usable on small viewports. The "Saltar al contenido" link MUST be the first focusable element of the page on mobile too. The hamburger drawer MUST be dismissible with Escape and outside click. The "Tarjetas" / "Minimal" toggle MUST be available and have at least a 44px tap target.

#### Scenario: User opens the menu
- **WHEN** a user taps the hamburger control on a mobile/tablet viewport
- **THEN** the menu opens, the body scroll is locked, and the menu is dismissible with Escape or an outside click

#### Scenario: Tap targets meet size
- **WHEN** a user views the header on a mobile/tablet viewport
- **THEN** every interactive header element has at least a 44px by 44px hit area
