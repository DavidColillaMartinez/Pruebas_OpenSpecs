## Why

The current `MobileSections()` rendering of the AREA LRMQ landing page is broken on phones and tablets: it does not match the minimal mode that the desktop experience now uses, and it leaks visual artefacts (Boceto / Final labels, card-style cards, dark Contact card, oversized Inicio hero) that the desktop has long retired. The desktop narrative flow is correct and should not be touched, but the small/medium viewport path needs to be rebuilt so it tells the same story with the same calm, precise, premium register, on a layout that does not depend on a fixed chapter controller.

## What Changes

- Rebuild `MobileSections()` so it follows the **minimal** mode as the canonical mobile/tablet design language: white background, left gold borders, low surface decoration, raw minimal logo mark, and the same display/typography system as desktop.
- Stop activating the desktop `narrative` flow on tablets. Tablets should also follow the stacked, scroll-driven `MobileSections` flow. Keep the desktop narrative locked to a viewport that is wide enough and tall enough to support the controlled experience.
- Fix Inicio mobile: simplify to a centered logo + heading, drop the dark hero stack and the forced three-card method strip, and let the brand mark breathe against the white minimal background.
- Fix Visión mobile/tablet: replace the static image + "Boceto / Final" split with the actual `boceto-video.mp4` + reveal interaction in a vertical layout. Preserve the manual compare slider for keyboard/pointer users. Drop the redundant corner labels.
- Fix Reformas mobile/tablet: keep the video + copy, but apply minimal surface treatment (left border accents, no heavy card frames) and make sure the progress bar still reaches 100% when the video ends.
- Fix Contacto mobile/tablet: surface real address/phone/Instagram/WhatsApp data with minimal treatment, no dark card, and ensure tap targets and form fields meet accessibility guidance.
- Refresh Colección mobile/tablet to follow minimal: reduce card count, favor left-bordered blocks, keep one strong lead image.
- Audit accessibility (semantic landmarks, heading order, focus visibility, labels, contrast, reduced motion, touch targets) and SEO basics (titles, description, Open Graph, local SEO metadata, image alts) without altering the desktop flow.

## Capabilities

### New Capabilities
- `mobile-minimal-layout`: canonical mobile/tablet experience that mirrors the minimal mode design language, replaces the legacy `MobileSections`, and uses stacked scroll-driven sections (no narrative controller, no chapter blocking).
- `responsive-breakpoints`: rules that decide when the desktop narrative renders and when the stacked mobile/tablet experience renders, plus support for tablet.
- `accessibility-baseline`: a11y expectations applied to the whole site (semantic landmarks, headings, focus states, labels, contrast, reduced motion, tap targets, skip link) verified for both desktop and mobile/tablet.
- `seo-baseline`: SEO expectations applied to the whole site (title, description, Open Graph, local business metadata, image alts, sitemap/robots strategy) verified for both desktop and mobile/tablet.

### Modified Capabilities
- `scroll-narrative-landing`: requirement change to clarify that the narrative controller is only active on a wide-enough desktop viewport; on small/medium viewports the page MUST use the stacked minimal layout instead of the narrative flow. The desktop chapter behavior itself is unchanged.

## Impact

- `src/App.jsx`:
  - `useNarrativeScroll` and chapter-rotation logic stay intact for desktop. The viewport gate that decides between narrative and stacked rendering becomes more conservative (tablet included in stacked path).
  - `MobileSections()` is rewritten to render five minimal-style stacked sections in the same order (Inicio, Colección, Reformas, Visión, Contacto) with real assets and accessibility attributes.
  - `Header` mobile menu still functional; minimal mode toggle is allowed on mobile/tablet (parity with desktop) and applies a white body background.
- `src/styles.css`: minor resets/responsiveness polish (e.g. mobile body overflow, minimal background, font sizing scale per breakpoint). No removal of reduced-motion rules.
- `index.html`: tighten `<title>`, refine meta description, add local/OG metadata for the brand. Image alts already exist; we will verify and complete them.
- New public assets: none required. Reuses `public/boceto-video.mp4`, `public/boceto-final.png`, `public/reforma-bano.mp4`, `public/logopng.png`, `public/logo-area-lrmq.jpeg`.
- No new dependencies.
- No breaking API or data changes. Visual behavior changes on small/medium viewports only.
