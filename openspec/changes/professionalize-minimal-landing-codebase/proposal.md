## Why

The AREA LRMQ landing page is functionally complete and visually polished in places, but the implementation has accumulated debt as the design iterated: the entire app lives in a single `src/App.jsx` file, the official "minimal" visual mode does not load by default, the responsive header still bleeds desktop styles into the mobile/tablet path, the mobile Visión/Reformas components have logic bugs, and there is leftover residue (unused state, dead branches, stale brand hex codes, oversized assets, dead OpenSpec artifacts). The product works, but it is not yet in the "professional, ships to production" state the brand needs. This change captures the technical, responsive, accessibility, SEO, and code-organization work required to make the minimal version the canonical, shippable experience.

## What Changes

- Promote **Minimal** to the canonical experience:
  - The page MUST load in minimal mode by default. The "Tarjetas" mode is preserved as a comparison/debug toggle and MUST not be the default state.
  - The "Modo sin tarjetas" toggle in the header MUST reflect the new default (label switches from "Minimal" to "Tarjetas" on first paint).
- Fix the responsive header:
  - The horizontal nav and the desktop "Pedir asesoría" pill MUST be hidden on viewports below the desktop gate (`< 1024px` width or `< 720px` height).
  - The hamburger drawer MUST be the only navigation surface on mobile/tablet and MUST be available on every mobile section (not just Inicio).
  - The header MUST derive its "is Inicio" state from the active section in a way that works on both desktop and mobile (no more "always Inicio" in the mobile path).
- Fix `MobileVision`:
  - The video MUST NOT autoplay on mount. The user MUST press "Reproducir boceto" (or rely on the video `controls`) before the video plays.
  - On `prefers-reduced-motion: reduce` the section MUST show a poster and a "Reproducir boceto" button instead of autoplaying.
  - The "Revelar" overlay MUST appear after the video ends, and clicking it MUST switch the section into the compare state. The compare state MUST be keyboard and pointer accessible.
  - The `role="slider"` MUST be present only after the video has finished and the reveal is active, not before.
- Fix `MobileReformas`:
  - The `ended` listener MUST be added and removed correctly so StrictMode and remounts do not duplicate callbacks.
  - The progress bar MUST reach 100% when the video reaches its end.
  - The `poster` attribute MUST match the Reforma video (or be removed if no suitable poster exists).
- Refactor the codebase for maintainability:
  - Move the file layout from a single `src/App.jsx` to a `src/` tree: `data/`, `hooks/`, `components/`, `sections/desktop/`, `sections/mobile/`, `styles/`.
  - Extract reusable components: `LogoMark`, `Header`, `Button`, `GoldLabel`, `SectionTitle`, `CompareSlider`, `ProgressBar`, `ProjectFacts`, `ContactLinks`, `ContactForm`, `MobileSectionShell`.
  - Extract the data constants (`PHONE`, `PHONE_INTL`, `ADDRESS`, `MAPS_URL`, `INSTAGRAM_URL`, `categories`, `methodSteps`, `projectFacts`) into `src/data/`.
  - Extract hooks: `useNarrativeScroll`, `useMediaGate`, `useCompareSlider`, `useInViewport`.
  - Remove dead state, dead refs, dead branches, and unused exports from `useNarrativeScroll` (notably `skipBlocked` and `chapterLabels`).
  - Remove the legacy `Coleccion` / `Reformas` / `Vision` / `Contact` "tarjetas" branches from the desktop narrative and from the mobile sections; keep them only behind the comparison toggle if the user explicitly wants to preview the older look. The production build MUST NOT render them.
- Polish SEO and metadata:
  - Update `<meta name="theme-color">` to `#c1aa67` (the current brand gold).
  - Replace hardcoded `#b98364` and the duplicated `linear-gradient(135deg, #d8d0c2, #f8f6f1 45%, #b98364 160%)` in the "Ver ubicación" tiles with a shared brand utility class.
  - Move the `LocalBusiness` JSON-LD constants to come from a single source of truth in `src/data/business.js` and inject them via a small build-time or runtime script (Vite plugin or inline JSON generated from the same module).
  - Drop the speculative `geo` and `openingHoursSpecification` from the JSON-LD unless the brand confirms them. If kept, the data MUST live in `src/data/business.js` and the JSON-LD MUST be generated from it.
- Polish performance:
  - Replace `boceto-poster.jpg` (3.3 MB) with a WebP or AVIF at a sensible size, and ensure `<img>` and `<video poster=...>` use the smaller file.
  - Replace the `logo-area-lrmq.jpeg` with a smaller WebP/AVIF (the raw logo file is too heavy for a logo).
  - Move the Google Fonts `@import` in `styles.css` to a `<link rel="preconnect">` + `<link rel="stylesheet">` in `index.html` so the request is not render-blocking.
  - Add `loading="lazy"` and `decoding="async"` to all non-hero `<img>` tags.
  - Set explicit `width`/`height` on hero `<img>` and on collection images to avoid CLS.
- Polish the mobile minimal flow:
  - Refine spacing rhythm (`py-20` is uniform; sections should breathe differently).
  - Make the Visión reveal interaction stable (no flicker when switching between reveal and compare).
  - In the Contacto section, surface a real working form (a `<button type="submit">` that calls `e.preventDefault()` and opens WhatsApp with the encoded form data), not an anchor masquerading as a submit.
