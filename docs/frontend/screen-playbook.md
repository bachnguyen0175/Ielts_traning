# Screen Build Playbook

> Status: 🟢 active · derived from the landing-page build (our first screen)
>
> A repeatable recipe for building any new screen (onboarding, pre-test, test
> player, results, review…) at the same quality bar as the landing page. Follow
> it as an experiment template: same workflow, same building blocks, same
> verification. Reduces per-screen decisions to the ones that actually matter.

## Why this exists

The landing page established our stack, design language, reusable primitives,
TDD loop, and verification steps. Rather than re-invent those per screen, this
playbook codifies them so each new screen is mostly *composition + its own
spec*, not fresh infrastructure.

---

## 1. Where things live (`apps/web`)

```
apps/web/src/
├── app/
│   ├── globals.css        # design tokens + motion/atmosphere layer (shared)
│   ├── layout.tsx         # fonts (Fraunces/Inter), <html> setup
│   ├── <route>/page.tsx   # one folder per screen/route
│   └── <route>/page.test.tsx  # co-located RTL spec
├── components/
│   ├── ui/                # cross-screen primitives (see §2)
│   └── <feature>/         # screen-specific sections (e.g. landing/, onboarding/)
└── e2e/<screen>.spec.ts   # Playwright live-server tests
```

**Rule:** anything reused across ≥2 screens → `components/ui/`. Screen-specific
composition → `components/<feature>/`.

## 2. Reusable building blocks (already built)

| Primitive | File | Use |
|-----------|------|-----|
| `Button` | `components/ui/button.tsx` | Polymorphic link/button, variants (accent/primary/outline/ghost), focus-visible rings |
| `Container` | `components/ui/container.tsx` | Consistent max-width + responsive padding |
| `Reveal` | `components/ui/reveal.tsx` | Scroll-reveal wrapper; reduced-motion + SSR safe |
| `CountUp` | `components/ui/count-up.tsx` | Animated number, reveals on scroll; reduced-motion safe |

Reach for these first. Add new primitives here when a pattern recurs.

## 3. The design language (don't re-decide)

Tokens, typography, and the motion/atmosphere layer are fixed in
[`../design/visual-direction.md`](../design/visual-direction.md). Reuse, don't
reinvent:

- **Color:** semantic tokens only (`bg-background`, `text-foreground`,
  `text-primary`, `bg-accent`, `border-border`, `text-muted-foreground`). Never
  raw hex in components.
- **Type:** `font-serif` (Fraunces) for headings, default sans (Inter) for body.
- **Atmosphere/motion utilities** (in `globals.css`): `.aurora`, `.grain`,
  `.enter` (staggered via `--i`), `.animate-float`, `.text-gradient`, `.reveal`.
  All motion is already gated behind `prefers-reduced-motion`.

> Not every screen wants full aurora drama. Marketing/hero screens: lean in.
> Functional screens (test player, forms): calmer — clarity and focus win. Use
> the tokens + primitives; dial motion down.

## 4. The build workflow (the recipe)

Follow in order for each screen:

1. **Read the spec.** Find the screen's feature doc (`docs/features/*.md`). If it
   doesn't exist, write the acceptance criteria first.
2. **Write the test first (TDD red).** Co-locate `page.test.tsx` asserting the
   screen's required content, landmarks, and key interactions. Run — confirm it
   fails. (See landing `page.test.tsx` for the shape.)
3. **Build to green.** Compose from `ui/` primitives + new `<feature>/` sections.
   Server components by default; `"use client"` only where interactivity needs it.
4. **Elevate (optional, per screen altitude).** Layer motion/atmosphere from §3
   where it serves the screen. Keep functional screens calm.
5. **Verify (all must pass):**
   - `pnpm build` (typecheck) · `pnpm lint`
   - `pnpm test` (unit/RTL)
   - `pnpm test:e2e` (Playwright, live server)
   - Visual check: capture **light + dark + mobile (375px)** screenshots and
     actually look at them.
6. **Audit against the doc.** Update the feature doc's status + an implementation
   table (as in `features/landing-page.md`). Log decisions made and questions
   left open.

## 5. Verification gates (copy these into each screen's e2e)

Non-negotiable checks every screen inherits:

- **No console errors / hydration warnings** on load (extension-free browser).
- **No horizontal overflow** at 375px.
- **Landmarks + headings**: correct `banner`/`main`/`contentinfo`, single `h1`,
  no skipped heading levels.
- **Reduced-motion**: page fully usable and all content visible with motion off
  (our screenshot capture uses `reducedMotion: "reduce"` for exactly this).
- **Focus-visible** on all interactive elements; touch targets ≥ 44px.

See `apps/web/e2e/landing.spec.ts` for reusable test patterns (console guard,
overflow check, screenshot capture, `BASE_URL` override to target a running dev
server).

## 6. Quality checklist (pre-done, per screen)

- [ ] Spec/acceptance criteria exist and are met
- [ ] Test written before implementation; suite green
- [ ] Only semantic tokens (no raw hex); serif/sans used per role
- [ ] Reused `ui/` primitives where applicable
- [ ] Responsive at 375 / 768 / 1024 / 1440; no horizontal scroll
- [ ] Light + dark both verified (contrast AA, both themes looked at)
- [ ] Motion gated behind reduced-motion; static fallback correct
- [ ] No console/hydration errors
- [ ] Feature doc updated with implementation audit

## 7. Screens queue (apply the playbook)

Per the [feature catalog](../02-features.md) / [user journey], in likely order:

| Screen | Feature doc | Altitude | Status |
|--------|-------------|----------|--------|
| `/start` onboarding | `features/onboarding.md` | Calm, focused form | ✅ built |
| Pre-test readiness gate | `features/pre-test.md` | Calm + system checks | ✅ built |
| Test player (L/R/W/S) | `features/test-player.md` | **Calm/clinical** — no drama | ✅ built |
| Results | `features/results.md` | Moderate — honest | ✅ built |
| Review | `features/review.md` | Calm, content-first | ✅ built |
| Progress | `features/progress.md` | Calm | ✅ built |

> The test player deliberately breaks from the landing page's marketing energy:
> it must feel like an exam, not a brochure. Same tokens/primitives, minimal
> motion, maximum clarity.
