## 1. Section Scaffold

- [x] 1.1 Create `ReformasSection` component in `src/App.jsx` with `id="reformas"` section container using mist background (`bg-mist`), `px-4 py-20 sm:px-6` padding, and `max-w-7xl mx-auto` inner container
- [x] 1.2 Insert `<ReformasSection />` between `<Benefits />` and `<EditorialSpread />` in the App component's render tree

## 2. Video Integration

- [x] 2.1 Import the renovation video from `assets/Reformas/Baño/` using a Vite-compatible import path
- [x] 2.2 Render a `<video>` element with `muted`, `playsInline`, and `preload="auto"` attributes inside a `rounded-[2rem]` container with `shadow-soft`, `overflow-hidden`, and `border border-white/70`
- [x] 2.3 Add a 4px horizontal progress bar below the video container (`bg-ink/10` track, `bg-ink` fill with dynamic width tied to video progress)

## 3. Scroll-Driven Playback

- [x] 3.1 Create a `useScrollVideo` hook that tracks the section's scroll position relative to the viewport using a scroll event listener throttled via `requestAnimationFrame`
- [x] 3.2 Calculate video progress as `(scrollY - sectionTop) / virtualScrollHeight` where `virtualScrollHeight = videoDuration * 150` pixels
- [x] 3.3 Map progress (0-1) to `video.currentTime` (0-duration) on each scroll frame, supporting both forward (scroll down) and reverse (scroll up) directions
- [x] 3.4 Give the video container a calculated `min-height` equal to `virtualScrollHeight` to provide sufficient scroll room, with the video element using `position: sticky; top: 6rem` (below nav)

## 4. Content

- [x] 4.1 Add section heading "Reformas que hablan por si solas" using Inter 600, text-4xl sm:text-5xl, tracking [-0.04em], text-wrap-balance, text-ink
- [x] 4.2 Add body copy describing the renovation: "Asi transformamos este bano con mampara a medida, plato de ducha texturizado y griferia premium." using text-lg leading-8 text-graphite/70
- [x] 4.3 Add material callout tags below the video listing the products used (mampara a medida, plato textura mineral, griferia linea pura) as subtle pill elements with `border border-ink/8 bg-white/80`

## 5. Reduced Motion Fallback

- [x] 5.1 Detect `prefers-reduced-motion: reduce` on mount and conditionally disable scroll-driven playback
- [x] 5.2 Render the video with `controls` attribute when reduced motion is active, allowing native play/pause/seek
- [x] 5.3 Keep all section content (heading, body, material callouts) identical in both modes; only the video interaction differs

## 6. Verification

- [x] 6.1 Verify the section renders correctly between Method and Vision in the scroll order on desktop (1024px+), tablet (768px), and mobile (320px)
- [x] 6.2 Verify scroll-driven playback advances and reverses smoothly, and the progress bar reflects playback position
- [x] 6.3 Verify reduced-motion fallback shows video with controls and scroll does not drive playback
- [x] 6.4 Run `npm run build` and verify no errors or warnings
