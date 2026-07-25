# Feature: Speaking

> Status: 🟡 draft · MVP scope (timed prompts + audio capture; no live examiner)

## Purpose

Reproduce the **format** of IELTS Speaking — three parts, 11–14 min — as timed
prompts with the candidate's responses **recorded** for later review. A live AI
examiner is explicitly deferred.

## Authentic behavior (must match)

- **Part 1 (4–5 min):** intro + familiar-topic questions.
- **Part 2 (3–4 min):** cue card → **1 min prep** → speak **1–2 min**.
- **Part 3 (4–5 min):** discussion on abstract themes tied to Part 2.
- Timers per part/prompt; Part 2 enforces the 1-min prep then the speaking window.

## MVP scope

- Present prompts/cue card sequentially with the correct timers.
- Record microphone audio per prompt (or per part); upload to blob storage,
  linked to the attempt.
- Playback of own recordings on the results screen for self-review against the
  **four Speaking criteria**.

## Out of scope (MVP)

- **Live AI examiner / conversational turns → Phase 3.**
- Transcription, pronunciation analysis, band scoring.
- Dynamic follow-up questions (prompts are fixed/seeded in MVP).

## Scoring path

- **MVP:** deferred — self-review against
  [band descriptors](../domain/band-descriptors.md).
- **P3:** transcription + AI examiner + per-criterion Speaking bands
  (Fluency, Lexical, Grammar, Pronunciation).

## Open questions

- 🔴 Audio format, quality, and **retention/privacy policy** (recordings are PII).
- Mic permission + fallback UX if recording fails mid-part.
- One continuous recording vs. per-prompt clips (affects review + future scoring).
