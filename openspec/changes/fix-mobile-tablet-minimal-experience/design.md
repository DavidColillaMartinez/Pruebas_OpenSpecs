## Context

The current AREA LRMQ landing page is a Vite + React + Tailwind single page. The home experience is rendered through one of two paths inside `App()`:

- A **desktop narrative** built on `useNarrativeScroll()`, a `chapterSteps` model, and a fixed `100svh` container that translates between chapters. It supports both visual modes (`Tarjetas` and `Minimal`) and was the focus of the recent `redesign-scroll-narrative` change.
- A `MobileSections()` block that renders five native-scroll sections. It was last designed around the previous "Tarjetas" treatment and still includes outdated pieces (Boceto/Final labels, dark contact card, oversized hero stack, video on its own inside a card, separate static compare image).

Constraints:
- The desktop narrative flow must not regress; everything in this change is about parity, polish, and behavior in stacked viewports.
- The chosen visual direction is **Minimal** (white surface, gold/clay accents, left borders, raw logo, low decoration). The "Tarjetas" mobile path can stay as a fallback, but minimal is the canonical one.
- The brand assets and copy are already final; this change should not invent new content but should expose what already exists (`PHONE`, `PHONE_INTL`, `ADDRESS`, `MAPS_URL`, `INSTAGRAM_URL`, `boceto-video.mp4`, `boceto-final.png`, `reforma-bano.mp4`, `logopng.png`, `logo-area-lrmq.jpeg`).
- Existing capabilities under `openspec/specs/` are the desktop narrative (`scroll-narrative-landing`) and the reforms section (`reformas-section`). This change adds new capabilities and modifies the narrative one to clarify viewport gating.

## Goals / Non-Goals

**Goals:**
- Tablet-class viewports fall into the stacked minimal flow, not the desktop narrative.
- Each mobile/tablet section reads as a minimal block: title, short lead, content, optional CTA, generous spacing.
- Inicio, Colección, Reformas, Visión, Contacto all use real assets and real contact data.
- Visión on mobile/tablet uses the actual sketch video with a reveal interaction, not a static split.
- The minimal mode toggle behaves the same on mobile/tablet as on desktop (white body background, raw logo).
- Accessibility: skip link, semantic landmarks, heading order, focus visible, reduced motion respected, tap targets ≥ 44px.
- SEO: title, description, OG, local business metadata, image alts complete.
- Build and design decisions stay reversible, with small commits during implementation.

**Non-Goals:**
- No changes to chapter logic, step mapping, or `useNarrativeScroll` for desktop.
- No new product copy; only re-uses existing strings/constants.
- No new dependencies, no new build tooling, no SSR.
- No "Tarjetas" redesign beyond what is needed to not break mobile/tablet.
- No internationalization.

## Decisions

### Decision 1: Tablet joins the stacked flow
- The current `isDesktop` gate is `window.innerWidth >= 768`. Tablets in portrait (768-1024) enter the narrative flow and feel broken because the controlled experience was designed for ≥ 1280.
- Change the gate to use **both** a minimum width and a minimum height so the narrative only activates on a viewport that can actually host it. Concretely: only desktop-class when `width >= 1024` AND `height >= 720`. Below that, render the stacked mobile/tablet sections.
- Alternative considered: a dedicated "tablet" middle layer. Rejected — adds branching for no user benefit; stacked minimal scales gracefully.
- Why: keeps the desktop narrative pristine and gives tablets a designed path.

### Decision 2: Mobile/tablet sections mirror the minimal mode
- The default visual treatment for `MobileSections()` becomes minimal: white surface, `border-l-2 border-clay/30 pl-5` accent on text blocks, raw `logopng.png` logo, no card shadows on the body. The "Tarjetas" treatment is allowed as a secondary mode only when the user toggles it on the header, but the toggle and its visual effect are validated on mobile/tablet.
- Rationale: the desktop product is already minimal-first; mobile should not feel like a different brand.

### Decision 3: Visión mobile/tablet uses the real video + reveal
- Reuse the desktop Vision's `boceto-video.mp4` + `boceto-final.png` assets.
- Layout: stacked — heading, lead, video, then a "Revelar" button that swaps the video for a vertical compare (boceto above, final below) or a horizontal drag. The drag interaction keeps pointer and keyboard support.
- Drop the `Boceto` / `Final` corner labels that desktop already removed.
- Why: keeps the brand's signature "boceto → baño" reveal in every viewport.

### Decision 4: Inicio mobile/tablet — centered minimal hero
- Replace the dark stacked hero with a centered minimal hero: full-bleed image background (subtle), gradient overlay (lighter than before), centered raw `logopng.png` mark, "AREA LRMQ" + "DESIGN S.L." stacked, a short lead, and a single primary CTA "Pedir asesoría" linking to WhatsApp.
- Drop the bottom "3-step method" cards on small viewports; the lead copy alone is enough on phones. On tablet (≥ 768 and `< 1024`) the steps can appear as three left-bordered minimal blocks if the viewport has enough height.

### Decision 5: Reformas mobile/tablet — minimal two-column stack
- Top: lead "Proyecto real" + title "Reforma en 21 días."
- Below: the `reforma-bano.mp4` in a clean rounded container (no heavy card frame, no inner card with white background overlay).
- Below the video: a vertical list of the four bullet points, each with a small clay dot, minimal spacing.
- Below: a thin progress bar (1.5px tall) that fills to 100% when the video ends (mirroring the desktop fix from the last change).
- Below: a primary CTA "Pedir asesoría" linking to WhatsApp with a relevant prefill.
- Why: the section is the highest-conversion block; minimal framing improves perceived premium quality.

