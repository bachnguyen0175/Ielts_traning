# Visual Direction — "Composed"

> Status: 🟢 accepted (2026-07-25) · closes the open visual-direction question in
> [`../features/landing-page.md`](../features/landing-page.md)

## Concept

**Composed** — calm, academic, precise, premium. We reframe the focused quiet of
an exam hall as *reassuring* rather than stressful. The product's job is to make
test-day pressure feel survivable; the brand should feel like a steady, credible
mentor — not another anxiety-inducing test app.

Deliberately **not** the alarm-red of official IELTS materials (red reads as
warning/stress). Warmth + focus instead.

## Palette (design tokens)

Semantic tokens; concrete values below. Light = warm "paper"; dark = deep "ink".

| Token | Light | Dark | Role |
|-------|-------|------|------|
| `--background` | `40 33% 96%` (warm ivory) | `222 30% 8%` (ink) | page |
| `--foreground` | `220 26% 12%` (ink) | `40 20% 90%` | text |
| `--primary` | `222 47% 24%` (deep indigo) | `221 55% 72%` (periwinkle) | brand, headings accents |
| `--primary-foreground` | `40 33% 97%` | `222 47% 12%` | on-primary |
| `--accent` | `35 78% 52%` (amber) | `35 82% 60%` | CTAs, highlights |
| `--accent-foreground` | `28 40% 12%` | `28 40% 10%` | on-accent |
| `--muted` | `40 20% 90%` | `222 20% 16%` | subtle surfaces |
| `--muted-foreground` | `220 12% 40%` | `40 12% 62%` | secondary text |
| `--border` | `38 24% 86%` | `222 18% 20%` | hairlines |

> HSL channel values (no `hsl()` wrapper) so they compose in Tailwind v4 /
> shadcn theme (`hsl(var(--token))`).

## Typography

- **Display / headings:** **Fraunces** — a characterful, optical serif. Signals
  editorial/academic credibility and premium care.
- **Body / UI:** **Inter** — clean, neutral, highly legible.
- Loaded via `next/font` (self-hosted, no external requests, good CLS).

## Motion & feel

- Generous whitespace; strong typographic hierarchy; hairline rules.
- Subtle scroll-reveal (fade + short rise). **Always** honor
  `prefers-reduced-motion`.
- Restraint over spectacle — polish through spacing, type, and detail, not
  effects.

## Accessibility

- Target WCAG AA contrast in both themes.
- Amber accent used for emphasis/CTAs on dark ink or with sufficient surrounding
  contrast — verify AA on text uses.
- Full keyboard/focus-visible states; semantic landmarks.

## Motion & atmosphere layer (v2, 2026-07-25)

Informed by the `ui-ux-pro-max` design intelligence (which recommended an
"Aurora UI" direction), we layered atmosphere and choreography onto the base
brand — adopting the *technique* in our palette rather than its default colors:

- **Aurora mesh gradient** — large, soft, slowly drifting indigo/periwinkle/amber
  blobs behind the hero (and a glow in the final CTA). Slow 22s drift.
- **Film grain** — subtle SVG-noise overlay for premium tactile depth.
- **Entrance choreography** — staggered fade-rise on hero elements (`.enter`,
  staggered via `--i`).
- **Gradient accent** — one headline word (`before`) uses `.text-gradient`
  (amber→primary); stat numbers reuse it.
- **Floating elements** — the hero exam-mock and its "band score" chip gently
  float; hover-lift + glow on condition/skill cards.
- **Animated stat strip** — count-up "by the numbers" band (4 / 80+ / 165 / 9.0).

**All motion is gated behind `prefers-reduced-motion: no-preference`** — under
reduced motion the page renders fully static with all content visible. Verified
by an E2E "no console errors or hydration warnings" test.

## Application

These tokens drive the whole app, not just the landing page — they're the
foundation of the design system. shadcn/ui components inherit them via CSS vars.
