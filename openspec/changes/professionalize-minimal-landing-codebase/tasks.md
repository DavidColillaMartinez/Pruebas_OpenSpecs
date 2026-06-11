## 1. Phase 1 — Default state and dead code cleanup

- [x] 1.1 In `src/App.jsx`, change the `useState(false)` for `cardless` to `useState(true)`. Verify the header toggle label on first paint is "Tarjetas".
- [x] 1.2 Remove `skipBlocked` from `useNarrativeScroll` (callback, return value, and any consumer in `App`).
- [x] 1.3 Remove the unused `chapterLabels` array declared inside `useNarrativeScroll`.
- [x] 1.4 Remove the redundant destructuring of `skipBlocked` in `App`.
- [x] 1.5 Confirm `npm run build` is green. Commit as `Phase 1: make minimal the default and remove dead hook state`. Stop and wait for confirmation before phase 2.

## 2. Phase 2 — Responsive header rewrite

- [x] 2.1 Split `Header` into two render branches gated by viewport: a desktop branch and a mobile/tablet branch. Hide the horizontal nav and the desktop "Pedir asesoría" pill below the desktop gate.
- [x] 2.2 Add a `MobileDrawer` component that exposes the four sections, the visual mode toggle, and the WhatsApp CTA. Wire it to the existing hamburger control.
- [x] 2.3 Derive `isInicio` from `activeSectionId` on both viewports, not from a sticky desktop assumption. In Inicio (id `inicio`) the header is in Inicio style; in any other section it is in the other style.
- [x] 2.4 Make the drawer dismissible with Escape, outside click, and a close button. Lock body scroll while open. Mirror accessibility baseline: focus ring, 44px tap target, accessible name.
- [x] 2.5 Verify header on phone (375px), tablet (768px and 1024px), and desktop (1280x800, 1440x900). Confirm `npm run build` is green. Commit as `Phase 2: responsive header with mobile drawer`. Stop and wait for confirmation before phase 3.

## 3. Phase 3 — Mobile Visión and Reformas bugfixes

- [x] 3.1 Refactor `MobileVision` into a state machine with `idle`, `playing`, `reveal`, and `compare` states. Start in `idle` on every mount.
- [x] 3.2 Remove autoplay on `MobileVision` mount. The user MUST press "Reproducir boceto" (or the video `controls`) to start.
- [x] 3.3 On `prefers-reduced-motion: reduce`, the section MUST start in `idle` and the video MUST NOT autoplay. The state machine is still usable.
- [x] 3.4 Wire the `ended` event to transition to `reveal`. Clicking "Revelar" transitions to `compare`. In `compare`, render the slider with `role="slider"` and keyboard arrow support. In other states, the slider is not in the DOM and not focusable.
- [x] 3.5 In `MobileReformas`, store the `timeupdate` and `ended` handlers in named constants and remove BOTH listeners in the cleanup. Verify the progress bar reaches 100% when the video ends.
- [x] 3.6 In `MobileReformas`, remove the unrelated `boceto-poster.jpg` and either use a Reforma-themed poster or remove the `poster` attribute. Add `preload="metadata"` if not present.
- [x] 3.7 Confirm `npm run build` is green. Commit as `Phase 3: stabilize mobile vision reveal and reformas progress`. Stop and wait for confirmation before phase 4.

## 4. Phase 4 — Codebase refactor

- [x] 4.1 Create `src/data/` with `business.js`, `categories.js`, `methodSteps.js`, `projectFacts.js`, `copy.js`. Move the constants and copy from `App.jsx` into these modules.
- [x] 4.2 Create `src/hooks/` with `useNarrativeScroll.js`, `useMediaGate.js`, `useCompareSlider.js`, `usePrefersReducedMotion.js`. Move the hooks from `App.jsx`.
- [x] 4.3 Create `src/components/` with `LogoMark`, `Header`, `MobileDrawer`, `Button`, `GoldLabel`, `SectionTitle`, `CompareSlider`, `ProgressBar`, `ProjectFacts`, `ContactLinks`, `ContactForm`, `MobileSectionShell`. Extract the JSX and the shared classes.
- [x] 4.4 Create `src/sections/desktop/` and `src/sections/mobile/` with the existing five sections each. The mobile versions of `Inicio`, `Coleccion`, `Reformas`, `Vision`, `Contacto` live in `src/sections/mobile/`. The desktop versions live in `src/sections/desktop/`.
- [x] 4.5 Reduce `src/App.jsx` to a thin entry that wires data, hooks, and section components. It MUST be short and declarative.
- [x] 4.6 Move `src/styles.css` content into `src/styles/index.css` and `src/styles/utilities.css` if it helps. Keep the global `body` reset and the reduced-motion rules.
- [x] 4.7 Confirm `npm run build` is green. Commit as `Phase 4: split src/ into data, hooks, components, sections, styles`. Stop and wait for confirmation before phase 5.

