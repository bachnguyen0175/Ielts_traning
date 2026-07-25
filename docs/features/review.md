# Feature: Review (`/mock/review`)

> Status: 🟢 v1 (2026-07-25) · MVP

## Behavior (post-test — feedback now allowed)
- **Listening & Reading (REV-1/2):** per-question list showing the user's answer,
  a correct/incorrect mark, and the correct answer revealed for wrong ones; a
  per-section correct count. Passages/audio context available from the sitting.
- **Writing (REV-3):** the user's essay(s) shown back, with the four Writing band
  criteria as a self-review checklist.
- **Speaking (REV-4):** playback of the recorded audio (if any) + the four
  Speaking criteria checklist.

The **boundary rule holds**: these aids only appear here, never during the sitting.

## Implementation
- `lib/review.ts` (`reviewSection` — joins domain marks with the answer key) + test.
- `components/review/review-view.tsx` (presentational) + `review-client.tsx`.

## Verification
- Unit: `reviewSection` correctness; `ReviewView` marks + revealed answers + criteria.
- E2E: answer one question, finish, open review → correct mark + criteria visible.
