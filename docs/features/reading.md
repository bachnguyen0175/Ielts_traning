# Feature: Reading

> Status: 🟡 draft · MVP scope

## Purpose

Reproduce IELTS Academic Reading: **3 passages, 40 questions, 60 minutes**, with
the computer-delivered interaction tools.

## Authentic behavior (must match)

- Single 60-minute timer for the whole section — **no per-passage clock**, no
  extra transfer time.
- Passages are academic-register texts (books, journals, magazines).
- Split-view: passage on one side, questions on the other (computer-delivered).
- Text **highlight** and **note/review** tools available.
- No correctness feedback mid-test.

## MVP scope

- Render 3 seeded passages + 40 questions across the variety of types (TFNG,
  matching headings/information, completion, MCQ, short answer).
- Highlight tool on passage text; question navigation + flag-for-review.
- Autosave answers; enforce the 60-min timer with auto-submit on expiry.
- Auto-score from the answer key at completion.

## Out of scope (MVP)

- Multiple reading tests.
- Rich annotation (only highlight in MVP; notes optional).

## Scoring

Objective: raw /40 → band via the **Academic** conversion table (stricter than
General). Flexible answer matching for completion/short-answer.

## Open questions

- 🔴 Exact highlight persistence model (store ranges per attempt?).
- Which completion-answer normalization rules (articles, plurals, numerals)?
