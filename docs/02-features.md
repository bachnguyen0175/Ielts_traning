# Feature Catalog

> Status: 🟡 draft — **awaiting user audit**
>
> Derived from the user journey (not brainstormed): every feature traces to a
> journey step, so the list stays grounded. Phase tags map to the roadmap in
> [`01-scope-mvp.md`](./01-scope-mvp.md). Requirement notes feed the open ADRs.

## Implementation status — FE phase (2026-07-25)

The mock-first FE is **built end-to-end and verified** (guest-first, localStorage;
real DB/auth/AI scoring still deferred to the BE phase). Screens delivered:

| Screen | Route | Feature doc | Key features live |
|--------|-------|-------------|-------------------|
| Landing | `/` | [landing-page](./features/landing-page.md) | LP-1..4 |
| Onboarding | `/start` | [onboarding](./features/onboarding.md) | ON-1(guest)/2/3 |
| Test library | `/tests` | [test-library](./features/test-library.md) | catalog, per-test start |
| Pre-test gate | `/mock` | [pre-test](./features/pre-test.md) | PT-1..5 |
| Test player | `/mock/run` | [test-player](./features/test-player.md) | SIT-1/2/3/5/6/7/8/9/10/12 |
| Results | `/mock/results` | [results](./features/results.md) | RES-1/2/3/4/5 |
| Review | `/mock/review` | [review](./features/review.md) | REV-1/2/3/4 |
| Vocabulary | `/vocab` | [vocabulary](./features/vocabulary.md) | REV-7 (FE; SRS mocked) |
| Progress | `/progress` | [progress](./features/progress.md) | PROG-1/2/3(partial) |

Shared: `@composed/domain` (scorer, band conversion, timing) + `lib/data`
repository seam + original sample mock content. **Verification:** ~60 unit/RTL
tests + 17 E2E, build + lint green.

**BE phase progress:** ✅ **auth** (Auth.js magic-link/Resend) + ✅ **database**
(Neon + Drizzle) done & live — schema migrated, sign-in verified in prod. ⏳
**Phase 3 next:** DB-backed repositories + guest→account migration (progress
persists to Neon). **Still deferred:** AI band-scoring for W/S (RES-6/7, REV-6),
live AI examiner (P3), licensed full-length content, analytics.

## How to read this

- **ID** — stable handle (`LP`, `ON`, `PT`, `SIT`, `RES`, `REV`, `PROG`, `X`).
- **Phase** — `MVP` · `P2` (credible scoring) · `P3` (live Speaking) · `P4`
  (scale & content) · `P5` (breadth). See roadmap.
- **Needs** — what the feature requires from infra (auth / DB / blob / etc.),
  so the parked decisions ([ADR-0002](./architecture/decisions/0002-auth-provider.md),
  [0003](./architecture/decisions/0003-database.md),
  [0004](./architecture/decisions/0004-attempt-resumability.md)) inherit real
  requirements.
- **🔱 fork** — depends on an unresolved journey fork (see bottom); listed, not
  yet decided.

---

## Step 1 — Discovery

| ID | Feature | Phase | Needs |
|----|---------|-------|-------|
| LP-1 | Elaborate landing page ([spec](./features/landing-page.md)) | MVP | static |
| LP-2 | Value-prop / how-it-works content (authentic conditions) | MVP | static |
| LP-3 | Interface preview / hero visual | MVP | asset |
| LP-4 | SEO, meta tags, social-share cards | MVP-lite | static |
| LP-5 | Guest "try a sample" entry point | 🔱 fork | — |

## Step 2 — Sign up & onboarding

| ID | Feature | Phase | Needs |
|----|---------|-------|-------|
| ON-1 | Sign up / sign in | MVP | **auth**, user store |
| ON-2 | Capture target band | MVP | user profile (DB) |
| ON-3 | Capture test date | MVP | user profile (DB); drives PROG-3 |
| ON-4 | Email verification / password reset | MVP | auth provider |
| ON-5 | Profile management (edit goal/date) | MVP-lite | DB |
| ON-6 | Academic vs. General selection | P5 | content model |
| ON-7 | Diagnostic / placement test | P4 | scoring, content |

