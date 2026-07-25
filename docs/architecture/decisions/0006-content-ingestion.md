# ADR-0006: Cambridge content ingestion

> Status: Accepted (FE/mock phase)
> Date: 2026-07-25

## Context

The app needs real Cambridge IELTS reading tests to be worth using, but Cambridge
prose and question wording are copyrighted (decision #5: **private study tool,
never distributed**). `ieltstrainingonline.com` publishes the tests — and a
feasibility probe confirmed they are cheaply crawlable: permissive `robots.txt`,
static server-rendered HTML, enumerable URLs
(`cambridge-ielts-{10–21}-reading-test-{1–4}-…`, 301 → canonical slug), and one
page per test carrying all three passages plus an inline answer key and
explanations (justifying sentence `<strong>`-wrapped, tagged `(Qn)`).

We must ingest for personal practice **without ever committing copyrighted prose
to git**.

## Decision

**Seed-anchored ingestion with a gitignored output.** A committed Python
ingester (`content/ingest/`, selectors/logic only — no prose) fetches a page,
parses passage prose + question stems, and **merges** them onto the hand-verified
seed in `content/seeds/` (the answer-key source of truth). The crawler's own
extracted answers are only **cross-checked** against the seed — mismatches are
printed, never silently trusted.

Output is a playable `Test` JSON at
`apps/web/src/lib/content/ingested/<id>.reading.data.json`, which is
**gitignored**. The committed loader (`ingested/index.ts`) defaults to an **empty
list**, so a fresh clone / Vercel build succeeds with only the sample mock
(Cambridge content is never public). Running the ingester **regenerates
`index.ts` locally** to static-import the data files and marks it
`git update-index --skip-worktree`, so the local edit is never committed. Result:
Cambridge is playable locally, absent from git and from any deployment.

## Alternatives considered

- **Bring-your-own-content import UI** — user pastes text they own. Safest, but
  heavy UX for a single-user tool and still needs a parser.
- **Commit parsed content** — simplest to load, but puts copyrighted prose in git
  history. Rejected outright.
- **Crawler answers as source of truth** — skip the seed. Rejected: less reliable
  than a hand-verified key; the seed also documents question types/instructions.
- **`require.context` glob loader** — tried; unsupported under Turbopack (silently
  returned `[]`).
- **`import.meta.glob`** — works in Turbopack's *client* bundle + Vitest, but is
  **not replaced in the server bundle**, so it throws at SSR prerender of the
  `/tests` server component. Rejected.
- **Plain static import of the gitignored file** — works locally but a fresh
  clone / Vercel build fails (`Module not found`). Rejected once deployment
  became a goal → replaced by the `[]`-default + skip-worktree scheme above.

## Consequences

- Prose never enters git **and never reaches a deployment** — the committed
  default is `[]`; the data-importing `index.ts` exists only in the local
  worktree (skip-worktree).
- **Build is deploy-safe:** fresh clone / Vercel builds succeed (sample-only). To
  restore Cambridge locally, run the ingester (one command); documented in
  `ingested/README.md`.
- Verified on Cambridge 15 Test 1: 3 passages of clean prose (892/800/928 words),
  36/40 question stems, 40/40 keys (crawler agrees with the seed on 38; the 2
  diffs are formatting artifacts). Sat end-to-end to a reading band.
- **Follow-ups:** MCQ-multi (Q23–26) and MCQ/matching **option-list text** aren't
  extracted yet (scoring unaffected); ingestion is currently seed-driven, so
  scaling past one test needs seed-free parsing of every question type.
