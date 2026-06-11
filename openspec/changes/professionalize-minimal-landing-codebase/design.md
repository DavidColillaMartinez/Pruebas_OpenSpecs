## Context

The AREA LRMQ landing page is a Vite + React + Tailwind single-page experience that has been iterated through four OpenSpec changes (`create-modern-store-landing`, `new-section-reformas`, `redesign-scroll-narrative`, `fix-mobile-tablet-minimal-experience`). It now ships with two visual modes (`Tarjetas` and `Minimal`), a desktop narrative controller, a stacked mobile/tablet experience, a SEO baseline, and an accessibility baseline.

The problem is not features; it is engineering health:
- `src/App.jsx` is a 1011-line file that owns data, hooks, components, and JSX for both desktop narrative and mobile/tablet experiences.
- The default state is `Tarjetas` even though the brand has decided that `Minimal` is the official version.
- The responsive header is split between Tailwind responsive classes and assumptions about which mode the user is in. On mobile, `isInicio` is always `true`, so the Inicio-specific styles leak into every mobile section.
- `MobileVision` has a logic bug where `setShowReveal(true)` and `setVideoDone(true)` happen on the same `ended` event, but the reveal overlay only renders when `showReveal && !videoDone`.
- `MobileReformas` adds an `ended` listener that is never removed.
- The contact form is an `<a>` masquerading as a submit; `required` is never enforced.
- The Google Fonts `@import` in `styles.css` is render-blocking.
- `public/boceto-poster.jpg` is 3.3 MB; `public/logo-area-lrmq.jpeg` is 672 KB.
- `index.html` has `theme-color="#b98364"` and a hardcoded `linear-gradient(... #b98364 ...)` lives in the page.
- The `LocalBusiness` JSON-LD has unverified `geo` coordinates and `openingHoursSpecification`.

Constraints:
- The desktop narrative is approved and must not regress visually.
- The minimal visual language is the canonical one going forward.
- "Tarjetas" is preserved only as a comparison toggle, never as the default.
- No new dependencies, no SSR, no i18n, no Vite plugins that require new build config.
- The implementation MUST be split into 7 phases with checkpoints, and the user MUST confirm before the next phase begins.

Stakeholders:
- Brand: cares about visual identity and conversion.
- Engineering: cares about file size, build time, accessibility, SEO, and long-term maintainability.
- SEO/local: cares about metadata, JSON-LD, and asset performance.

## Goals / Non-Goals

**Goals**
- Minimal is the default and ships clean.
- Mobile/tablet behaves correctly under the desktop gate and looks intentional in the minimal style.
- The codebase is split into `data/`, `hooks/`, `components/`, `sections/`, and `styles/`.
- All bugs in the current mobile components are fixed.
- The contact form is a real form, not an anchor.
- Asset sizes drop. Fonts are preconnected. Images have explicit dimensions.
- `LocalBusiness` JSON-LD data comes from a single JS module.
- Each phase lands as its own commit(s), builds green, and waits for confirmation.

**Non-Goals**
- No change to the desktop narrative's visual language.
- No new dependencies, no SSR, no i18n, no analytics, no CMS, no backend.
- No rewrite in TypeScript.
- No introduction of a state management library; React hooks are enough.
- No redesign of the "Tarjetas" mode; it stays reachable only as a comparison toggle.
- No public search/filtering on the collection; the data is small.

## Decisions

### Decision 1: Cardless default = true
- Rationale: the brand has decided minimal is official. Making minimal the default removes ambiguity and the "no, switch to minimal" friction on first paint.
- Alternative considered: keep the current default and rely on the user to switch. Rejected because every visitor that does not click the toggle is on the wrong visual.

### Decision 2: Header split by viewport, not by mode
- The current header renders differently based on `isInicio` and on the chapter. On mobile, neither of those signals is meaningful, so the header always looks "in Inicio" and the desktop pills leak.
- The new header uses two render branches gated by viewport:
  - **Desktop branch (>= 1024px width AND >= 720px height)**: current narrative header (logo + name + nav + toggle + CTA).
  - **Mobile/tablet branch**: compact logo, hamburger drawer, optional minimal toggle inside the drawer, "Pedir asesoría" pill in the drawer (not in the bar).
- Active section is communicated to the drawer via the same `activeSectionId`, but `isInicio` is computed per-viewport.
- Alternative considered: keep the current single-header JSX and only adjust Tailwind classes. Rejected because the active-section derivation is genuinely wrong on mobile.

