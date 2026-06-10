## Context

The current landing page is implemented as a single React surface in `src/App.jsx` with global styles in `src/styles.css`, Tailwind tokens, section-level proximity snap, and a generic intersection-observer reveal system. The previous Reformas work added a scroll-scrub video, but it sits inside the page as an added module rather than as part of a full narrative system.

The redesign moves the desktop experience toward a controlled brand sequence: each viewport-sized chapter has a specific story action. The site should feel closer to a short spatial film than a conventional product landing page. Mobile is intentionally not solved by copying the desktop behavior; it remains a separate adaptation track.

## Goals / Non-Goals

**Goals:**

- Build a desktop-first fixed snap narrative with mandatory chapter transitions.
- Replace generic reveal animation with section-specific scroll choreography.
- Use a public bathroom asset for the first-screen `Inicio` cover that contrasts with the current soft porcelain look.
- Remove the separate `Metodo` snap and integrate method content into the internal progression of `Inicio`.
- Replace collection cards with a sequential falling composition using existing collection resources.
- Redesign Reformas as a stable proof layout with video left, project narrative right, and scroll-scrub playback preserved.
- Redesign Vision around a sketch video that plays on section entry, freezes on its final frame, then reveals a before/after slider from sketch to final image.
- Keep reduced-motion, keyboard access, and semantic navigation usable despite the cinematic behavior.

**Non-Goals:**

- Mobile-specific redesign is out of scope beyond preserving basic usability and avoiding catastrophic layout breakage.
- Final font selection is out of scope unless the font asset or service is provided; the implementation should support replacing the display font later.
- Building a Remotion rendering pipeline is out of scope unless browser-native video and CSS clipping cannot satisfy the Vision interaction.
- Rewriting the project into a routing or component-library architecture is out of scope.

## Decisions

### Decision: Use Native Sticky Chapters Instead Of A Heavy Scroll Library

Use React state, refs, `IntersectionObserver`, scroll listeners throttled with `requestAnimationFrame`, CSS sticky positioning, and CSS custom properties for progress-based animations.

Rationale: the current app has no motion dependency and the required interactions can be done with browser primitives. This keeps bundle size low and avoids adopting a large animation framework before the desktop concept is proven.

Alternative considered: GSAP ScrollTrigger or another scroll animation library. This would simplify timelines but add dependency and integration weight. Reserve it for a later pass if native implementation becomes brittle.

### Decision: Use Mandatory Snap On Desktop Only

Desktop viewports should use `scroll-snap-type: y mandatory`, while smaller/mobile viewports should avoid strict mandatory snapping.

Rationale: the requested experience is intentionally desktop-first and cinematic. Mandatory snap can feel broken on touch devices when combined with sticky scroll sections, media controls, and draggable sliders.

Alternative considered: apply mandatory snapping globally. Rejected because mobile was explicitly deferred to a different concept and strict snap would likely degrade touch usability.

### Decision: Model Each Section As A Chapter With Internal Progress

Each narrative section should expose a chapter progress value from 0 to 1 derived from scroll position inside the section. The visible content remains sticky while internal elements animate according to progress.

Rationale: this resolves the tension between fixed snap sections and within-section storytelling. The user perceives a fixed viewport, but the section has enough scroll distance to complete its story before the next snap.

Alternative considered: simple `100vh` sections with one-time reveals. Rejected because it would show sections rather than let them tell a story.

### Decision: Treat Metodo As Inicio Content

The standalone Metodo section should be removed from the chapter order. Its content becomes the scroll-revealed logic inside Inicio.

Rationale: the method is not a destination, it is the brand's opening argument. Revealing it inside the hero makes the first snap useful without adding another conventional content block.

Alternative considered: keep Metodo as a separate snap. Rejected because it interrupts the requested chapter flow and repeats the current landing-page structure.

### Decision: Use Pexels Video 34373823 As Initial Hero Candidate

Use the public Pexels video “Modern industrial bathroom with exposed brick” as the first hero asset candidate, pending download and fit testing.

Rationale: it contrasts the existing warm-white/soft-minimal page, introduces material texture, and can carry a restrained display title without becoming generic showroom imagery.

Alternative candidates: Pexels `34236997` for a cleaner glass-door bathroom, `9166291` for a more abstract shower-head mood, and `37296798` for a more distinctive checkered bathroom.

### Decision: Make Vision A Two-Phase Interaction

Vision first plays the provided sketch video when the user reaches the snap. After the video ends, the UI freezes on the final sketch frame and enables a horizontal before/after slider between the sketch and final image.

Rationale: this mirrors the requested story: drawing first, then comparison. It avoids showing the final image too early and gives the user a tangible control over the reveal.

Alternative considered: show slider immediately with an animated overlay. Rejected because it weakens the sketch-video moment.

### Decision: Keep Remotion Optional

Do not add Remotion unless the supplied sketch/final assets require generating or precomposing video frames outside the browser.

Rationale: the requested Vision flow can be served by a normal `<video>` for the sketch animation plus CSS clipping for the slider. Remotion is powerful but unnecessary if the asset already exists.

Alternative considered: introduce Remotion now. Rejected because it adds build and rendering complexity before a clear need exists.

## Risks / Trade-offs

- Strict desktop snap can feel scroll-jacked → limit mandatory snap to desktop, provide clear section progression, and keep keyboard navigation intact.
- Sticky chapter progress can desynchronize on resize → recompute measurements on resize and avoid hard-coded viewport assumptions where possible.
- Hero public video may be too heavy or visually busy → test fit, use a poster/fallback, and choose an alternate Pexels candidate if contrast or readability fails.
- Unknown display font can delay visual completion → implement a display-font token and use a temporary non-Inter fallback until the final font is supplied.
- Vision assets are not yet present → design the component to look for agreed paths under `assets/boceto/` or `public/boceto/` and document placeholder behavior during implementation.
- Video autoplay may fail if not muted or not inline → sketch video and hero video must be muted, `playsInline`, and provide visible fallback states.
- Reduced-motion users may miss the narrative → provide static chapter states, normal video controls, and non-animated text equivalents.
