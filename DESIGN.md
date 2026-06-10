---
name: Bath Studio
description: Landing page for a premium bathroom products studio — shower screens, trays, taps, and accessories.
colors:
  ink: "#151515"
  stonewash: "#f4f1ec"
  porcelain: "#fbfaf7"
  clay: "#b98364"
  graphite: "#2e3134"
  mist: "#d9e4e2"
typography:
  display:
    fontFamily: "Marcellus, Georgia, serif"
    fontSize: "clamp(2.5rem, 6vw, 5rem)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "0.035em"
  body:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "normal"
  label:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    letterSpacing: "0.22em"
    textTransform: "uppercase"
rounded:
  full: "9999px"
  xl: "2rem"
  "2xl": "2.5rem"
  "3xl": "3rem"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  "2xl": "3rem"
---

# Design System: Bath Studio

## 1. Overview

**Creative North Star: "The Mist Atelier"**

A design system built on layered translucency, material honesty, and warm restraint. Every surface reads as physical but soft — like steam settling on glazed tile, or light through a frosted glass shower screen. The palette is narrow and deliberate: warm near-whites, cool stone grays, and a single clay accent used at surgical precision.

This system explicitly rejects SaaS-landing-page templates. No glassmorphism as default, no gradient text, no hero-metric grids, no eyebrow labels above every section. Depth comes from shadow and gradient, not from blur. Type is architecture: large, tight, and unapologetically structural.

**Key Characteristics:**
- Layered, lifted surfaces with soft shadows
- Single accent (clay) used sparingly — its rarity is the point
- Large display type with tight negative tracking
- Generous whitespace and deliberate pacing
- Motion that reveals, not decorates (panels assembling, surfaces completing)

## 2. Colors

A restrained mineral palette: warm-whites, cool stone greys, and a single clay accent. The body background is a true near-white tinted toward warmth by association, not by chroma.

