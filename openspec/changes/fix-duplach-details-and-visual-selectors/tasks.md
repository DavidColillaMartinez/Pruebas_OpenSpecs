## 1. Confirm and Preserve the API Contract

- [x] 1.1 Inspect every Duplach detail response and confirm `selector_images.colors[].name`, `code` and `filename` for all conventional models
- [x] 1.2 Preserve typed API swatches, finish maps and family demo paths through normalization without importing assets or inventing fallbacks
- [x] 1.3 Add model tests proving that `color_image_map` is not used as the conventional color swatch source and that private/price fields remain excluded

## 2. Fix the Public Details Disclosure

- [x] 2.1 Replace the public-details markup with a dedicated `div` content container and a visible title `span` inside an accessible disclosure control
- [x] 2.2 Keep the disclosure closed by default and synchronize `aria-expanded`, `aria-controls` and `hidden` when opened or closed by pointer, keyboard or assistive technology
- [x] 2.3 Preserve all existing readable public details while omitting structured values that would render as `[object Object]`, technical fields or prices
- [x] 2.4 Add component tests for initial collapsed state, expansion, collapse and preservation of selected variant/gallery state

## 3. Convert Duplach Measures to a Native Dropdown

- [x] 3.1 Render `measure` as a labelled native `<select>` for Stone Zeus, Stone Plus, Stone Smart, Stone Mio, Stone Side, Stone Sorty, Stone Cach and Stone 3D
- [x] 3.2 Keep the measure select closed by default and populate it only with API-delivered measures in API order
- [x] 3.3 Recalculate dependent texture, color, grille, orientation, family and finish options after a measure change without creating synthetic combinations
- [x] 3.4 Add tests covering measure changes, Stone Plus restrictions and incomplete/nonexistent variant combinations

## 4. Implement Conventional Color Swatch Cards

- [x] 4.1 Parse `selector_images.colors` and resolve each published `filename` through the public `asset_base_url`, matching API names/codes to real variant colors
- [x] 4.2 Replace gallery-image color buttons with image-dominant swatch cards for all compatible colors, preserving a text fallback only when the API has no usable swatch
- [x] 4.3 Make the first activation select the real color and variant while retaining `aria-pressed`, focus styling and the complete main gallery
- [x] 4.4 Make a second activation of the already selected swatch toggle only its enlarged visual state without changing variant identity or promoting the swatch to the main gallery
- [x] 4.5 Expose each color name on hover and keyboard focus through an accessible name, tooltip/label and ARIA state without relying on hover alone
- [x] 4.6 Add component tests for swatch source URLs, color selection, repeated activation, enlarged state, missing-swatch fallback and keyboard accessibility

## 5. Correct Stone 3D Family and Finish Behavior

- [x] 5.1 Remove the separate `Imágenes de demostración · ...` family gallery block from the selector UI
- [x] 5.2 Keep the Stone 3D main gallery on the complete API cover plus all unique family demos before a family is selected
- [x] 5.3 On family selection, rebuild the main gallery from only that family's available API demos and update it when the family changes
- [x] 5.4 Render only finishes belonging to the active family using `finish_image_map[familyKey:finish]` swatches
- [x] 5.5 Apply the same first-click selection and second-click swatch enlargement behavior to finishes without inserting finish swatches into the main gallery
- [x] 5.6 Keep the main gallery on the active family's demos after finish selection and show a non-invented empty state when no demos are published
- [x] 5.7 Add tests for initial all-family demos, family-scoped gallery replacement, family changes, finish scoping, swatch enlargement and absence of the removed block

## 6. Protect Existing Catalog and Budget Behavior

- [x] 6.1 Verify Duplach visual states still emit the real `variantId`, public attributes and budget identity without changing the generic quote store or payload filtering
- [x] 6.2 Add or update regression tests for Royo, Espejos, GME and other existing providers, including their gallery cover order and selector behavior
- [x] 6.3 Confirm landing, Vision, `CompareSlider`, navigation, API/proxy/backend paths and protected assets remain untouched

## 7. Validate and Deliver

- [x] 7.1 Run `npm test`
- [x] 7.2 Run `npm run lint`
- [x] 7.3 Run `npm run typecheck`
- [x] 7.4 Run `npm run build`
- [x] 7.5 Review the unchanged light state against the current baseline on desktop and mobile in a browser
- [x] 7.6 Manually verify disclosure keyboard interaction, measure dropdown, conventional color swatches, repeated swatch enlargement, Stone 3D initial/all-family gallery, family filtering, finish swatches and responsive layout
- [x] 7.7 Inspect `git diff` and `git status` to confirm only permitted frontend/test/OpenSpec files changed and pre-existing unrelated work remains untouched
- [x] 7.8 Create a focused commit and push it only after the affected behavior has been reviewed
