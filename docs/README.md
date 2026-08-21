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
| **Reference** | [`content-authoring-format.md`](./content-authoring-format.md) | Markdown dialect for authoring a new test (spec) |
| **Ops** | [`deploy.md`](./deploy.md) | Vercel deploy (public, sample-only; Cambridge never deployed) |
| **Skill spec** | [`features/listening.md`](./features/listening.md) | Play-once audio, single timer |
| **Skill spec** | [`features/reading.md`](./features/reading.md) | 60-min block, highlight/review tools |
| **Skill spec** | [`features/writing.md`](./features/writing.md) | 20/40 split, submission capture |
| **Skill spec** | [`features/speaking.md`](./features/speaking.md) | 3-part format, timed prompts + audio capture |

**Full mock flow:** `/` → `/start` → `/tests` → `/mock?test=<id>` → `/mock/run`
→ `/mock/results` → `/mock/review` · `/progress` · `/vocab`.
**Signed-in home:** `/dashboard` (next action + snapshot) · `/account` (edit
target band / test date). Post-sign-in lands on `/dashboard`.

## Locked decisions (2026-07-25)

1. **Test type:** Academic (first)
2. **MVP:** Full mock exam — all four skills in one authentic sitting
3. **Stack:** Next.js + Vercel + Vercel AI SDK
4. **Scoring:** Deferred — objective auto-scoring for Listening/Reading in MVP;
   Writing/Speaking capture submissions for later (manual → AI) scoring
5. **Launch mode:** **Public product** *(2026-07-26 pivot from "private personal
   tool")* — real users sign up. **Deployed content must be original or
   licensed**; Cambridge material is **never** deployed. The Cambridge ingester
   stays a **local-only dev aid** (gitignored output, never shipped). Public
   launch needs a Clerk **production** instance.
   See [`../content/README.md`](../content/README.md).
6. **Build strategy:** **mock-first FE** — every screen built against a
   localStorage repository seam ([ADR-0005](./architecture/decisions/0005-repo-structure.md),
   `@composed/domain`); real DB/auth/AI scoring deferred to the BE phase.

## Current status (2026-08-22)

**FE phase complete & deployed** — the whole mock flow works end-to-end; **live
on Vercel** at `ielts-traning-web-nhgz.vercel.app` (sample-only; Cambridge
content never deployed, per [`content/README.md`](../content/README.md)).
Auto-deploys on push to `main`. See [`deploy.md`](./deploy.md).

**BE phase — Phases 1–3 done & live:**
- **Database:** Neon Postgres + Drizzle ORM ([ADR-0003](./architecture/decisions/0003-database.md)).
  Schema (`profile`/`attempt`/`vocab`, keyed off Clerk's `userId`) migrated to Neon.
  *(A same-day move to Supabase was recorded and reverted — see
  [ADR-0009, withdrawn](./architecture/decisions/0009-database-supabase.md).)*
- **Auth:** **Clerk** (`@clerk/nextjs`) — one-click social + email OTP, hosted in
  our split-screen sign-in shell ([ADR-0002](./architecture/decisions/0002-auth-provider.md)).
  `proxy.ts` middleware; app tables key off Clerk's `userId`. *Guest-first
  preserved.* Currently Clerk **dev** keys (prod instance needed for launch).
- **Persistence & real-time sync** ([ADR-0007](./architecture/decisions/0007-client-data-sync.md)):
  signed-in users' vocab/attempts/progress mirror to Neon via auth-guarded server
  actions. Attempts hydrate on load (cross-device resume) + debounced
  write-through; guest→account migration on first sign-in. Guests stay local.

**Content ingestion:** seed-anchored ingester
(see [`content/ingest/README.md`](../content/ingest/README.md)); Cambridge 15
Reading Test 1 sittable locally (gitignored, copyright).

**Authored content:** markdown → committed `Test` pipeline
([ADR-0008](./architecture/decisions/0008-authored-content-pipeline.md),
format in [`content-authoring-format.md`](./content-authoring-format.md)).
**Built** — the parser and the `content:build` CLI landed 2026-08-13; the two
parsers (authored content and the `/import` screen) carry 50 tests between them.

**UI foundation:** every screen sits on `AppShell` or `FocusShell` with real
navigation, plus a shared primitive set in `components/ui/`
([ADR-0010](./architecture/decisions/0010-app-shell-and-ui-foundation.md),
recipe in [`frontend/screen-playbook.md`](./frontend/screen-playbook.md)).

**Repo:** public since 2026-08-22. History was rewritten first to drop the
Cambridge reference seed; see [`../content/README.md`](../content/README.md) for
what may and may not be committed.

**Next:** server-side scoring/answer-keys (deferred fidelity rule), AI
band-scoring for W/S, Clerk **production** instance (for public launch), ingestion
follow-ups (MCQ-multi/option-list text, seed-free scaling).

## Status legend

Docs use `🟢 stable` · `🟡 draft` · `🔴 TBD / needs decision` markers in their
headers so we can see at a glance what's settled vs. open.