### Decision 3: MobileVision reveal/compare is a state machine
- States: `idle` (poster + Reproducir button), `playing` (video playing, no overlay), `reveal` (video ended, "Revelar" overlay shown), `compare` (slider visible, role=slider).
- `idle` is the initial state for every visitor, including those on reduced motion.
- Clicking "Reproducir boceto" transitions to `playing`.
- On `ended`, the component transitions to `reveal`. Clicking "Revelar" transitions to `compare`.
- The slider `role` and `tabIndex` are only present in `compare`.
- Reduced motion: `idle` is the only state; the video never autoplays, but the user can still press play and proceed through the same state machine.
- Alternative considered: keep the autoplay path. Rejected because mobile users on data plans, slow networks, or background tabs pay the cost without consent.

### Decision 4: MobileReformas listener cleanup
- Use a single `useEffect` that owns the listeners. Store handlers in named consts and remove both `timeupdate` and `ended` in the cleanup.
- `useEffect` re-runs only when the user re-enters the section.
- A `key` on the section component, or a remount on `isActive` change, prevents stale state.
- Alternative considered: keep anonymous handlers and rely on a function ref. Rejected because named handlers are easier to read and remove.

### Decision 5: Working contact form
- Replace the `<a>` with a `<form>` whose `onSubmit` calls `e.preventDefault()` and opens WhatsApp via `window.open` (or a regular anchor click).
- Each field is a real `<label>` with a `<span>` text, and the `<input>` keeps `aria-label` for screen readers as a backup.
- `required` is enforced by the form.
- Reduced motion: no animation changes needed.
- Alternative considered: keep the `<a>` and just call `e.preventDefault()` on click. Rejected because `required` is never enforced that way, and screen readers do not announce the form.

### Decision 6: `src/` tree
- New layout:
  ```
  src/
  ├─ main.jsx
  ├─ App.jsx
  ├─ data/
  │  ├─ business.js    # PHONE, PHONE_INTL, ADDRESS, MAPS_URL, INSTAGRAM_URL, hours (TBD), geo (TBD)
  │  ├─ categories.js
  │  ├─ methodSteps.js
  │  ├─ projectFacts.js
  │  └─ copy.js
  ├─ hooks/
  │  ├─ useNarrativeScroll.js
  │  ├─ useMediaGate.js
  │  ├─ useCompareSlider.js
  │  └─ usePrefersReducedMotion.js
  ├─ components/
  │  ├─ LogoMark.jsx
  │  ├─ Header.jsx
  │  ├─ MobileDrawer.jsx
  │  ├─ Button.jsx
  │  ├─ GoldLabel.jsx
  │  ├─ SectionTitle.jsx
  │  ├─ CompareSlider.jsx
  │  ├─ ProgressBar.jsx
  │  ├─ ProjectFacts.jsx
  │  ├─ ContactLinks.jsx
  │  ├─ ContactForm.jsx
  │  └─ MobileSectionShell.jsx
  ├─ sections/
  │  ├─ desktop/
  │  │  ├─ Inicio.jsx
  │  │  ├─ Coleccion.jsx
  │  │  ├─ Reformas.jsx
  │  │  ├─ Vision.jsx
  │  │  └─ Contacto.jsx
  │  └─ mobile/
  │     ├─ Inicio.jsx
  │     ├─ Coleccion.jsx
  │     ├─ Reformas.jsx
  │     ├─ Vision.jsx
  │     └─ Contacto.jsx
  └─ styles/
     ├─ index.css      # tailwind base/components/utilities
     └─ utilities.css  # shared utilities
  ```
- `App.jsx` becomes a thin entry that wires data, hooks, and section components.
- The "Tarjetas" mode is preserved only for comparison via a debug flag (e.g., `?tarjetas=1` in the URL or a `localStorage` key). In production builds without that flag, the canonical branch is the only one.
- Alternative considered: keep a single `App.jsx`. Rejected because the file is already hard to navigate and the next iteration will be harder.

### Decision 7: JSON-LD and metadata from a single source
- All brand data lives in `src/data/business.js`. The JSON-LD is generated from it and injected either at build time (a small Vite plugin or a script run before `vite build`) or at runtime (a tiny `BusinessJsonLd` component that renders the JSON-LD from the same module).
- The runtime approach is simpler and avoids a new Vite plugin. Trade-off: the JSON-LD arrives with the React render. For an SPA, that is acceptable; the JSON-LD is also useful when the SPA hydrates.
- `geo` and `openingHoursSpecification` are removed by default. If the brand confirms the data, the same module exposes them.
- Alternative considered: hardcode the JSON-LD again. Rejected because it diverges from the React copy.