## 5. Phase 5 — Mobile minimal polish

- [ ] 5.1 Replace the `<a>` masquerading as a submit in `MobileContacto` with a real `<form>` whose `onSubmit` calls `e.preventDefault()` and opens WhatsApp with the encoded form data. Required fields MUST be enforced.
- [ ] 5.2 Add visible `<label>` with `<span>` text and matching `for`/`id` pairs to every contact form field. Keep the `aria-label` for assistive technology as a backup. Mark required fields with both `aria-required` and `required`.
- [ ] 5.3 Refine the mobile minimal section spacing rhythm so that sections breathe differently. Hero sections get more vertical air; transitional sections stay tighter.
- [ ] 5.4 Verify keyboard navigation through the mobile minimal flow: tab order, focus visibility, drawer escape, and form submission. Confirm WCAG AA contrast for the brand gold accent.
- [ ] 5.5 Confirm `npm run build` is green. Commit as `Phase 5: real contact form and minimal polish`. Stop and wait for confirmation before phase 6.

## 6. Phase 6 — SEO and metadata sync

- [ ] 6.1 Update `<meta name="theme-color">` in `index.html` to `#c1aa67` (the current brand gold). Remove the legacy `#b98364`.
- [ ] 6.2 Replace the hardcoded `linear-gradient(135deg, #d8d0c2, #f8f6f1 45%, #b98364 160%)` in the "Ver ubicación" tiles with a shared brand utility class or a CSS variable that uses the current gold.
- [ ] 6.3 Move the `LocalBusiness` JSON-LD constants into `src/data/business.js`. Generate the JSON-LD at build time or render it via a tiny `BusinessJsonLd` component from the same module. Drop `geo` and `openingHoursSpecification` from the JSON-LD unless the brand confirms the data in the same module.
- [ ] 6.4 Add `<link rel="preconnect">` to `fonts.googleapis.com` and `fonts.gstatic.com` plus the `<link rel="stylesheet">` to load Marcellus and Manrope. Remove the `@import` of Google Fonts from `styles.css`.
- [ ] 6.5 Confirm `npm run build` is green. Commit as `Phase 6: theme color, JSON-LD single source, preconnected fonts`. Stop and wait for confirmation before phase 7.

## 7. Phase 7 — Asset and performance polish

- [ ] 7.1 Replace `public/boceto-poster.jpg` with an optimized WebP or AVIF under 500 KB. Update every `<video poster=...>` reference to the new file.
- [ ] 7.2 Replace `public/logo-area-lrmq.jpeg` with an optimized WebP or AVIF under 200 KB. Keep JPEG as a fallback in `srcset` if the brand prefers broad compatibility.
- [ ] 7.3 Add `loading="lazy"` and explicit `width`/`height` (or aspect-ratio classes) to every non-hero `<img>`. Hero images MAY be eager but MUST have explicit dimensions.
- [ ] 7.4 Housekeep OpenSpec artifacts: either commit the `fix-mobile-tablet-minimal-experience` change's `proposal.md`, `design.md`, and `specs/` files into `main` (preferred), or archive the change. Decide based on the user's preference.
- [ ] 7.5 Final `npm run build` and a manual sweep at phone (375px), tablet (768px, 1024px), and desktop (1280x800, 1440x900). Verify the desktop narrative and the mobile/tablet minimal flow look correct. Commit as `Phase 7: asset optimization and OpenSpec housekeeping`. Stop and report.
