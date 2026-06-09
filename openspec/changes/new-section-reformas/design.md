## Context

The landing page currently has five sections: Hero, Categories, Method, Vision, and Contact. The Method section explains the consultation process and the Vision section is a static editorial spread. Between them there's a gap: no section shows actual proof of renovation work. The project has a 13.7-second stopmotion video (1024x576, h264, 24fps, 2.5MB) of a real bathroom renovation from start to finish at `assets/Reformas/Baño/`.

The design system (DESIGN.md) is "The Mist Atelier" — restrained mineral palette, Inter typography, layered shadows, clay accent at ≤10% per viewport. The page was just refactored to remove SaaS patterns (hero metrics, carousel, eyebrow labels, card sameness). The current score is 31/40 (Good).

## Goals / Non-Goals

**Goals:**
- Insert a Reformas section between Method and Vision that shows the renovation stopmotion video
- Implement scroll-driven video playback: user scroll controls video position
- Both forward (renovation progresses) and reverse (scroll up reverses the transformation) directions
- Provide a progress indicator below the video
- Support reduced-motion with a standard video player fallback
- Follow the existing design system (mist background, rounded-[2rem] container, shadow-soft, no new colors or patterns)
- No new dependencies — use vanilla React + browser APIs

**Non-Goals:**
- Extract individual frames from the video (use video.currentTime seeking directly)
- Add a video hosting service, CDN, or CMS integration
- Make the section editable via a CMS
- Add autoplay, audio, or time-based playback
- Change existing sections
- Add any gradient text, glassmorphism, eyebrow labels, or card templates

## Decisions

- **Scroll observer approach**: Use a `useEffect` with a scroll event listener on `window` (throttled via `requestAnimationFrame`). Track the section's bounding rect to determine scroll offset within the section. Alternative considered: IntersectionObserver. Rejected because IO only reports entry/exit, not scroll position within the entry. We need continuous position tracking.

- **Virtual scroll height**: Create a container div with a calculated `min-height` to give the user enough scroll room. The video element itself is `position: sticky` at `top: 6rem` (below the nav). The virtual height = `videoDuration * 150px` = ~2055px. This provides a deliberate, frame-by-frame feel. Alternative considered: 80px/s for faster scrolling. Rejected because the stopmotion format benefits from slower, more deliberate pacing — the user should absorb each progressive frame of the installation.

- **Video seeking via currentTime**: Use `video.currentTime = progress * duration` on each scroll frame. The video element is preloaded (`preload="auto"`) so seeking is instant. No frame extraction or canvas rendering needed. Alternative considered: extract keyframes to images and use canvas. Rejected because 329 frames would require 329 images, adding complexity and larger payload. Direct video seeking is simpler and YouTube-style video scrubbing proves it's performant.

- **Background color**: Use mist (#d9e4e2). This creates a distinct visual pocket between the ink-dark Method section and the stonewash Vision section. Mist's cool gray-green character ("softened glass and steam") fits the renovation time-lapse theme. Alternative considered: stonewash (#f4f1ec). Rejected because Vision already uses stonewash, and two same-color sections back-to-back would lose visual rhythm.

- **Progress bar design**: A thin 4px horizontal track with ink (#151515) fill, rounded corners. No clay color — we're at the Clay Rarity limit (process numbers + contact CTA only). Alternative considered: clay accent. Rejected to stay within the ≤10% rule.

- **Reduced motion fallback**: Check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` on mount. If true, skip scroll observer entirely. Render video with `controls` attribute so the user can play/pause natively. Content (heading, copy, material list) renders identically — only the scroll interaction is removed. This matches the existing pattern in `useReveal` (App.jsx line 53).

- **Component location**: Implement as a new `ReformasSection` function component directly in `src/App.jsx`. No separate file needed — all other sections live in App.jsx and this is a single-section addition. Alternative considered: separate file. Rejected because the existing convention is co-located sections, and this avoids import overhead for one component.

## Risks / Trade-offs

- **Scroll-jacking usability**: Users who want to scroll past quickly may feel trapped in the ~2050px virtual scroll zone. Mitigation: The section has clear visual boundaries (different background color, visible video), so users understand they're in an interactive zone. Fast scrolling still works — `currentTime` seeks directly, it doesn't animate through frames.

- **Video seeking performance on mobile**: Seeking to arbitrary `currentTime` positions on mobile browsers can be slower, especially on older devices. Mitigation: Use `requestAnimationFrame` to batch seeks (max 60fps seeking), well below the 24fps video rate. The video is 2.5MB so initial load is reasonable even on 3G.

- **Sticky positioning conflicts**: `position: sticky` inside the section's scroll container. The nav bar already uses `position: fixed`. Mitigation: Use `top: 6rem` on the sticky video to account for the 80px nav bar. Test on iOS Safari which has known sticky bugs with `overflow`.

- **Reduced motion detection mismatch**: If the user enables reduced motion after page load, they'd get the scroll-driven version until reload. Mitigation: Low severity — reduced motion is typically a system-level setting set before browsing, and the `useEffect` cleanup handles unmount.
