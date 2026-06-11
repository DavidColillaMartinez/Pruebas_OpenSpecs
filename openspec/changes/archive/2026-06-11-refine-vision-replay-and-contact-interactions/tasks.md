## 1. Phase 1 — Desktop Vision replay state

- [x] 1.1 In `src/sections/desktop/Vision.jsx`, add a module-level `useRef<boolean>` (or a ref-like flag inside the file) called `visionSeenRef` that records whether the sketch video has reached its end at least once during this page load.
- [x] 1.2 In the existing `useEffect`, when `isActive` becomes true and `visionSeenRef.current === true`, skip the auto-play and instead pause the video on its last frame, set `showReveal = true`, and set `videoDone = true` so the comparison slider is one click away.
- [x] 1.3 In the `ended` event handler, set `visionSeenRef.current = true` so the next re-entry into Vision opens directly in the reveal state.
- [x] 1.4 Add a `<button>` "Volver a ver" inside the `CompareSlider` children, positioned in the top-right corner (`absolute top-3 right-3`). The button MUST be rendered only when `showReveal && !videoDone`. It MUST be reachable by keyboard, expose `aria-label="Reproducir video de nuevo"`, and have at least 44x44 px hit area.
- [x] 1.5 On click of the replay button, reset `videoRef.current.currentTime = 0`, set `showReveal = false`, set `videoDone = false`, and call `videoRef.current.play()`. The chapter narrative continues as on first entry.
- [x] 1.6 Build green. Commit as `Phase 1: vision desktop remembers already-seen and adds replay button`. Stop and wait for confirmation.

## 2. Phase 2 — Replay button animated icon

- [x] 2.1 In `src/styles/index.css` or `src/styles/utilities.css`, add a `.btn-replay` utility class that renders a circular arrow (SVG inline) and provides a hover transition (200–500 ms) on `transform` (rotation up to ~180° or a continuous keyframe), without any external library.
- [x] 2.2 On the replay button, apply the new utility class and add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2`.
- [x] 2.3 Confirm the icon animates on hover and that the `prefers-reduced-motion: reduce` media query (already in `index.css`) suppresses or reduces the animation. No new code should be added for reduced motion; the existing global `animation-duration: 1ms !important` rule will take care of CSS animations.
- [x] 2.4 Build green. Commit as `Phase 2: replay button animated circular arrow`. Stop and wait for confirmation.

## 3. Phase 3 — Contact link icons + hover microanimation

- [x] 3.1 In `src/components/ContactLinks.jsx`, replace the text `WA` with an emoji (e.g. `💬`), `TEL` with `📞`, `IG` with `📷`, and `MAP` with `📍`. Keep the existing tint background and text color slot for each marker.
- [x] 3.2 In the same file, add `group` to the anchor and `transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110` to the marker `<span>` so the icon reacts to the link hover.
- [x] 3.3 In `src/sections/mobile/Contacto.jsx`, replace the inline marker spans (WA / TEL / IG / MAP) in the minimal branch `<ul>` with the same emojis and the same hover group behavior. Use the same emoji constants if duplicated (or extract them to a tiny `data/contactIcons.js` if both files would carry the same constants).
- [x] 3.4 Verify the icon stays centered and inside the marker circle. Keep the 44x44 px tap target. Reduce motion must not animate the icon (existing `prefers-reduced-motion` rules already cover `transition`).
- [x] 3.5 Build green. Commit as `Phase 3: contact link icons + hover microanimation`. Stop and wait for confirmation.

## 4. Phase 4 — Contact section spacing rhythm

- [x] 4.1 In `src/sections/mobile/Contacto.jsx` (minimal branch), bump the top margin of the business block from `mt-8` to `mt-10`, and the top margin of the contact links `<ul>` from `mt-6` to `mt-10`. The form keeps its own `mt-16` already inside `ContactForm.jsx`.
- [x] 4.2 In `src/sections/desktop/Contacto.jsx` (minimal branch), apply the same margin adjustments to keep the desktop and mobile rhythms consistent.
- [x] 4.3 Verify the page does not introduce horizontal overflow at 375 px and that the section still fits within 100svh of viewport without scrolling the section itself.
- [x] 4.4 Build green. Commit as `Phase 4: contact section spacing rhythm`. Stop and wait for confirmation.

## 5. Phase 5 — Final sweep and housekeeping

- [x] 5.1 Final `npm run build`. Build must remain green.
- [x] 5.2 Manual visual sweep at phone (375 px), tablet (768 px, 1024 px) and desktop (1280x800, 1440x900). Verify: Vision replay on first entry vs. re-entry; replay button only in reveal state; contact icons render in all four slots; hover microanimation visible; spacing rhythm in Contacto.
- [x] 5.3 Commit as `Phase 5: final visual sweep`. Stop and report.