### Decision 6: Contacto mobile/tablet — real data, no dark card
- Render address, phone, WhatsApp, Instagram, and Maps as a vertical list of accessible rows (label + value). Each row is a real link (`tel:`, `https://wa.me/...`, `https://www.instagram.com/...`, `https://maps.google.com/?q=...`).
- Add a minimal form (Nombre, Teléfono, Mensaje) that pre-fills a `https://wa.me/${PHONE_INTL}?text=...` link on submit. Same behavior on desktop, validated on mobile/tablet.
- Drop the dark card surface; replace with a left-bordered minimal block.

### Decision 7: Header behavior on mobile/tablet
- Header is already accessible and includes a hamburger drawer. We will:
  - Ensure the "Saltar al contenido" link is the first focusable element on mobile too.
  - Keep the "Tarjetas" / "Minimal" toggle visible on mobile/tablet; it affects body background and logo treatment consistently.
  - Ensure tap targets are ≥ 44px and the drawer is dismissible with Escape and outside click (already implemented).
- Why: header is shared; we want parity of controls, not a new header.

### Decision 8: Accessibility baseline
- Heading order: one `<h1>` (Inicio), one `<h2>` per section, no skipped levels.
- Landmark structure: `<header>`, `<main>`, `<section>` per chapter with `aria-labelledby` pointing to its heading id, `<footer>` optional but skip link already present.
- Focus: every interactive element receives `focus-visible` ring (clay) and visible outline; do not remove `outline` globally.
- Contrast: all text on white meets WCAG AA (>= 4.5:1 for body, 3:1 for large). Verify clay/ink/graphite combinations. Surface any failure and adjust.
- Tap targets: ensure links and buttons have at least 44px hit area on mobile.
- Reduced motion: the existing `@media (prefers-reduced-motion: reduce)` block in `styles.css` already covers desktop animations. Extend it to also suppress video autoplay on mobile (no autoplay on small viewports) and ensure `Motion`-style fade/slide does not run.
- Forms: every input has a visible label or `aria-label`; required fields flagged.
- Locale: lang="es" on `<html>`.

### Decision 9: SEO baseline
- `index.html`:
  - `<title>` AREA LRMQ Tienda — Baños a medida en Madrid.
  - `<meta name="description">` resumen claro con ciudad, servicios y teléfono.
  - Open Graph (`og:title`, `og:description`, `og:type=website`, `og:image`, `og:locale=es_ES`).
  - Twitter card (`twitter:card=summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image`).
  - LocalBusiness JSON-LD embedded: name, address, telephone, openingHours (placeholder "Horario: L-S 10:00-14:00 / 17:00-20:00"), geo if available, sameAs Instagram URL.
  - Canonical link.
  - Theme color consistent with brand clay.
- Image `alt` attributes: verify every `<img>` has meaningful `alt` text; decorative images use `alt=""` and `aria-hidden="true"`.
- Robots: leave the default (index, follow) unless staging is needed.
- Sitemap: out of scope; can be added in a follow-up.

### Decision 10: Implementation sequencing
- One task per scope: breakpoints, header/menu a11y, Inicio mobile, Colección mobile, Reformas mobile, Visión mobile, Contacto mobile, a11y pass, SEO pass, build verification.
- Each task must leave the build green (`npm run build`) before commit.
- Visual changes get a manual inspection note (not a screenshot test) because the project has no test framework.

## Risks / Trade-offs

- [Risk] Changing the `isDesktop` breakpoint to 1024 might surprise users on small laptops (e.g. 1280x600). → Mitigation: use **both** width and height gates, and verify the gate is `>= 1024` width AND `>= 720` height.
- [Risk] Removing the dark Inicio hero on mobile loses visual contrast with the rest of the page. → Mitigation: keep a subtle full-bleed image with a soft gradient overlay; do not reintroduce heavy overlays.
- [Risk] Visión's video + reveal can be heavy on low-end phones. → Mitigation: do not autoplay the video on mobile; show a poster image and a "Reproducir boceto" button. Reduced motion users get a static final image directly.
- [Risk] SEO metadata with the live Instagram URL might 404 if the account is renamed. → Mitigation: use the constant as the single source of truth and document the constant's location in `design.md`.
- [Risk] The minimal mode toggle on mobile/tablet still flips the body background to white, but some pages in the future might depend on a different surface. → Mitigation: keep the toggle scoped to body background and logo swap only; do not bleed into component-level colors.
- [Risk] `localStorage`/no JS users get a blank body. → Mitigation: keep the `<body>` background declared in `styles.css` as a fallback color matching the brand.

## Migration Plan

This is a code-only change. No data migration. No infrastructure change. No feature flag. Steps:
1. Update breakpoint gating in `useNarrativeScroll` and `App`.
2. Rebuild `MobileSections()` in minimal style.
3. Refresh header focus and skip link.
4. Update `index.html` with SEO metadata and JSON-LD.
5. Adjust `styles.css` only where strictly needed for mobile/tablet behavior.
6. Run `npm run build` after each task. Commit small.
7. No rollback strategy needed beyond reverting commits; OpenSpec archive will capture the spec change after `apply` completes.

## Open Questions

- Do we want to remove the "Tarjetas" toggle from mobile/tablet entirely and only ship Minimal, or keep the toggle for parity? Current intent: keep toggle for parity, but ensure the default state on mobile/tablet is Minimal.
- Do we want a fallback `<noscript>` message pointing users to WhatsApp via a plain link? Probably yes for accessibility; can be a small follow-up.
- Should the Inicio hero keep a full-bleed photo background on mobile, or go pure white minimal? The user's stated direction is minimal-first; leaning toward pure white with the centered logo + heading + lead + single CTA.
