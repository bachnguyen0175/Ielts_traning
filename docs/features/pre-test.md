# Feature: Pre-test readiness gate (`/mock`)

> Status: 🟢 implemented (v1, 2026-07-25) · MVP

## Behavior
- Reached from the **test library** (`/tests`) with `?test=<id>`; defaults to the
  sample if absent. `PretestClient` loads that test.
- **Test summary** — title + total duration ("about 40 minutes" for the sample).
- **Real conditions** restated (PT-2): audio plays once, clock never stops, no
  feedback until submit — so the sitting isn't a surprise.
- **System check** (PT-3/4): a "play test sound" + confirm, and an "enable
  microphone" (best-effort `getUserMedia`, needed for Speaking capture).
- **Readiness gate** (PT-5): a checkbox acknowledging it's one sitting.
- **Start the mock** is **disabled** until audio + mic + readiness are all
  confirmed; then it creates an attempt for the selected test
  (`AttemptRepository`) and routes to `/mock/run?a=<attemptId>` (the player).

## Implementation
- `components/pretest/pretest.tsx` (presentational, `onStart` prop — testable)
  + `pretest-client.tsx` (reads `?test`, content + attempt creation + routing).
- `app/mock/page.tsx` renders it (Suspense-wrapped for `useSearchParams`).

## Verification
- RTL: conditions shown; Start gated until all three checks pass → calls onStart.
- E2E: full gate flow reaches `/mock/run`.
- Build + lint green.

## Notes
- Media APIs are best-effort: `getUserMedia`/audio may be unavailable in some
  environments; the manual confirmations keep the gate usable regardless.
- Mock selection (PT-1) is now the **test library** (`/tests`,
  [test-library.md](./test-library.md)).
