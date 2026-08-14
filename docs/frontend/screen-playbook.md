# Screen Build Playbook

> Status: 🟢 active · started from the landing-page build, rewritten after the
> 2026-08-14 shell rebuild ([ADR-0010](../architecture/decisions/0010-app-shell-and-ui-foundation.md))
>
> A repeatable recipe for building any screen at the same quality bar as the
> rest of the app: same workflow, same building blocks, same verification. It
> exists to cut the per-screen decisions down to the ones that actually matter.

## Why this exists

The landing page established the stack, the design language, the TDD loop, and
the verification steps. The shell rebuild added the missing half: page chrome,
navigation, and the primitives every screen was previously reinventing. With
both in place a new screen is mostly composition plus its own spec, not fresh
infrastructure.

Section 6 is the part worth reading even if you skip the rest. It lists the
defects that got through a fully green test suite.

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
├── lib/cx.ts              # class-name join
└── e2e/<screen>.spec.ts   # Playwright live-server tests
```

**Rule:** anything reused across ≥2 screens → `components/ui/`. Screen-specific
composition → `components/<feature>/`.

## 2. Pick a shell first

Every screen starts by choosing one of two shells
([ADR-0010](../architecture/decisions/0010-app-shell-and-ui-foundation.md)).
Which one is a fact about the screen, not a setting:

| Shell | Chrome | For |
|-------|--------|-----|
| `AppShell` | Sticky top nav, plus a bottom bar under `md` | Screens you navigate *between*: dashboard, tests, import, progress, vocabulary, account, results, review |
| `FocusShell` | Wordmark only | Screens you move *through*: `/start`, the pre-test, the sitting. Navigation is withheld so nobody wanders off mid-flow |

Both take `width` (`narrow` / `form` / `content` / `wide`) and pair with
`PageHeader` for the eyebrow, title, lead, and any actions.

```tsx
<AppShell width="content">
  <PageHeader eyebrow="Library" title="Test library" lead="…">
    <Button href="/import" variant="outline">Import a paper</Button>
  </PageHeader>
  <TestCatalog tests={tests} />
