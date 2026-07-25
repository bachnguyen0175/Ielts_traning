# Feature: Landing Page

> Status: 🟢 implemented (v1, 2026-07-25) · MVP scope · **Decision: build an elaborate, high-polish page**

## Implementation audit (2026-07-25)

Built at `apps/web/src/app/page.tsx` + `apps/web/src/components/landing/*`. Verified with 9 unit
tests (Vitest/RTL) and 6 E2E tests (Playwright, live server), lint clean, static
build passing. Screenshots reviewed in light + dark + mobile.

| Spec requirement | Status | Notes |
|------------------|--------|-------|
| Hero: headline, subhead, primary CTA, hero visual | ✅ | Stylized exam-interface mock (timer, question, nav) as the visual |
| The problem ("prepared but freeze") | ✅ | `Problem` section |
| Differentiator / how it works (3–4 blocks) | ✅ | 4 cards: play-once, real timing, full sitting, exam interface |
| The experience (mock UI showcase) | ✅ | `Experience` with listening mock + "no feedback until submit" points |
| Skills covered (L/R/W/S) | ✅ | `Skills` section |
| Final CTA | ✅ | Indigo panel, amber CTA |
| Footer (minimal) | ✅ | + honest non-affiliation disclaimer |
| Deferred: testimonials / pricing / blog | ✅ | Correctly omitted |
| Responsive (mobile→desktop) | ✅ | E2E asserts no horizontal overflow at 375px |
| Theme-aware (light/dark) | ✅ | Verified both; fixed dark-mode eyebrow/timer contrast |
| Accessible (landmarks, focus, reduced-motion) | ✅ | banner/main/contentinfo, focus-visible rings, reduced-motion honored |
| Fast (CWV) | ✅ | `next/font` self-hosted, statically prerendered |

**Decisions made during build (previously open questions):**
- Hero visual → **stylized interface mock** (not a real screenshot), since no
  real product UI exists yet.
- Primary CTA → routes to `/start`, an **honest "coming soon" stub** (the
  onboarding-vs-guest fork is still open, so no invented flow).

**Still open / deferred:** launch mode (public vs. closed beta); real brand
logo/mark (using a simple wordmark for now).

## Decision (2026-07-25)

The landing page is a **deliberate, high-investment** surface — designed to be as
polished and visually striking as possible. This is an explicit **exception** to
the "simplicity first" default (see [`CLAUDE.md`](../../CLAUDE.md)): here, visual
craft *is* the job.

**Why it earns the investment:** the product's value proposition —
"we recreate authentic test-day pressure" — is counterintuitive. A first-time
visitor could mistake it for another quiz app. The landing page is what makes the
differentiator **legible and credible** before anyone commits to a 2h45m sitting.
It is the top of the funnel (journey step 1).

## Goals

1. Make the problem instantly relatable — "you know the material but freeze on test day."
2. Communicate the differentiator — **authentic conditions** (play-once audio, real timing, full sitting).
3. Convey premium credibility through design quality.
4. Drive one clear action — start a mock / sign up.
5. Set the expectation that this is a real, full-length sitting (so the pre-test readiness gate isn't a surprise).

## Content sections (proposed)

1. **Hero** — sharp headline (problem → promise), subhead, primary CTA, and a
   hero visual (ideally a glimpse of the real test interface).
2. **The problem** — the "prepared but underperform" gap, named emotionally.
3. **The differentiator / how it works** — 3–4 blocks: audio plays once · real
   timing · full 2h45m sitting · the computer-delivered interface.
4. **The experience** — a showcase of the authentic mock UI (screenshot/mock).
5. **Skills covered** — Listening · Reading · Writing · Speaking.
6. **Final CTA** — repeat the primary action.
7. **Footer** — minimal.

## Explicitly deferred (not MVP)

- Testimonials / social proof (no users yet — don't fabricate).
- Pricing tiers (monetization undecided).
- Blog / multi-page marketing site.

## Design principles

- **Visual polish is the priority** — typography, spacing, motion, and imagery
  should feel premium and intentional.
- **Responsive** — flawless on mobile through desktop.
- **Theme-aware** — support light and dark.
- **Accessible** — WCAG-minded contrast, semantics, keyboard/focus, reduced-motion.
- **Fast** — it's the funnel; strong Core Web Vitals (image optimization, minimal
  blocking assets). Beauty must not cost load time.

## Open questions

- ✅ **Launch mode — decided: PRIVATE personal study tool** (2026-07-25). Enables
  Cambridge content ingestion for personal use; must never be publicly
  distributed. See [`../../content/README.md`](../../content/README.md).
- ✅ Visual direction / brand — **decided: "Composed"** (calm/academic/premium;
  ivory paper + ink + indigo + amber; Fraunces + Inter). See
  [`../design/visual-direction.md`](../design/visual-direction.md).
- Hero visual: real interface screenshot vs. stylized illustration.
- Does the primary CTA go to sign-up, or allow a guest mock first? (Ties to the
  "guest attempts" journey fork.)
