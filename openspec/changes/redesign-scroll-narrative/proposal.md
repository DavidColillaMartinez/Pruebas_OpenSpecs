## Why

The current site reads as a polished landing page made of independent blocks, but the new product direction needs a stronger brand experience: fixed desktop snaps where each section tells a chapter of the bathroom renovation story. This change turns the page from a catalog-style presentation into a scroll-led narrative built around atmosphere, material, work-in-progress proof, and visual transformation.

## What Changes

- Replace proximity snapping with a desktop-first fixed snap narrative using mandatory section chapters.
- Redesign `Inicio` as a full-viewport brand cover with a public bathroom video/image asset, a new non-Inter display direction, and internal scroll progression that reveals the brand method.
- Fold the standalone `Metodo` section into `Inicio` as falling narrative content rather than a separate snap.
- Redesign `Coleccion` without cards, preserving the existing collection resources but presenting them as sequential image/text moments that fall into place while scrolling.
- Redesign `Reformas` as a regular two-column proof section with the scroll-scrub video on the left and a concrete invented project story on the right.
- Redesign `Vision` around a staged transition: an incoming sketch-drawing video plays when the user reaches the snap, then freezes on its final frame and exposes a draggable before/after slider from sketch to final image.
- Keep mobile as a separate future adaptation, while ensuring the desktop implementation does not block a later mobile-specific concept.
- Preserve accessibility requirements: reduced-motion alternatives, keyboard access, semantic sections, and readable contrast.

## Capabilities

### New Capabilities
- `scroll-narrative-landing`: Defines the desktop scroll-snap narrative behavior, section storytelling, media choreography, and accessibility expectations for the redesigned landing page.

### Modified Capabilities

No existing OpenSpec capabilities are modified.

## Impact

- Affected code: `src/App.jsx`, `src/styles.css`, `tailwind.config.js`, `index.html` metadata if the brand/title changes.
- Affected assets: existing collection image URLs, `public/reforma-bano.mp4`, future `assets/boceto/*` files supplied by the user, and one selected public hero asset from Pexels or equivalent.
- Dependencies: likely no required runtime dependency for the core interaction; Remotion should only be introduced if the sketch/final sequence requires generated video assets rather than browser-native playback and CSS clipping.
- UX impact: desktop scroll behavior becomes intentionally more controlled and cinematic; mobile handling remains an explicit follow-up design concern.
