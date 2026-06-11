## MODIFIED Requirements

### Requirement: Mobile/Tablet uses the Minimal visual language by default
The mobile/tablet experience MUST render only the Minimal visual treatment in the production build. The legacy "Tarjetas" fallback branches MUST be removed from the mobile/tablet JSX paths and MUST NOT be reachable through a user toggle on mobile/tablet. The desktop comparison toggle is the only way to preview the older look, and it MUST NOT affect the mobile/tablet path.

#### Scenario: Mobile/tablet user opens the page
- **WHEN** a user opens the page on a phone or narrow viewport
- **THEN** the page renders only the Minimal sections; the "Tarjetas" mobile fallback MUST NOT be rendered

#### Scenario: Tarjetas toggle does not affect mobile
- **WHEN** a user toggles the visual mode on mobile/tablet
- **THEN** the mobile/tablet sections continue to render in Minimal style; the toggle is preserved for parity but is documented as a comparison-only control

### Requirement: Inicio mobile/tablet is a centered minimal hero
The mobile/tablet Inicio section MUST be a centered minimal hero with a subtle optional background image, soft gradient overlay, centered raw logo mark, H1 `AREA LRMQ`, `DESIGN S.L.` tagline, short lead, and a single primary `Pedir asesoría` CTA linking to WhatsApp. It MUST NOT contain the dark stacked hero or a forced three-card method strip on small viewports.

#### Scenario: User opens Inicio on a phone
- **WHEN** a user opens Inicio on a phone
- **THEN** the section shows the centered logo, the H1, the tagline, a short lead, and a single primary CTA, with no method cards forcing visible content below

#### Scenario: Lead copy stays readable
- **WHEN** the Inicio hero is rendered on a phone
- **THEN** the lead copy wraps without horizontal overflow and uses a font size that respects the mobile scale

### Requirement: Colección mobile/tablet uses minimal blocks
The mobile/tablet Colección section MUST present the four resources as minimal blocks with one strong lead image, a title, a label, and a short copy. It MUST NOT rely on the legacy card grid.

#### Scenario: User reaches Colección on mobile/tablet
- **WHEN** a user reaches the Colección section on a mobile/tablet viewport
- **THEN** the section presents the four resources as a vertical sequence of minimal blocks with a single lead image at the top

### Requirement: Reformas mobile/tablet shows the renovation video and a minimal story
The mobile/tablet Reformas section MUST display `reforma-bano.mp4` with native browser controls, the `Reforma en 21 días.` title, a `Proyecto real` label, and a vertical list of the four project facts framed by minimal left-bordered blocks. A progress indicator MUST reach 100% when the video reaches its end.

#### Scenario: User watches the Reformas video
- **WHEN** a user plays the renovation video on a mobile/tablet viewport
- **THEN** the video plays with browser-native controls and the progress bar fills to 100% when the video ends

#### Scenario: Project facts are readable
- **WHEN** a user reaches the Reformas section on a mobile/tablet viewport
- **THEN** the four project facts appear as a vertical list with clay dot markers and copy sized for mobile reading

### Requirement: Vision mobile/tablet uses the real sketch video and reveal interaction
The mobile/tablet Vision section MUST use `boceto-video.mp4` and `boceto-final.png`. It MUST NOT use a static split image or the legacy `Boceto` / `Final` corner labels. The section MUST provide a reveal control to switch the video into a compare interaction after the video ends. On reduced motion or low-end devices, the section MUST show a poster and a `Reproducir boceto` button instead of autoplaying the video.

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
The mobile/tablet Contacto section MUST expose the real `ADDRESS`, `PHONE`, `PHONE_INTL`, `INSTAGRAM_URL`, and `MAPS_URL` constants as accessible rows with working links. The contact form MUST be a real submit form that opens WhatsApp with the encoded form data.

#### Scenario: User taps a contact row
- **WHEN** a user taps the WhatsApp row on a mobile/tablet viewport
- **THEN** the system opens `https://wa.me/${PHONE_INTL}` in a new tab or the native WhatsApp app

#### Scenario: User submits the contact form
- **WHEN** a user fills in the contact form and submits
- **THEN** the system opens a `https://wa.me/${PHONE_INTL}?text=...` link with the encoded form data

#### Scenario: Real address is shown
- **WHEN** the Contacto section is rendered on a mobile/tablet viewport
- **THEN** the section displays the real address as a link to the Maps URL