## Step 3 — Pre-test readiness gate

| ID | Feature | Phase | Needs |
|----|---------|-------|-------|
| PT-1 | Mock selection / test catalog | MVP | DB (content) |
| PT-2 | Conditions & instructions screen | MVP | static |
| PT-3 | System check — audio playback | MVP | client |
| PT-4 | System check — microphone | MVP | client (mic perm) |
| PT-5 | Readiness confirmation ("~2h45m, finish in one sitting") | MVP | — |
| PT-6 | Resume-or-restart an interrupted attempt | 🔱 fork | DB; [ADR-0004](./architecture/decisions/0004-attempt-resumability.md) |

## Step 4 — The sitting (hero experience)

| ID | Feature | Phase | Needs |
|----|---------|-------|-------|
| SIT-1 | Timing engine — **server-authoritative** clock | MVP | server time, DB |
| SIT-2 | Section sequencing + auto-advance on expiry | MVP | DB (attempt cursor) |
| SIT-3 | Listening player — **plays once**, no pause/rewind/replay | MVP | audio delivery |
| SIT-4 | Reading split-view (passage ↔ questions) | MVP | content (DB) |
| SIT-5 | Text highlight tool (**Reading passages only** — authentic; no Listening transcript exists during the test, see REV-2b) | MVP | store ranges per attempt (DB) |
| SIT-6 | Question navigation + flag-for-review | MVP | DB |
| SIT-7 | Answer autosave (crash-safe cadence) | MVP | DB (frequent writes) |
| SIT-8 | Writing editor + live word count | MVP | text capture (DB) |
| SIT-9 | Speaking prompt player + per-part timers (Part 1/2/3, 1-min prep) | MVP | content |
| SIT-10 | Speaking audio recording + upload | MVP | **blob storage**, mic |
| SIT-11 | Question-type renderers (MCQ, TFNG, matching, completion, …) | MVP | data model |
| SIT-12 | No mid-test feedback (enforced) | MVP | server rule |
| SIT-13 | Integrity — answer keys server-side, audio not trivially re-fetchable | MVP | server, delivery strategy |

## Step 5 — Submission & results

| ID | Feature | Phase | Needs |
|----|---------|-------|-------|
| RES-1 | Objective auto-scorer (L/R) using answer-match policies | MVP | DB (answer keys) |
| RES-2 | Raw → band conversion (Academic tables) | MVP | conversion-table data |
| RES-3 | Submission capture persistence (W text, S audio) | MVP | DB + blob |
| RES-4 | Results screen — L/R scored, W/S "pending review" | MVP | DB |
| RES-5 | Overall band calculation | 🔱 fork | DB; results-asymmetry call |
| RES-6 | AI Writing scoring — 4 criteria + cited evidence | P2 | AI SDK |
| RES-7 | AI Speaking scoring — 4 criteria | P3 | AI SDK, transcription |
| RES-8 | Score report export / share | P4 | — |

## Step 6 — Review (where learning happens)

> **Boundary rule:** learning aids that don't exist in the real exam
> (transcripts, vocab tools, explanations) live **only in Review**, never in the
> sitting. Adding them mid-test would break the authentic-conditions thesis.

| ID | Feature | Phase | Needs |
|----|---------|-------|-------|
| REV-1 | Answer review — user vs. correct, per question | MVP | DB |
| REV-2 | Passage / audio review with answers revealed | MVP | content |
| REV-2b | **Listening transcript** shown in Review, with **highlight** tool — Review ONLY, never during the sitting (no transcript exists in the real test) | P2 | content (transcripts) |
| REV-3 | Own-essay review + band-criteria self-checklist | MVP | DB |
| REV-4 | Speaking audio playback + self-checklist | MVP | blob |
| REV-5 | Answer explanations | P4 | content authoring |
| REV-6 | AI feedback on Writing / Speaking | P2 / P3 | AI SDK |
| REV-7 | **Vocabulary annotation** — save words from passages/transcripts during Review, with an optional **flashcard / spaced-repetition** study interface | P4 → **FE built** (`/vocab`; SRS mocked) | DB + real SRS (BE); ⚠️ see notes |

