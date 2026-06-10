## 1. Breakpoint gating

- [x] 1.1 Update `useNarrativeScroll` so `isDesktop` requires `width >= 1024` AND `height >= 720` (replace the current `innerWidth >= 768` gate).
- [x] 1.2 Add a `matchMedia` listener for `(min-width: 1024px)` and a resize listener that re-evaluates the gate on viewport change.
- [x] 1.3 Verify `App` only mounts the narrative `div` and `ChapterDots` when the gate is met; otherwise render `<MobileSections />`.

## 2. Mobile/Tablet shell in Minimal mode

- [x] 2.1 Rewrite `MobileSections()` to render five stacked sections in the order: Inicio, Colección, Reformas, Visión, Contacto.
- [x] 2.2 Apply Minimal visual treatment by default: white surface, raw `logopng.png` logo, `border-l-2 border-clay/30 pl-5` accents, no card shadows.
- [x] 2.3 Apply the `cardless` state from the toggle: when `cardless` is true, body background becomes white and the logo switches to the raw minimal mark; when false, fall back to the existing Tarjetas treatment.
- [x] 2.4 Ensure the mobile/tablet body is natively scrollable (no chapter controller) and respects `prefers-reduced-motion: reduce` (no autoplay, limited transitions).

## 3. Inicio mobile/tablet (Minimal)

- [x] 3.1 Build a centered minimal hero with a subtle optional background image, soft gradient overlay, centered raw logo mark, H1 `AREA LRMQ`, `DESIGN S.L.` tagline, short lead, and a single primary `Pedir asesoría` CTA linking to WhatsApp.
- [x] 3.2 Remove the dark stacked hero and the forced three-card method strip on small viewports; on tablet (>= 768 and < 1024) the method strip can appear as three left-bordered minimal blocks if vertical space allows.
- [x] 3.3 Verify the lead copy wraps without horizontal overflow and uses the mobile font scale (`text-base` / `text-lg`).

## 4. Colección mobile/tablet (Minimal)

- [x] 4.1 Refactor the Colección section to present the four resources as a vertical sequence of minimal blocks with one strong lead image at the top.
- [x] 4.2 Replace the legacy card grid with left-bordered blocks carrying label, title, and short copy.
- [x] 4.3 Confirm the Tarjetas fallback still renders the legacy grid when the user toggles it on.

## 5. Reformas mobile/tablet (Minimal)

- [x] 5.1 Display `reforma-bano.mp4` with native browser controls in a clean rounded container; remove the heavy card frame and inner white overlay.
- [x] 5.2 Show the `Reforma en 21 días.` title, `Proyecto real` label, and the four project facts as a vertical list with clay dot markers sized for mobile reading.
- [x] 5.3 Add a thin 1.5px progress bar that fills to 100% when the video reaches its end (mirroring the desktop fix).
- [x] 5.4 Add a primary `Pedir asesoría` CTA at the bottom with a relevant prefill message.

## 6. Visión mobile/tablet (Minimal + video + reveal)

- [x] 6.1 Replace the static image split and the `Boceto` / `Final` corner labels with the actual `boceto-video.mp4` + `boceto-final.png` assets.
- [x] 6.2 Add a reveal interaction: video plays (when allowed), ends, and a `Revelar` button switches the section to a compare state. The compare state MUST work for both pointer and keyboard users.
- [x] 6.3 Disable autoplay and show a poster with a `Reproducir boceto` button on reduced motion or low-end devices.
- [x] 6.4 Layout the section as a vertical stack: heading, lead, video/reveal, compare.

## 7. Contacto mobile/tablet (Minimal + real data)

- [x] 7.1 Render `ADDRESS`, `PHONE`, `PHONE_INTL`, `INSTAGRAM_URL`, and `MAPS_URL` as accessible rows with working links (`tel:`, `https://wa.me/...`, `https://www.instagram.com/...`, `https://maps.google.com/?q=...`).
- [x] 7.2 Drop the dark contact card; use a left-bordered minimal block instead.
- [x] 7.3 Add a minimal form (Nombre, Teléfono, Mensaje) with `aria-label` on every input, `aria-required` where appropriate, and a submit that opens `https://wa.me/${PHONE_INTL}?text=...` with the encoded form data.

## 8. Header, navigation, and a11y baseline

- [x] 8.1 Confirm the `Saltar al contenido` link is the first focusable element on mobile too and is visually hidden until focused.
- [x] 8.2 Ensure the hamburger drawer is dismissible with Escape and outside click and that body scroll is locked while open.
- [x] 8.3 Set `lang="es"` on `<html>` and verify all interactive header elements have at least 44px hit area on mobile.
- [x] 8.4 Audit heading order: one `<h1>` (Inicio), one `<h2>` per section, no skipped levels; add `aria-labelledby` to each section.
- [x] 8.5 Verify CSS does not remove outlines globally; add a visible focus ring (clay) on every interactive element with at least 3:1 contrast.
- [x] 8.6 Audit text contrast on white (ink/graphite/clay) and adjust any failing combination to meet WCAG AA.

## 9. SEO baseline

- [ ] 9.1 Set a unique `<title>` under 60 characters and a unique `<meta name="description">` under 160 characters in `index.html`.
- [ ] 9.2 Add Open Graph metadata (`og:title`, `og:description`, `og:type=website`, `og:image`, `og:url`, `og:locale=es_ES`).
- [ ] 9.3 Add Twitter card metadata (`twitter:card=summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image`).
- [ ] 9.4 Embed a `LocalBusiness` JSON-LD with real `ADDRESS`, `PHONE`, and `INSTAGRAM_URL` constants.
- [ ] 9.5 Add a canonical link element and a `theme-color` meta tag consistent with the brand clay color.
- [ ] 9.6 Audit every `<img>` on the page: meaningful `alt` text, or `alt=""` + `aria-hidden="true"` for decorative images.

## 10. Build verification and commits

- [ ] 10.1 Run `npm run build` after each task group; fix any build error before commit.
- [ ] 10.2 Make small, reversible commits per task group (e.g. `Fix mobile breakpoints`, `Rebuild mobile Inicio as minimal hero`, `Add mobile Visión video + reveal`).
- [ ] 10.3 Do a final manual sweep on phone and tablet viewports; verify the desktop narrative is unchanged.
