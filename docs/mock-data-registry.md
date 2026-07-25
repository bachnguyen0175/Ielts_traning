# Mock-data registry

> Every piece of **temporary / placeholder data** in the codebase, in one place,
> so it can be swapped for live production data in the BE phase. This is a
> consequence of the **mock-first** build strategy
> ([ADR-0005](./architecture/decisions/0005-repo-structure.md),
> [ADR-0006](./architecture/decisions/0006-content-ingestion.md)).

Placeholders added for the vocabulary feature (items 4–5) carry a `⚠️` code
comment pointing back here; the older mock-first pieces (items 1–3, 6–8) each
carry an explanatory header comment at their location.

| # | What's mocked | Location | Replaced in BE phase by |
|---|---------------|----------|--------------------------|
| 1 | **All persistence** — profile, attempts, saved vocab live in the browser's `localStorage` | `apps/web/src/lib/data/local.ts` (`LocalProfileRepository`, `LocalAttemptRepository`, `LocalVocabRepository`) | Real database behind the **same repository interfaces** (`repositories.ts`) — no UI changes. See [ADR-0003](./architecture/decisions/0003-database.md). |
| 2 | **Sample mock content** — one original test with **shortened section durations** (e.g. Listening 360s) so timers are testable, plus a placeholder audio asset `public/audio/sample-listening.wav` | `apps/web/src/lib/content/sample-mock.ts` | Full-length licensed/original content with real durations + real audio. |
| 3 | **Ingested Cambridge tests** — real prose, but **gitignored & private-use only** (copyright) | `apps/web/src/lib/content/ingested/*.data.json` | Licensed content, or kept private per [ADR-0006](./architecture/decisions/0006-content-ingestion.md). |
| 4 | **SRS scheduler** — simplistic Leitner boxes with fixed intervals | `apps/web/src/lib/srs.ts` | Real spaced-repetition (SM-2/FSRS) with server-side, timezone-correct scheduling. |
| 5 | **Example flashcard words** — demo words shown only via "Load example words" on an empty `/vocab` | `apps/web/src/lib/content/example-vocab.ts` | Nothing — vocabulary comes only from words the user saves. Safe to delete. |
| 6 | **Band-conversion tables** — approximate/illustrative raw→band thresholds | `packages/domain/src/scoring/band-conversion.ts` | Official conversion tables per content set. |
| 7 | **Objective band projection** — projects the short sample's raw score to a /40 indicative band | `apps/web/src/lib/scoring.ts` | Direct scoring against full-length tests. |
| 8 | **Writing/Speaking scoring** — submissions are **captured, not scored** | player + results/review screens | AI band-scoring (Vercel AI SDK) — RES-6/7, REV-6. |

## How to keep this accurate

- When you add placeholder data, add a `⚠️` code comment linking here and a row above.
- When the BE phase replaces an item, delete its row (and the `⚠️` flag).
- The **repository seam** (`apps/web/src/lib/data/repositories.ts`) is the boundary
  that makes items 1 (and 3–5's persistence) swappable without touching screens.
