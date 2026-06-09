## Why

The landing page tells visitors that Bath Studio renovates bathrooms but never shows proof. A 13.7-second stopmotion video of a real bathroom renovation already exists in the project assets. Inserting it as an interactive scroll-driven section bridges the gap between Method (how we work) and Vision (the product completes itself when you look at it) with tangible evidence.

## What Changes

- Add a new "Reformas" section between Method (#metodo) and Vision (#vision) that displays the renovation stopmotion video with scroll-driven playback.
- The video advances frame-by-frame as the user scrolls through the section. Scroll down progresses the renovation; scroll up reverses it. A progress bar reflects playback position.
- The section uses the mist (#d9e4e2) background to create a distinct visual pocket between the dark Method and stonewash Vision sections.
- The video is contained within the max-w-7xl grid, with rounded-[2rem] corners and shadow-soft, consistent with the design system.
- Under `prefers-reduced-motion`, the video renders with standard playback controls and no scroll-driven behavior.

## Capabilities

### New Capabilities
- `reformas-section`: Scroll-driven stopmotion video section that demonstrates a real renovation project, with reversible playback mapped to page scroll position, progress indicator, and reduced-motion fallback.

### Modified Capabilities

None. This is a net-new section; existing sections are unchanged.

## Impact

- Adds a new React component (`ReformasSection`) to `src/App.jsx`.
- Uses existing video asset at `assets/Reformas/Baño/WhatsApp Video 2026-06-08 at 15.35.59.mp4` (13.7s, 1024x576, h264, 24fps, 2.5MB).
- Requires a scroll observer hook or utility to map scroll position to video `currentTime`.
- No new dependencies, no backend changes, no API impact.