- Reusable validation: every interactive element MUST still meet 44px tap target, focus-visible ring (clay), and labeled controls. The minimal CTA MUST be the primary WhatsApp link in the hero, in Visión/Reformas, and in Contacto.
- Housekeeping:
  - Move `openspec/changes/fix-mobile-tablet-minimal-experience/proposal.md`, `design.md`, and `specs/` from untracked artifacts to either a real commit (preferred) or archive. Decide based on the `archive` flow.
  - Remove `.agents/` artifacts from the worktree if they should not be tracked. The OpenSpec skills (`.opencode/`) stay.

## Capabilities

### New Capabilities
- `minimal-as-default`: the page loads in Minimal mode and "Tarjetas" is only a comparison toggle, not a production visual.
- `responsive-header`: rules that make the header behave correctly on desktop, tablet, and mobile, with a hamburger drawer as the only nav on viewports below the desktop gate.
- `mobile-vision-reveal-stable`: mobile Visión reveal/compare interaction that does not autoplay, respects reduced motion, and only exposes the slider after the reveal button.
- `mobile-reformas-progress-stable`: mobile Reformas progress bar and listener cleanup that survives StrictMode and remounts.
- `working-contact-form`: a real, accessible, submit-style contact form that opens WhatsApp with the encoded form data.
- `codebase-structure`: a clean `src/` tree organized by `data/`, `hooks/`, `components/`, `sections/`, and `styles/`, with shared data constants and reusable components.
- `asset-optimization`: smaller posters, smaller logo, preconnected fonts, lazy images, explicit image dimensions to reduce CLS.
- `seo-and-metadata-sync`: a single source of truth for business data feeding `<meta>`, JSON-LD, and the contact section.

### Modified Capabilities
- `mobile-minimal-layout`: requirement change to remove the legacy "Tarjetas" fallback from the mobile sections and to keep only the Minimal rendering on mobile/tablet.
- `scroll-narrative-landing`: requirement change to clarify that the narrative controller is only active on a viewport that meets the desktop gate, and that the "Tarjetas" branch is not part of the canonical desktop flow.
- `accessibility-baseline`: requirement change to verify that every interactive element meets 44px tap target and that the contact form has real labels and submit semantics.
- `seo-baseline`: requirement change to source the JSON-LD and `<meta>` data from a single JS module and to remove unverified `geo` and `openingHoursSpecification` data.

## Impact

- `src/App.jsx` is reduced to a thin entry that wires data, hooks, and section components together.
- New `src/data/` files own the brand constants and copy. New `src/hooks/` files own the scroll/slider/gate logic. New `src/components/` and `src/sections/` files own the rendering.
- `src/styles.css` becomes smaller; some utility classes move to `src/styles/utilities.css` or to a `tailwind.config.js` plugin.
- `tailwind.config.js` adds a `clay-gold` token if a second gold is needed; the existing `clay` stays as `#c1aa67`.
- `index.html` adds preconnect, a smaller favicon, and the correct theme-color.
- `public/boceto-poster.jpg` is replaced with an optimized poster (WebP/AVIF, <= 500 KB).
- `public/logo-area-lrmq.jpeg` is replaced with an optimized WebP/AVIF logo.
- `public/LogoMark.png` (40 KB) and the older `assets/Boceto`/`assets/Reformas` originals are kept as backups but no longer used by the production render.
- No new dependencies, no SSR, no internationalization. Vite stays the only build tool.
- The desktop narrative experience is visually preserved. The mobile minimal experience is refactored for clarity and bug fixes. The "Tarjetas" mode stays reachable via the comparison toggle for parity, but is no longer the default.

## Execution Phases

The implementation is split into seven main phases. Each phase lands as one or more commits, builds green, and waits for explicit confirmation before the next phase begins.

1. **Phase 1 — Default state and dead code cleanup**: cardless default `true`, header label reflects it, remove `skipBlocked` and the unused `chapterLabels` from the hook, drop the `?` ternary branches in `App` that depend on stale behavior.
2. **Phase 2 — Responsive header rewrite**: hide horizontal nav and "Pedir asesoría" pill below the desktop gate, hamburger drawer as the only nav on mobile/tablet, `isInicio` derived correctly for mobile, drawer openable from every section.
3. **Phase 3 — Mobile Visión and Reformas bugfixes**: stop autoplay, fix reveal overlay, listener cleanup, real poster, progress reaches 100%.
4. **Phase 4 — Codebase refactor**: introduce `src/data`, `src/hooks`, `src/components`, `src/sections`. Extract `LogoMark`, `Header`, `Button`, `GoldLabel`, `CompareSlider`, `ProgressBar`, `ContactLinks`, `ContactForm`. Reduce `App.jsx` to a thin entry. Legacy "Tarjetas" branches moved behind a debug flag.
5. **Phase 5 — Mobile minimal polish**: spacing rhythm, true contact form, real labels, real submit. Sticky CTA on tablet if it improves conversion without breaking the aesthetic.
6. **Phase 6 — SEO and metadata sync**: theme-color, preconnect, single source of truth for `LocalBusiness` JSON-LD, drop unverified `geo` and `openingHoursSpecification`.
7. **Phase 7 — Asset and performance polish**: optimize `boceto-poster.jpg` and `logo-area-lrmq.jpeg`, lazy images, explicit dimensions, preconnect, housekeep OpenSpec artifacts (commit or archive `fix-mobile-tablet-minimal-experience`).

Each phase ends with a commit and a build. The next phase only starts after the user confirms.