### Decision 8: Assets
- The `boceto-poster.jpg` is regenerated as a WebP at <= 500 KB and a fallback AVIF where possible. The `<video poster=...>` references the WebP.
- `logo-area-lrmq.jpeg` is replaced by a WebP (alpha or opaque, depending on the file). If the brand wants a transparent background, the file is converted; otherwise an opaque version is fine.
- The original `assets/Boceto` and `assets/Reformas` files are kept in the repo as backups but not referenced by the production render.
- Alternative considered: do nothing. Rejected because the poster is 3.3 MB and the logo is 672 KB; both are above the Web Vitals "good" thresholds for LCP.

### Decision 9: Fonts
- Move the Google Fonts load from `styles.css` `@import` to `<link rel="preconnect">` and `<link rel="stylesheet">` in `index.html`. This unblocks the render path and aligns with the SEO baseline.
- Alternative considered: keep `@import`. Rejected because it is render-blocking and produces a flash of unstyled text.

### Decision 10: Phasing
- Phase 1: default and dead code.
- Phase 2: responsive header.
- Phase 3: mobile Visión/Reformas bugfixes.
- Phase 4: codebase refactor.
- Phase 5: mobile minimal polish.
- Phase 6: SEO and metadata sync.
- Phase 7: asset and performance polish.
- Each phase lands as one or more commits, builds green, and waits for explicit user confirmation.

## Risks / Trade-offs

- [Risk] Promoting minimal to default may surprise users who prefer Tarjetas. → Mitigation: keep the toggle visible and labeled clearly. The user can switch back in one click.
- [Risk] Hiding the desktop pills on mobile breaks deep links that scroll-narrative users expect to use. → Mitigation: the mobile drawer exposes the same targets (sections, WhatsApp, toggle).
- [Risk] Removing the autoplay on `MobileVision` may make the section feel less impressive on first scroll. → Mitigation: the poster and the "Reproducir boceto" button communicate that the section is interactive; the reveal+compare still feels premium.
- [Risk] Refactoring `src/App.jsx` into 20+ files makes the change very large. → Mitigation: the refactor is phase 4 and is preceded by smaller, safer phases. Each file move is a sub-task. The refactor MUST NOT change behavior.
- [Risk] Generating JSON-LD at runtime means crawlers that don't run JS won't see it. → Mitigation: the Vite build can also pre-render the JSON-LD at build time via a tiny `BusinessJsonLd` component that renders into `<head>` via a `dangerouslySetInnerHTML` of the same JS object.
- [Risk] Optimizing assets requires the brand to accept a new file format. → Mitigation: keep JPEG as a fallback in `srcset` for older browsers.
- [Risk] Removing `geo` and `openingHoursSpecification` reduces the LocalBusiness completeness score. → Mitigation: re-add them in a follow-up change once the brand confirms the data.
- [Risk] The phase gating requires the user to confirm between phases. → Mitigation: each phase is small enough that the user can review the diff in a few minutes; if the user wants continuous progress, they can opt out of the gating.

## Migration Plan

- All seven phases deploy by merging into `main`. No infrastructure change, no env change, no flag. The brand sees the new behavior on the next deploy.
- Each phase lands as one or more small commits. Phases are independently revertible because they are small and atomic.
- OpenSpec artifact housekeeping: the proposal, design, and specs of the previous `fix-mobile-tablet-minimal-experience` change are committed under their change directory in phase 7, or archived through the OpenSpec archive flow if the user prefers.
- No rollback strategy beyond reverting commits, which is safe because each phase is small and the build is green at the end of each phase.

## Open Questions

- Should the comparison "Tarjetas" mode be exposed only via a query param (`?tarjetas=1`) or via a UI toggle? Currently it is a UI toggle. The OpenSpec change is silent on this; the implementation will keep the UI toggle for parity but document the URL-based flag for staging.
- Should the Contacto form actually validate before opening WhatsApp, or open WhatsApp even with empty fields? Current intent: validate the three required fields, then open WhatsApp.
- Is the brand OK with dropping `geo` and `openingHoursSpecification` from the JSON-LD until they confirm the data? Current intent: drop them by default and add them back in a follow-up.
- Should the Visión video autoplay on desktop (current behavior) or follow the same manual play path as mobile? Current intent: keep the desktop autoplay because the section is part of a controlled narrative flow, but make the reduced-motion path identical to mobile.
