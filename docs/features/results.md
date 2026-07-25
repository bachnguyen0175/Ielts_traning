# Feature: Results (`/mock/results`)

> Status: 🟢 v1 (2026-07-25) · MVP

## Behavior
- On finish, `computeObjectiveResults` (app) runs the `@composed/domain` scorer
  over Listening + Reading, converts raw→band, and persists via
  `AttemptRepository.complete` (idempotent — recomputed only if absent).
- **Results asymmetry resolved (RES-5):** L/R bands shown immediately; Writing +
  Speaking shown as **"Captured — pending review"** (dashed cards).
- Big overall card (Listening + Reading), per-skill band + raw/max correct,
  reusing the hero band-badge visual.
- CTAs: **Review answers** (`/mock/review`) · **Your progress** (`/progress`).

## Indicative-band note
The sample mock is shorter than a real 40-question test, so the band is derived
from **% correct projected onto the /40 scale** — an *indicative* band, labelled
as such. Real full-length tests use the raw table directly.

## Implementation
- `lib/scoring.ts` (`scoreObjectiveSections`, `computeObjectiveResults`) + test.
- `components/results/results-view.tsx` (presentational) + `results-client.tsx`.

## Verification
- Unit: perfect responses → band 9 both skills, overall 9; partial → lower.
- RTL: bands, raw/max, pending W/S, review link.
- E2E: finishing a mock shows the objective score + 2 pending + review link.
