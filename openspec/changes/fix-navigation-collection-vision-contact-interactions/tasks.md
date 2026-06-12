## 1. Desktop Side Navigation

- [ ] 1.1 In `src/App.jsx`, refactor `ChapterDots` so each dot is a native `<button type="button">` instead of a passive `<span>`.
- [ ] 1.2 Pass `onNavigate={(index) => navigateTo(index, 0)}` from `App` into `ChapterDots` and call it on dot click.
- [ ] 1.3 Add local hover/focus state in `ChapterDots` so the displayed label uses `labels[hoveredIndex ?? active]`.
- [ ] 1.4 Add accessible labels and state: `aria-label="Ir a <label>"`, `aria-current={index === active ? 'step' : undefined}`, and visible `focus-visible` styling.
- [ ] 1.5 Add a smooth label transition using transform/opacity without moving the dots.

## 2. Colección Grouped Stagger

- [ ] 2.1 In `src/sections/desktop/Coleccion.jsx`, keep the existing reveal thresholds for the featured `Vidrio templado` block and `Textura mineral` block unchanged.
- [ ] 2.2 Introduce a shared grouped reveal condition for the remaining three blocks after `Textura mineral`, e.g. `const revealTail = s >= 5`.
- [ ] 2.3 Update the three grouped blocks to use the same reveal condition with staggered visual delays (`delay-0`, `delay-150`, `delay-300` or equivalent), preserving their order.
- [ ] 2.4 Verify forward and backward desktop scroll: one wheel action after `Textura mineral` reveals all three blocks in sequence without requiring separate scroll actions.

## 3. Vision Replay Placement And Motion

- [ ] 3.1 In `src/sections/desktop/Vision.jsx`, move the replay button from `top-3 right-3` to `bottom-3 right-3`.
- [ ] 3.2 Simplify/rework the replay SVG/markup if needed so the reload arrow is fully visible and not clipped.
- [ ] 3.3 In `src/styles/utilities.css`, revise `.btn-replay` animation so `.replay-arrow` clearly rotates on hover/focus using transform-based rotation.
- [ ] 3.4 Verify reduced motion suppresses the large replay rotation while keeping the button usable and focus-visible.

## 4. Contact Icons And Hover Motion

- [ ] 4.1 In `src/components/ContactIcon.jsx`, redraw/simplify the WhatsApp SVG so it reads as a chat/phone icon and removes duplicated/confusing paths.
- [ ] 4.2 In `src/components/ContactIcon.jsx`, redraw/simplify the Instagram SVG so it reads as camera/Instagram and is not obscured by the flash element at rest.
- [ ] 4.3 In `src/components/ContactIcon.jsx`, redraw/simplify the map icon so the map and pin are visually separated and legible at 20-24 px.
- [ ] 4.4 In `src/styles/utilities.css`, revise contact icon selectors/keyframes so hover and keyboard focus trigger visible channel-specific animations for WhatsApp, phone, Instagram, and map.
- [ ] 4.5 Verify `src/components/ContactLinks.jsx` and `src/sections/mobile/Contacto.jsx` still wrap icon links with `group`, preserve visible text, and keep at least 44 px tap targets.
- [ ] 4.6 Verify reduced motion suppresses contact icon animations or reduces them to non-motion feedback.

## 5. Verification, Commit, Push

- [ ] 5.1 Run `npm run build` and fix any errors.
- [ ] 5.2 Inspect `git status`, `git diff`, and `git log --oneline --format='%h %an <%ae> %s' -3` before committing.
- [ ] 5.3 Commit all intended changes using the existing user identity (`DavidColillaMartinez <davicete45@gmail.com>`), not `opencode`.
- [ ] 5.4 Push to `origin main`.
- [ ] 5.5 Report the commit hash and push result.
