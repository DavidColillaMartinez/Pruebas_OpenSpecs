## 1. Narrative Structure And Assets

- [x] 1.1 Select and add the hero public asset candidate, starting with Pexels video `34373823`, with poster/fallback handling.
- [x] 1.2 Define expected Vision asset paths for the user-supplied sketch video, final image, and optional poster under an agreed public or importable location.
- [x] 1.3 Replace the current section order with narrative chapters: Inicio, Coleccion, Reformas, Vision, Contacto.
- [x] 1.4 Remove Metodo from the primary navigation and chapter sequence while preserving its content as Inicio method copy.
- [x] 1.5 Add or isolate a display-font token/class that can later receive the final non-Inter font.

## 2. Scroll Snap And Chapter Progress

- [x] 2.1 Replace global proximity snap with desktop-only mandatory vertical snapping.
- [x] 2.2 Disable or soften mandatory snapping on mobile/narrow viewports so the desktop concept does not become the mobile experience.
- [x] 2.3 Implement a reusable chapter progress hook or local pattern that computes 0-to-1 progress from section scroll position using `requestAnimationFrame`.
- [x] 2.4 Ensure sticky chapter layouts recompute correctly on resize and do not depend on stale viewport measurements.
- [x] 2.5 Replace generic page-wide reveal usage with section-specific animation states tied to chapter progress.

## 3. Inicio Chapter

- [x] 3.1 Redesign Inicio as a full-viewport cover with the hero asset full bleed behind the primary H1.
- [x] 3.2 Keep the initial Inicio state visually minimal: asset plus H1 only, no metrics, cards, or competing CTAs.
- [x] 3.3 Add internal scroll progression that reveals method content as falling or staged copy inside Inicio.
- [x] 3.4 Preserve readable contrast for the H1 and revealed copy across the selected hero asset.
- [x] 3.5 Provide reduced-motion/static fallback for the hero asset and method reveal.

## 4. Coleccion Chapter

- [x] 4.1 Replace collection cards with a staged image/text composition using the existing collection resources.
- [x] 4.2 Animate collection resources in sequence as the user progresses through the Coleccion chapter.
- [x] 4.3 Vary layout and positioning so the collection does not read as a repeated card grid or carousel.
- [x] 4.4 Keep each collection item accessible with meaningful image alt text and readable copy.
- [x] 4.5 Verify the collection layout remains coherent on desktop and degrades acceptably on smaller widths.

## 5. Reformas Chapter

- [x] 5.1 Redesign Reformas into a stable desktop two-column scene with video on the left and project story on the right.
- [x] 5.2 Preserve scroll-scrub video playback and existing play/pause and scrub controls.
- [x] 5.3 Add concrete invented project details: location, duration, scope, and satisfaction/result.
- [x] 5.4 Add optional progress chapter labels for renovation stages if they improve clarity without clutter.
- [x] 5.5 Confirm sticky/video behavior does not break inside the mandatory snap chapter.

## 6. Vision Chapter

- [x] 6.1 Build Vision as a two-phase scene: sketch video first, before/after slider after completion.
- [x] 6.2 Start sketch video playback when Vision enters the active chapter, using muted and `playsInline` playback.
- [x] 6.3 Freeze or preserve the final sketch frame after the sketch video ends.
- [x] 6.4 Implement a horizontal before/after slider showing sketch on one side and final image on the other.
- [x] 6.5 Make the slider keyboard-operable and expose appropriate labels or range semantics.
- [x] 6.6 Add scroll-progressive writing/reveal behavior for Vision supporting text after the sketch moment.
- [x] 6.7 Provide reduced-motion behavior that shows static sketch/final comparison without requiring animated playback.

## 7. Contact And Navigation Polish

- [x] 7.1 Update navigation labels and active-section tracking to match the new chapter sequence.
- [x] 7.2 Redesign Contact as a closing decision scene consistent with the new narrative, not a generic landing-page CTA card.
- [x] 7.3 Ensure skip-to-content, Escape menu closing, and outside-tap menu behavior still work after restructuring.
- [x] 7.4 Update metadata or visible brand title if the new display title changes from Bath Studio.

## 8. Verification

- [x] 8.1 Run `npm run build` and fix build errors.
- [x] 8.2 Manually verify desktop snapping through Inicio, Coleccion, Reformas, Vision, and Contacto.
- [x] 8.3 Manually verify reduced-motion mode exposes all content without depending on scroll animations.
- [x] 8.4 Manually verify keyboard access for navigation, video controls, and Vision slider.
- [x] 8.5 Run an Impeccable critique or polish pass on the redesigned `src/App.jsx` and address P0-P1 findings.
