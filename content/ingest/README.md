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

## Known gaps (follow-ups)

- **MCQ-multi ("choose TWO", e.g. Q23–26)** option/stem text isn't extracted yet
  (scoring still works via the seed's letter-set keys).
- MCQ-single / matching **option-list text** (the A–E choices) isn't captured —
  those questions render by letter only for now.
- Currently **seed-driven**: each test needs a seed skeleton for its answer keys.
  Seed-free parsing of every question type is the path to scaling past one test.