### Primary
- **Porcelain** (#fbfaf7): Page background, card bases, light surfaces. A true near-white with the barest warmth — reads as clean, not clinical.

### Neutral
- **Ink** (#151515): Primary text, dark surfaces, solid buttons. A near-black with warmth — never pure `#000`.
- **Graphite** (#2e3134): Secondary text, muted elements, dark accents. A cool dark gray that recedes without disappearing.
- **Stonewash** (#f4f1ec): Section background, tonal layers. Slightly warmer and deeper than porcelain — the surface behind the surface.
- **Mist** (#d9e4e2): Decorative gradients, soft backgrounds, atmospheric blur. A cool gray-green that evokes softened glass and steam.

### Secondary
- **Clay** (#b98364): The only accent. Used on labels, numeric highlights, hover states, and the primary CTA. A muted warm brown-terracotta that never screams — its restraint is the point.

### Named Rules
**The Clay Rarity Rule.** Clay appears on ≤10% of any given viewport. It exists to guide the eye, not to decorate. If clay is visible in more than one place at once, question which occurrence should be demoted to neutral.

## 3. Typography

**Display Font:** Marcellus, Georgia, serif
**Body Font:** Manrope, ui-sans-serif, system-ui, sans-serif

**Character:** A restrained two-family system: Marcellus carries the carved, architectural display voice, while Manrope keeps body copy precise and readable. The pairing should feel closer to a brass showroom plaque and technical product note than to an editorial magazine spread.

### Hierarchy
- **Display** (400, clamp(2.5rem, 6vw, 5rem), 0.95): Hero headings. Open tracking and high contrast make the phrase a visual object. Max size ~96px.
- **Section heading** (400, clamp(2rem, 4.5vw, 3.75rem), 1): Section titles. Tracking 0.03em–0.04em.
- **Card title** (600, 1.5rem, 1.2): Product and process card headings. Tracking -0.03em.
- **Body** (400, 1rem–1.125rem, 1.7): Description copy, card blurbs. Max line length 65–75ch.
- **Label / Kicker** (600, 0.8125rem, 1, 0.22em tracking, uppercase): Section labels. Used sparingly — one per section at most, not as a default scaffold.

## 4. Elevation

Shadows are the primary depth mechanism. The system uses layered shadows that make surfaces feel lifted and physical — like tiles or panels stacked above one another. Shadows are soft and ambient, never hard or dramatic.

### Shadow Vocabulary
- **Soft** (`box-shadow: 0 24px 80px rgba(35, 31, 27, 0.12)`): Default surface shadow for cards and panels at rest.
- **Lift** (`box-shadow: 0 18px 50px rgba(47, 45, 41, 0.16)`): Elevated state — hover, active cards, the nav bar, featured sections.
- **Glass** (`box-shadow: 0 1px 0 rgba(255,255,255,0.7) inset, 0 30px 70px rgba(30,30,30,0.12)`): Inset top highlight for surfaces that need a glossy, glazed feel.

### Named Rules
**The Float Rule.** Surfaces at rest use `shadow-soft`. Hover and active states lift to `shadow-lift` and translate -2px–-8px vertically. Flat is the ground; any shadow means the surface is above it.

## 5. Components

### Buttons
- **Shape:** Fully rounded (9999px)
- **Primary (ink):** Background ink (#151515), text white, padding 16px 28px (sm) / 20px 28px (lg). Shadow-lift at rest.
- **Hover:** Translate -1px–-2px, background transitions to graphite (#2e3134)
- **Secondary (ghost):** Border ink/10, background white/75, shadow-soft. Same hover lift.
- **Sales CTA (clay):** Background clay (#b98364), text white, shadow-lift. Used exactly once — the final consultation CTA on the contact section.

### Cards / Panels
- **Corner Style:** Generous rounded — 2rem (32px) for product cards, 2.5rem–3rem for featured sections
- **Background:** Gradient compositions — tailwind `from-{color}/80 to-white` for category cards, `bg-ink` for dark inversion, `bg-white/70` with backdrop-blur for floating elements
- **Shadow Strategy:** shadow-soft at rest; shadow-lift on hover with translate-y
- **Internal Padding:** 1.25rem–2rem depending on card size

### Navigation
- **Style:** Fixed top, rounded-full bar, bg-porcelain/80 with backdrop-blur-xl, border-white/70. Links are graphite/75 at rest, ink on hover.
- **Mobile:** Four nav items hidden behind `md:flex`. CTA button always visible.
- **Transition:** Smooth color change on link hover, no underline.

### Process / Steps
- **Container:** rounded-[2rem], border ink/5, bg-white/70, shadow-soft, backdrop-blur. Hover lifts with shadow-lift.
- **Step Number:** 56px circle, clay/15 background, clay text, 600 weight.
- **Grid:** Single column on mobile, two-column on lg with step cards stacked on the right.

### Signature Component: Product Panel
- A layered CSS-only composition representing a shower product (slab, base, fittings) using absolute-positioned divs with gradients, shadows, border/backdrop-blur.
- Used in the hero and showcase sections.
- Has a `compact` variant (320px min-height) and a full variant (520px min-height).
- Animated reveal: `reveal-slab` with a clip-path animation that simulates a panel lowering into place.

## 6. Do's and Don'ts

### Do:
- **Do** use the clay accent sparingly — one element per viewport maximum.
- **Do** layer shadows for depth: soft at rest, lift on hover.
- **Do** keep body type at 65–75ch max-width for readability.
- **Do** round generously — 2rem is the default corner radius for cards.
- **Do** use negative tracking (-0.06em to -0.03em) on headings for structural precision.
- **Do** respect reduced-motion: reveal animations must have a visible static state.
- **Do** test all text contrast: body ≥4.5:1, large text ≥3:1.

### Don't:
- **Don't** use SaaS landing page templates: no hero-metric grids, no tiny uppercase eyebrows above every section, no identical card grids.
- **Don't** use gradient text (`background-clip: text` with a gradient).
- **Don't** use glassmorphism as a default surface treatment — it belongs on the nav bar only.
- **Don't** use border-left or border-right greater than 1px as a colored accent stripe.
- **Don't** use numbered section markers (01, 02, 03) as default scaffolding — numbers only when the sequence carries real order information.
- **Don't** introduce additional display families beyond Marcellus and Manrope — the logo already provides the third visual voice.
- **Don't** use all-caps for body copy.
- **Don't** animate layout properties (width, height, top, left) — use transform and opacity only.
