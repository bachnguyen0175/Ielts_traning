# Feature: Writing

> Status: 🟡 draft · MVP scope (capture only; scoring deferred)

## Purpose

Reproduce IELTS Academic Writing: **two tasks, 60 minutes**, typed in-app.
Task 2 weighted more heavily than Task 1.

## Authentic behavior (must match)

- **Task 1 (~20 min, ≥150 words):** describe visual data (chart/table/map/process).
- **Task 2 (~40 min, ≥250 words):** formal essay.
- One shared **60-minute** budget; the 20/40 split is guidance, not a hard lock
  (matching the real test).
- Live **word count** (as computer-delivered provides).
- No scoring/feedback shown mid-test.

## MVP scope

- Present Task 1 prompt + data image, and Task 2 essay prompt.
- Plain in-app text editor per task with word count and autosave.
- Enforce the 60-min timer; auto-submit on expiry.
- **Capture** both submissions as text linked to the attempt.
- Results screen shows submissions alongside the **four band criteria** as a
  self-review checklist (no numeric score).

## Out of scope (MVP)

- **AI band scoring → Phase 2** (per-criterion bands + rationale).
- Rich-text formatting, spell-check assist (real test has none).

## Scoring path

- **MVP:** deferred — self-review against
  [band descriptors](../domain/band-descriptors.md).
- **P2:** LLM (Vercel AI SDK) returns a band per criterion **with cited evidence**;
  calibrate against a labeled set before trusting.

## Open questions

- 🔴 Do we enforce minimum word counts or just warn (real test penalizes under-length)?
- Editor behavior: monospace vs. prose; paste allowed?
