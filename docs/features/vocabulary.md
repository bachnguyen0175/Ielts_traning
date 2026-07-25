# Feature: Vocabulary / Flashcards (`/vocab`)

> Status: 🟢 v1 — FE built (2026-07-25). Implements **REV-7**. SRS is a
> placeholder (see [mock-data registry](../mock-data-registry.md) #4).

The retention companion to the mock: save words you meet **post-test**, then
study them as flashcards. Deliberately off to the side of the core test-day
experience (REV-7 is a P4, study-platform-adjacent feature) — reachable from
**Review** and **Progress**, never during a sitting.

## Behaviour (v1)

- **Capture (on Review)** — `VocabCapture` lets the candidate save any word from
  the test they just sat; the test title is stored as the word's `source`
  (honours the REV-7 "post-test only" boundary).
- **`/vocab` screen**
  - Add a word + optional definition directly.
  - List of saved words with a **mastery badge** (Leitner box `n/4`) and remove.
  - **Study flashcards** — flip to reveal the definition, grade **Got it** /
    **Review again**; grading updates the word's box via the mock SRS.
  - **Empty state** offers "Load example words" — injects flagged demo words
    (`lib/content/example-vocab.ts`) so the deck is demonstrable before any real
    words exist. Not injected automatically.

## Implementation

- Data seam: `VocabRepository` (`lib/data/repositories.ts`) +
  `LocalVocabRepository` (localStorage) + `vocabRepo()` factory. Swaps for a real
  DB in the BE phase with no UI change.
- Scheduler: `lib/srs.ts` — **placeholder** Leitner boxes (fixed intervals).
- Components: `components/vocab/{flashcard-deck,vocab-client,vocab-capture}.tsx`.
- Route: `app/vocab/page.tsx`.

## Verification

- Unit: `srs.test.ts` (5), `vocab-repo.test.ts` (6), `flashcard-deck.test.tsx` (4).
- E2E: `e2e/vocab.spec.ts` — empty → add → study → complete; load examples.
- Build + lint green.

## Deferred to BE phase

- Real spaced-repetition (SM-2/FSRS) + server persistence + due-date review
  queue (currently a study-all session).
- Saving a word straight from a **highlight** in the passage (currently a
  type-in capture on Review).
- Export/integration (Anki/Quizlet), per REV-7 "build vs. integrate" note.
