# Feature: Test Library (`/tests`)

> Status: 🟢 v1 (2026-07-25) · MVP

## Behavior
- A catalog of available tests (`ContentRepository.listTests()` → `TestSummary`)
  with title, source, skills, question count, duration, and a **Private** badge
  for Cambridge-derived tests.
- Flow: landing → `/start` onboarding → **`/tests` catalog** → `/mock?test=<id>`
  pre-test → creates an attempt for the chosen test → player.
- Selection plumbing: `PretestClient` reads `?test=<id>` (default sample);
  onboarding routes to `/tests`.

## Implementation
- `components/tests/test-catalog.tsx` (+ test) · `app/tests/page.tsx` (server).
- `ContentRepository.listTests()` returns `TestSummary`; `Test` gained
  `source` + `access` fields.

## ⚠️ Cambridge content boundary (important)
The library is built to **hold** official Cambridge volumes, but the app does
**not** ship Cambridge passages or question wording. Reproducing them is
copyright infringement — and even in a private tool it should be **user-supplied
content you already own**, not scraped/reproduced by the app. (An attempt to
fetch the passage prose was correctly blocked.)

What is safe vs. not:
- ✅ Safe: test structure (skills, question types, counts), short factual answer
  keys, titles/labels.
- ❌ Not shipped: passage prose and exact question wording (copyrighted).

**To add a Cambridge test:** the user supplies the passage/question text they own
(e.g. from their Cambridge book) via a future "import your content" path; the
ingestion then produces a practiceable `Test`. Until then, the catalog ships the
original sample mock only.

## Verification
- RTL: catalog renders tests, start links carry `?test=<id>`, private flag shown.
- E2E: onboarding → `/tests`; starting a test opens its pre-test.
