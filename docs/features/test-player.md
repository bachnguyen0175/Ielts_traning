# Feature: Test player (`/mock/run`)

> Status: 🟢 v1 — shell + timing + authentic per-skill enrichments (2026-07-25)

## Timing engine (design note)

The countdown is **anchored to a persisted `startedAt`** (per section), not a
free-running client counter. Remaining time = `duration − (now − startedAt)`, so
a reload resumes with the clock still running ("resume with elapsed-time
enforcement" — resolves ADR-0004 for mock mode). All timing math lives in
`@composed/domain` (`remainingSeconds`, `isExpired`, `formatClock`,
`nextSectionIndex`) and is unit-tested; the UI hook `useCountdown` ticks it once
a second and fires `onExpire` exactly once.

## Behavior (v1)
- Section header: progress ("Section N of 4") + live timer (accent under 60s).
- **Auto-advance on expiry** and manual "Next section"; last section → "Finish
  mock" → `/mock/results`.
- **Question nav** strip (L/R): answered (filled) + flagged (ring) states; click
  toggles a flag (SIT-6).
- **Autosave**: every answer/flag/submission persists via `AttemptRepository`
  immediately (SIT-7); reload restores state.
- **No mid-test feedback** (SIT-12) — the renderer never shows correctness.
- Question renderer supports the sample mock's types: MCQ (letters), TFNG (enum),
  completion (text).

## Authentic per-skill enrichments (built)
- **Listening** — play-once audio: a single Play action, no pause/rewind, disabled
  after use (`listening-audio.tsx`, SIT-3). Real short WAV asset in `public/audio`.
- **Reading** — text **highlight** tool on the passage (`highlightable-passage.tsx`,
  SIT-5; memoized so answering doesn't wipe highlights; ephemeral for now).
- **Writing** — live **word count** vs. target, under-length hint (`lib/text.ts`).
- **Speaking** — best-effort **`MediaRecorder`** capture with graceful fallback
  (`speaking-recorder.tsx`, SIT-10); playback for later review.

## Implementation
- `components/player/`: `use-countdown.ts`, `question-renderer.tsx`,
  `section-view.tsx`, `player.tsx`, `run-client.tsx`.
- `app/mock/run/page.tsx` (Suspense + `RunClient` reading `?a=<attemptId>`).

## Verification
- Unit: countdown (fake timers), question renderer, player (advance/finish/flag/
  no-feedback).
- E2E: full 4-section sitting → results; answer autosaves across a reload.
- Build + lint green.

## Deferred
- Highlight persistence across reloads; letter-set ("choose TWO") renderer (not
  in the sample); real Listening audio content (private ingestion path).