</AppShell>
```

The player is the exception: it owns its full-screen chrome, including the
clock and the question navigator, and uses neither shell.

## 3. Reusable building blocks (already built)

| Primitive | File | Use |
|-----------|------|-----|
| `AppShell`, `FocusShell`, `PageHeader` | `ui/app-shell.tsx` | Page chrome and title block (§2) |
| `Button` | `ui/button.tsx` | Polymorphic link/button, variants (accent/primary/outline/ghost), focus-visible rings |
| `Container` | `ui/container.tsx` | Page gutter and outer max-width. Do not pass it a competing `max-w` (§6) |
| `Card` + `CardBody`, `CardHeader`, `CardTitle`, `CardLink`, `Eyebrow` | `ui/card.tsx` | Surfaces. Tones: `plain`, `raised`, `quiet`, `notice` |
| `Field`, `FieldInput`, `FieldSelect` | `ui/field.tsx` | Labelled control with hint and error. Wires `htmlFor`, `aria-describedby`, and `aria-invalid` for you, so use it instead of hand-rolling a label |
| `Badge` | `ui/badge.tsx` | Status. Tones: `neutral`, `accent`, `primary`, `good`, `bad` |
| `EmptyState` | `ui/empty-state.tsx` | A named absence plus the action that fills it. Never ship a blank panel |
| `BandGauge`, `BandTrendChart` | `ui/band-gauge.tsx`, `ui/band-trend-chart.tsx` | Band scores. Shared by dashboard, results, and progress so a band looks the same everywhere |
| `icons.tsx` | `ui/icons.tsx` | The icon set. Add here rather than inlining SVG, and never use emoji or text glyphs as icons |
| `Reveal`, `CountUp` | `ui/reveal.tsx`, `ui/count-up.tsx` | Landing-page era. Scroll-reveal and animated numbers, both reduced-motion safe |

Reach for these first. Add new primitives here when a pattern recurs.

## 4. The design language (don't re-decide)

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

> Not every screen wants full aurora drama. Marketing and hero screens: lean in.
> Functional screens (test player, forms): calmer, because clarity wins. Use the
> tokens and primitives; dial motion down.

A note on `.aurora`, learned the hard way on `/start`: it is positioned
`inset: -30%`, so on a tall page it spills past the column and washes out
whatever sits on top of it. Put it inside a container that clips
(`relative isolate overflow-hidden`), as the results hero does, or leave it out.

## 5. The build workflow (the recipe)

Follow in order for each screen:

1. **Read the spec.** Find the screen's feature doc (`docs/features/*.md`). If it
   doesn't exist, write the acceptance criteria first.
2. **Write the test first (TDD red).** Co-locate `page.test.tsx` asserting the
   screen's required content, landmarks, and key interactions. Run it and
   confirm it fails. (See landing `page.test.tsx` for the shape.)
3. **Pick a shell** (§2), then **build to green.** Compose from `ui/` primitives
   and new `<feature>/` sections. Server components by default; `"use client"`
   only where interactivity needs it.
4. **Elevate (optional, per screen altitude).** Layer motion and atmosphere from
   §4 where it serves the screen. Keep functional screens calm.
5. **Verify (all must pass):**
   - `pnpm build` (typecheck) and `pnpm lint`
   - `pnpm test` (unit/RTL)
   - `pnpm test:e2e` (Playwright, live server)
   - Render it and look at it: light and dark, desktop and 390px, empty and
     populated. This is not a formality; see §6.
6. **Audit against the doc.** Update the feature doc's status and its
   implementation table (as in `features/landing-page.md`). Log decisions made
   and questions left open.

## 6. Traps the suites do not catch

Each of these shipped through a green `build`, `lint`, `test`, and `test:e2e`,
and was found only by rendering the screen and looking at it. Recipe for
capturing screenshots locally is in the project memory; the short version is a
production server on port 3100 plus a Playwright script that must physically
live inside `apps/web`, because Node resolves packages from the script's own
directory.

**Competing Tailwind utilities resolve by stylesheet order, not by argument
order.** `AppShell` passed `max-w-2xl` into `Container`, which hard-codes
`max-w-6xl`, so `max-w-6xl` won and every screen in the app rendered full width.
Nothing errored. Put the constraint on an element the other component does not
style, and treat any primitive's own utilities as private.

**Charts that clamp their domain will draw a value nobody scored.**
`BandTrendChart` had a fixed 4 to 9 axis and pinned a real band of 2.0 onto the
"4" gridline. Derive the domain from the data.

**A token that does not exist fails silently.** The review screen's wrong-answer
mark used `bg-destructive`, which this theme never defined, so it rendered with
no background at all. Check new colour names against `globals.css`.

**Muted grey is for secondary text, not for reading.** The reading passage, the
longest text in the product, was `text-muted-foreground`. Long-form content
takes full foreground contrast.

**Tailwind's `animate-*` utilities are not reduced-motion aware.** The speaking
recorder pulsed regardless. Use the `motion-safe:` variant, or a `globals.css`
utility that is already gated.

## 7. Verification gates (copy these into each screen's e2e)

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

## 8. Quality checklist (pre-done, per screen)

- [ ] Spec/acceptance criteria exist and are met
- [ ] Test written before implementation; suite green
- [ ] Only semantic tokens (no raw hex); serif/sans used per role
- [ ] Reused `ui/` primitives where applicable
- [ ] Responsive at 375 / 768 / 1024 / 1440; no horizontal scroll
- [ ] Light + dark both verified (contrast AA, both themes looked at)
- [ ] Motion gated behind reduced-motion; static fallback correct
- [ ] No console/hydration errors
- [ ] Feature doc updated with implementation audit

## 9. Screens (all built)

Every screen below was rebuilt on the shells and primitives above on
2026-08-14, except the landing page and the dashboard, whose designs were
settled earlier. The dashboard took the shell and kept its layout.

| Screen | Route | Shell | Altitude |
|--------|-------|-------|----------|
| Landing | `/` | own | Marketing, full atmosphere |
| Onboarding | `/start` | `FocusShell` | Calm, focused form |
| Test library | `/tests` | `AppShell` | Calm, scannable |
| Import a paper | `/import` | `AppShell` | Utility, drop target first |
| Pre-test readiness gate | `/mock` | `FocusShell` | Calm, plus system checks |
| Test player (L/R/W/S) | `/mock/run` | own | Calm and clinical, no drama |
| Results | `/mock/results` | `AppShell` | Moderate, honest |
| Review | `/mock/review` | `AppShell` | Calm, content first |
| Progress | `/progress` | `AppShell` | Calm |
| Vocabulary | `/vocab` | `AppShell` | Calm, study focused |
| Account | `/account` | `AppShell` | Plain form |
| Dashboard | `/dashboard` | `AppShell` | Moderate, one clear next step |
| Sign in / sign up | `/sign-in`, `/sign-up` | `AuthShell` | Split screen, brand panel |

> The test player deliberately breaks from the landing page's marketing energy.
> It has to feel like an exam, not a brochure: the same tokens and primitives,
> minimal motion, maximum clarity.

Feature docs live in [`../features/`](../features/).
