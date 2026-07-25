# IELTS Academic — Domain Overview

> Status: 🟢 stable (external test facts) · 🟡 draft (our interpretation)
>
> This is the source of truth for how the real test behaves. Feature specs and
> the timing engine must conform to it. Facts here describe **IELTS Academic**.

## The four skills

Total sitting for Listening + Reading + Writing ≈ **2h45m**, no breaks between
them. Speaking (11–14 min) is a separate face-to-face interview, taken the same
day or up to 7 days before/after.

### 1. Listening (~30 min + review)

- **40 questions**, four parts, played through **once** — no pause, no replay.
- Part 1: everyday conversation, 2 speakers (social).
- Part 2: everyday monologue (social).
- Part 3: conversation, up to 4 speakers (educational/training).
- Part 4: academic monologue / lecture.
- Difficulty rises across parts. On computer-delivered, a short review window
  replaces the paper "10-min transfer time".

### 2. Reading (60 min)

- **40 questions**, **3 long passages** from books, journals, magazines,
  newspapers (academic register).
- **No extra transfer time** — answers recorded within the 60 minutes.
- Wide question-type variety (see below).

### 3. Writing (60 min, 2 tasks)

- **Task 1 (~20 min, ≥150 words):** describe/summarize visual data — line/bar
  chart, table, pie, map, or process diagram.
- **Task 2 (~40 min, ≥250 words):** formal essay responding to a point of view,
  argument, or problem.
- **Task 2 is weighted more heavily** than Task 1.

### 4. Speaking (11–14 min, 3 parts)

- **Part 1 (4–5 min):** intro + familiar-topic questions.
- **Part 2 (3–4 min):** long turn — a cue card, **1 min prep**, speak
  **1–2 min**, then 1–2 follow-ups.
- **Part 3 (4–5 min):** two-way discussion on abstract themes tied to Part 2.

## Common Reading/Listening question types

Multiple choice · identifying information (True/False/Not Given) · identifying
views (Yes/No/Not Given) · matching information / headings / features /
sentence endings · sentence / summary / note / table / flow-chart / diagram
completion · short-answer questions.

> The data model must represent each type generically enough to auto-score the
> objective ones. See [`../architecture/data-model.md`](../architecture/data-model.md).

## Band scoring (0–9)

- Scores in **half-band increments** (…6.0, 6.5, 7.0…).
- Each skill scored individually; **Overall = average of the four**, rounded to
  the nearest half or whole band (a .25 rounds up to .5; a .75 rounds up to the
  next whole).
- **Listening & Reading:** raw score /40 → band via a **conversion table**
  (Academic Reading's table is stricter than General). Exact tables vary per
  test version — treat the table as configurable data, not hardcoded.
- **Writing & Speaking:** assessed by examiners against **four criteria each**
  (see [`band-descriptors.md`](./band-descriptors.md)).

## Fidelity rules (drive the timing engine)

1. Listening audio plays exactly once; controls are disabled.
2. Each section has its own timer; expiry auto-advances (no going back).
3. No correctness feedback until the whole test is submitted.
4. Writing Task 1/Task 2 share a single 60-min budget (we surface the 20/40
   guidance but don't hard-lock the split — matching the real test).
