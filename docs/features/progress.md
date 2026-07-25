# Feature: Progress (`/progress`)

> Status: 🟢 v1 (2026-07-25) · MVP

## Behavior
- **Empty state** (PROG-1) with a "Start your first mock" CTA when there are no
  attempts.
- **Target band** card (from the onboarding profile) + **latest** objective band.
- **Attempt history** (PROG-1), most-recent first — date, objective band or "In
  progress", and a "View results" link per scored attempt.
- **Retake** (PROG-2): "Start a new mock" → `/mock`.
- Progress-toward-target (PROG-3) shown as target vs. latest for now; a trend
  line can follow.

## Implementation
- `components/progress/progress-view.tsx` (presentational) + `progress-client.tsx`
  (reads `AttemptRepository.list()` + `ProfileRepository`).

## Verification
- Unit: empty state; target + latest + history; most-recent-first ordering.
- E2E: empty state; after a sitting, history lists the attempt + retake CTA.
