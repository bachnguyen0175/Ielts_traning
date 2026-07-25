# Feature: Listening

> Status: 🟡 draft · MVP scope

## Purpose

Reproduce the IELTS Academic Listening section: 40 questions, four parts, audio
that plays **exactly once**.

## Authentic behavior (must match)

- Audio plays through **once**; no pause, rewind, or replay controls.
- Single running timer for the section (~30 min + a short review window).
- Difficulty rises across Parts 1→4 (social → academic).
- No correctness feedback during or immediately after the section.

## MVP scope

- Stream one seeded audio track (or per-part tracks) under play-once rules.
- Render questions synchronized to the audio timeline (or as a scrollable set,
  matching computer-delivered layout).
- Support core question types: MCQ, form/note/table completion, matching.
- Autosave answers; flag-for-review supported.
- On section end → answers submitted; **auto-scored** from the answer key at
  test completion.

## Out of scope (MVP)

- Multiple listening tests / large bank.
- Per-question audio segmentation UI beyond what fidelity requires.

## Scoring

Objective: raw /40 → band via [BandConversion](../architecture/data-model.md).
Answer matching handles case-insensitivity and accepted alternates.

## Open questions

- 🔴 How strictly to prevent audio re-fetch/replay (client rule vs. streaming
  strategy) — see [system-design.md](../architecture/system-design.md).
- Do we mirror paper "transfer time" or the computer-delivered review window?
  (Leaning computer-delivered.)
