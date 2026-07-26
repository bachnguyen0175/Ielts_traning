# Reading-test ingester

Turns one `ieltstrainingonline.com` Cambridge reading page into a **playable
`Test` JSON** the app loads. Private-study use only — see
[`../README.md`](../README.md) for the copyright posture.

## What it does

```
fetch page (follows 301)  →  parse prose + question stems + answers
   →  merge onto the seed (authoritative answer keys)  →  write gitignored data.json
```

- **Source of truth for answer keys** is the hand-verified seed in
  [`../seeds/`](../seeds/). The crawler supplies **passage prose** and
  **question stems**; its extracted answers are only *cross-checked* against the
  seed (mismatches are printed, never silently trusted).
- Output goes to `apps/web/src/lib/content/ingested/<id>.reading.data.json`,
  which is **gitignored** — copyrighted prose never enters git.

## Usage

```bash
python3 content/ingest/ingest.py --volume 15 --test 1 \
  --seed content/seeds/cambridge15-academic-test1.reading.json

# offline: parse a saved page instead of fetching
python3 content/ingest/ingest.py --volume 15 --test 1 \
  --seed content/seeds/cambridge15-academic-test1.reading.json --html page.html
```

Stdlib only (no dependencies). After running, `pnpm dev` shows the test in
`/tests` and it is sittable + auto-scored.

## Feasibility notes (ieltstrainingonline.com)

- `robots.txt` is permissive; pages are static server-rendered HTML (WordPress) —
  plain fetch, no browser automation.
- URLs enumerate as `cambridge-ielts-{10–21}-reading-test-{1–4}-…` (301-redirect
  to a canonical slug). One page carries all three passages: prose, questions,
  inline answer key, and explanations (justifying sentence `<strong>`-wrapped,
  tagged `(Qn)`).

## `ingest_auto.py` — seed-FREE ingester (scales past one seed)

`ingest_auto.py` derives the **whole** `Test` — passages, question types **and
answer keys** — from a source page with **no hand-authored seed**, so a whole
volume can be ingested. It auto-detects two page layouts:

- **answers-inline** (cam15-style `…-answers-with-explanations` pages): answers
  are `<strong>`-bold right after each question number.
- **passages + answer-key list** (cam14-style pages): a plain
  `Passage 1  1. creativity  2. rules … Passage 2  14. E …` key at the bottom;
  parsed by `answer_key()` and applied over the parsed structure.

Robust to real-world mess it met across cam14/15: split `NOT GIVEN` tags,
bullet-prefixed numbers (`● 12`), `<b>`/styled `<strong>`, **overlapping range
typos** (earliest-header-wins), **missing group headers** (uncovered numbers →
implicit groups), and **duplicate numbers** (rubric "write 40 on your answer
sheet" vs. the real Q40). Classifies the four `answerMatch` kinds
(text / enum TFNG+YNNG / letter / letter-set).

```bash
python3 content/ingest/ingest_auto.py --volume 14 --test 1 --html cam14_test1.html --write
# validate the extractor against the trusted seed (must stay 40/40):
python3 content/ingest/ingest_auto.py --volume 15 --test 1 --html page.html \
  --validate content/seeds/cambridge15-academic-test1.reading.json
```

- **Self-reports coverage** and (in batch use) **refuses to wire a test with
  gaps** — no silently-wrong tests.
- Validated **40/40** against the cam15 test-1 seed; ingested cam15 T1–4 + cam14 T1
  locally (all sittable + auto-scored).
- Dropped-in source pages (`cam*_test*.html`, `*.source.html`) are **gitignored**
  (they hold copyrighted passages + keys). Output data.json stays gitignored and
  `index.ts` skip-worktree'd, exactly as with `ingest.py`.

## Known gaps (follow-ups)

- MCQ-single / matching **option-list text** (the A–E choices) isn't captured —
  those questions render by letter only for now.
- **Other volumes/templates:** cam15 (answers-inline) and cam14 (passages+key)
  work; some volumes 404 or use a third layout, and the older
  `answers-and-explanations-for-…` pages have **no passage prose** (not sittable).
  Each new template is a small per-format adaptation.
