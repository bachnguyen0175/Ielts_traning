# IELTS Training — Documentation

Master index for the IELTS preparation application. Every doc has one clear
concern; start here to navigate.

> **Product in one line:** An IELTS practice platform that reproduces authentic
> test-day conditions — strict timing, play-once audio, the real interface —
> so candidates rehearse the *pressure*, not just the *content*.

## Map

| Area | Doc | What it answers |
|------|-----|-----------------|
| **Vision** | [`00-vision.md`](./00-vision.md) | Why we're building this, for whom, how we win |
| **Scope** | [`01-scope-mvp.md`](./01-scope-mvp.md) | What's in/out of the MVP, phased roadmap |
| **Features** | [`02-features.md`](./02-features.md) | Full feature catalog derived from the user journey |
| **Domain** | [`domain/ielts-overview.md`](./domain/ielts-overview.md) | IELTS Academic format, timing, sections |
| **Domain** | [`domain/band-descriptors.md`](./domain/band-descriptors.md) | Band scoring, the four criteria for Writing & Speaking |
| **Frontend** | [`frontend/screen-playbook.md`](./frontend/screen-playbook.md) | Repeatable recipe for building any screen at the quality bar |
| **Frontend** | [`design/visual-direction.md`](./design/visual-direction.md) | "Composed" tokens, typography, motion/atmosphere |
| **Architecture** | [`architecture/system-design.md`](./architecture/system-design.md) | Components, data flow, tech stack |
| **Architecture** | [`architecture/data-model.md`](./architecture/data-model.md) | Core entities and relationships |
| **Architecture** | [`architecture/decisions/`](./architecture/decisions/) | ADRs — one file per key decision |
| **Screen** | [`features/landing-page.md`](./features/landing-page.md) | Elaborate, high-polish top-of-funnel page |
| **Screen** | [`features/onboarding.md`](./features/onboarding.md) | Guest-first goal capture (`/start`) |
| **Screen** | [`features/test-library.md`](./features/test-library.md) | Catalog to browse/pick a test (`/tests`) |
| **Screen** | [`features/pre-test.md`](./features/pre-test.md) | Conditions + system check + readiness gate (`/mock`) |
| **Screen** | [`features/test-player.md`](./features/test-player.md) | Timed sitting, timing engine, autosave (`/mock/run`) |
| **Screen** | [`features/results.md`](./features/results.md) | Objective bands + pending W/S (`/mock/results`) |
| **Screen** | [`features/review.md`](./features/review.md) | Answer review + band criteria (`/mock/review`) |
| **Screen** | [`features/vocabulary.md`](./features/vocabulary.md) | Save words + flashcard study (`/vocab`, REV-7) |
| **Screen** | [`features/progress.md`](./features/progress.md) | Attempt history, retake, target (`/progress`) |
| **Reference** | [`mock-data-registry.md`](./mock-data-registry.md) | Every placeholder/mock datum → BE-phase replacement |
| **Ops** | [`deploy.md`](./deploy.md) | Vercel deploy (public, sample-only; Cambridge never deployed) |
| **Skill spec** | [`features/listening.md`](./features/listening.md) | Play-once audio, single timer |
| **Skill spec** | [`features/reading.md`](./features/reading.md) | 60-min block, highlight/review tools |
| **Skill spec** | [`features/writing.md`](./features/writing.md) | 20/40 split, submission capture |
| **Skill spec** | [`features/speaking.md`](./features/speaking.md) | 3-part format, timed prompts + audio capture |

**Full mock flow:** `/` → `/start` → `/tests` → `/mock?test=<id>` → `/mock/run`
→ `/mock/results` → `/mock/review` · `/progress` · `/vocab`.

## Locked decisions (2026-07-25)

1. **Test type:** Academic (first)
2. **MVP:** Full mock exam — all four skills in one authentic sitting
3. **Stack:** Next.js + Vercel + Vercel AI SDK
4. **Scoring:** Deferred — objective auto-scoring for Listening/Reading in MVP;
   Writing/Speaking capture submissions for later (manual → AI) scoring
5. **Launch mode:** **PRIVATE personal study tool** (not publicly distributed) —
   permits Cambridge content ingestion for personal use; never distribute it.
   See [`../content/README.md`](../content/README.md).
6. **Build strategy:** **mock-first FE** — every screen built against a
   localStorage repository seam ([ADR-0005](./architecture/decisions/0005-repo-structure.md),
   `@composed/domain`); real DB/auth/AI scoring deferred to the BE phase.

## Current status (2026-07-25)

**FE phase complete & verified** — the whole mock flow works end-to-end with mock
data (~60 unit + ~18 E2E, build + lint green). See
[`02-features.md` § Implementation status](./02-features.md).

**Content ingestion (started):** a seed-anchored ingester
([ADR-0006](./architecture/decisions/0006-content-ingestion.md),
[`content/ingest/`](../content/ingest/README.md)) turns an
`ieltstrainingonline.com` reading page into a playable `Test`; Cambridge 15
Reading Test 1 is ingested and sittable. Output is gitignored (copyright).

**Next:** BE phase (close [auth](./architecture/decisions/0002-auth-provider.md) +
[database](./architecture/decisions/0003-database.md) ADRs, real persistence,
AI scoring); ingestion follow-ups (MCQ-multi/option-list text, seed-free
scaling).

## Status legend

Docs use `🟢 stable` · `🟡 draft` · `🔴 TBD / needs decision` markers in their
headers so we can see at a glance what's settled vs. open.