**REV-7 notes (recorded caveats):**
- **Off-core:** a study/retention feature, not a test-condition one. Nudges
  product identity toward "study platform" — the vision's stated non-goal
  ("not a content-teaching platform"). Do with eyes open; keep out of MVP.
- **Boundary:** annotate **post-test only** (from what you just sat). No vocab
  tool during the sitting.
- **Build vs. integrate:** SRS scheduling is deceptively deep (cf. Anki/Quizlet).
  Prefer export/integration for an MVP of this feature before building our own.

## Step 7 — Return & progress

| ID | Feature | Phase | Needs |
|----|---------|-------|-------|
| PROG-1 | Attempt history | MVP | DB |
| PROG-2 | Retake / start a new mock | MVP | DB |
| PROG-3 | Progress toward target band over time | MVP-lite (L/R) → P2 (W/S) | DB, multiple attempts |
| PROG-4 | Weak-area / skill breakdown analytics | P4 | analytics |
| PROG-5 | Multiple test versions / larger question bank | P4 | content pipeline |
| PROG-6 | Study recommendations / plan | P5 | analytics, content |

---

## Cross-cutting / platform features

These aren't a single journey step — they underpin many. This is the section
that most directly informs the parked infra ADRs.

| ID | Feature | Phase | Needs |
|----|---------|-------|-------|
| X-1 | Auth & session management | MVP | [ADR-0002](./architecture/decisions/0002-auth-provider.md) |
| X-2 | Database / persistence layer | MVP | [ADR-0003](./architecture/decisions/0003-database.md) |
| X-3 | Blob storage (audio, images) | MVP | provider TBD (likely Vercel Blob) |
| X-4 | Content model + ingestion pipeline (seed → schema) | MVP | DB; see `content/` |
| X-5 | Server-authoritative timing & answer keys (fidelity core) | MVP | server |
| X-6 | Audio asset delivery / streaming | MVP | blob/CDN |
| X-7 | Privacy & retention policy for recordings (PII) | MVP (policy) | legal/ops |
| X-8 | Feature flags (staged rollout) | P4 | — |
| X-9 | Observability / product analytics | P4 | — |
| X-10 | Tutor / classroom features | P5 | multi-tenant model |
| X-11 | Monetization / billing | P5 | payments |

---

## Implied infrastructure requirements (feeds the ADRs)

Derived from the MVP-tagged rows above — this is the requirement set to decide
the database/auth/blob against once scope is locked:

- **Relational, transactional data:** users, profiles (target band, test date),
  tests → passages → question-groups → questions → answer keys, attempts,
  response items, submissions, section results. → **ADR-0003** (leaning Postgres).
- **Frequent small writes:** answer autosave (SIT-7) at a crash-safe cadence.
- **Blob storage:** Speaking audio (write-heavy, PII) + Listening/Reading/Writing
  assets (read-heavy). → **X-3**, retention policy **X-7**.
- **Auth with profile fields + session:** ON-1..ON-5. → **ADR-0002**.
- **Server as source of truth:** timing (SIT-1) and answer keys (SIT-13) must not
  live client-side. → **X-5**.
- **Attempt resumability model:** governs SIT-1 clock behavior + PT-6. →
  **ADR-0004**.

---

## Open forks affecting features (unresolved)

These journey decisions gate the 🔱 features above. Recommend closing before the
catalog is finalized:

1. **Guest attempts vs. account-first** — gates **LP-5** and where the landing
   CTA points. *(Lean: TBD.)*
2. **Results asymmetry** (instant L/R next to pending W/S) — gates **RES-5** and
   the results-screen design. *(Lean: show partial immediately.)*
3. **Modular practice vs. full-sitting-only** — would add a whole "single-section
   practice" feature family; deliberately excluded from MVP for now.
4. **Onboarding depth** — whether ON-2/ON-3 are required up front or deferred.
   *(Lean: capture up front.)*
