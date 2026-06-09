## Context

The change introduces a single-page landing experience for a bathroom products store selling shower screens, shower trays, taps, and related products. The requested implementation uses React, Vite, and Tailwind, with a minimal but premium visual direction, layered surfaces, restrained color, purposeful shadows, scroll dynamics, animated details, and a strong visual header.

The current scope is frontend-only. Product data can be represented with local arrays and curated placeholder assets during the initial implementation. The landing should be ready to evolve later into a fuller storefront or catalogue without introducing backend assumptions now.

## Goals / Non-Goals

**Goals:**

- Build a responsive React/Vite/Tailwind landing page with a modern, minimal, commercial feel.
- Create a visually dominant hero/header with layered product imagery, strong typography, and clear calls to action.
- Present the core product categories: shower screens, shower trays, taps, and bathroom accessories.
- Use layered cards, subtle shadows, gradients, masks, and spacing to create depth while keeping the palette controlled.
- Add scroll-triggered animations and dynamic image reveal/completion effects that improve the perceived quality of the page.
- Keep animation performant and respectful of accessibility preferences.

**Non-Goals:**

- Build checkout, cart, authentication, payment, or inventory management.
- Connect to a live product API or CMS.
- Implement a full multi-page ecommerce site.
- Add heavy animation dependencies unless the implementation clearly needs them.

## Decisions

- Use React components organized by landing sections rather than a generic page-builder abstraction.
  - Rationale: the page is a curated marketing experience, so direct section components keep implementation clear and allow bespoke visuals.
  - Alternative considered: data-driven section rendering. This is more flexible but adds abstraction before there is a concrete need.

- Use Tailwind for the design system, spacing, responsive behavior, shadows, and layered surfaces.
  - Rationale: Tailwind matches the requested stack and enables fast iteration on a distinctive visual system.
  - Alternative considered: CSS modules or styled-components. They are unnecessary for this initial landing and would add more setup.

- Implement scroll effects with Intersection Observer and CSS transitions by default.
  - Rationale: reveal animations, parallax-like offsets, and staged image completion can be achieved with low runtime cost.
  - Alternative considered: Framer Motion or GSAP. These are powerful but should only be added if native/CSS-driven animation is insufficient.

- Treat the hero/header as the primary brand moment.
  - Rationale: the user explicitly requested a powerful, highly visual header. It should combine navigation, sales messaging, product composition, CTA, trust cues, and layered imagery.
  - Alternative considered: a conventional nav plus text-only hero. This would be too generic for the desired result.

- Use local product/category data during initial implementation.
  - Rationale: no backend or CMS requirement exists, and local data keeps the landing shippable.
  - Alternative considered: mock API fetching. It adds complexity without improving the initial user experience.

## Risks / Trade-offs

- Animation overload could reduce clarity or performance -> Use restrained durations, transform/opacity-based transitions, and avoid animating layout-heavy properties.
- Dynamic image effects could harm accessibility or mobile usability -> Provide static final states, respect `prefers-reduced-motion`, and ensure content remains understandable without animation.
- Placeholder imagery may weaken the final premium look -> Structure components so real product images can replace placeholders cleanly.
- A strong bespoke landing can be harder to reuse than generic components -> Keep section components focused and readable, but avoid premature abstraction.
- Tailwind class-heavy components can become noisy -> Extract repeated visual patterns only when repetition becomes clear during implementation.

## Migration Plan

1. Create or update the Vite React frontend structure.
2. Add Tailwind setup if it is not already present.
3. Implement the landing sections and local category/product data.
4. Add animation hooks/utilities and CSS treatments.
5. Verify responsive behavior, accessibility basics, and production build.

Rollback is straightforward because the change is frontend-only: remove the new landing components, local data, and style additions, or restore the previous app entry if one exists.

## Open Questions

- Final store name, logo, and brand copy are not specified; implementation should use polished placeholder branding until real content is provided.
- Final product photos are not specified; implementation should use local placeholders or CSS/image compositions that can be replaced later.
