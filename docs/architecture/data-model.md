# Data Model

> Status: 🟡 draft
>
> Conceptual entities and relationships. Not tied to a specific database yet
> (see [ADR-0003](./decisions/0003-database.md)). The split between **test
> content** (authored, reusable) and **attempt data** (per user, per sitting) is
> the key organizing principle.

## Entity overview

```
User ──< Attempt >── Test ──< Section ──< Passage ──< QuestionGroup ──< Question ──< Answer key
                │                    (reading)   (shared instruction,
                │                                 reusable options)
                ├──< SectionResult (per section, per attempt)
                ├──< ResponseItem  (user answer per question)
                └──< Submission    (Writing text / Speaking audio)
```

> **Refined by seeding** (`content/seeds/cambridge15-academic-test1.reading.json`):
> a real Reading section needs a **Passage** grouping and a **QuestionGroup**
> layer. Listening is analogous (Parts instead of Passages). Writing/Speaking use
> **Prompt** directly under Section.

## Content entities (authored, shared across users)

### Test
A complete mock. `type` fixed to `academic` for now.
- `id`, `title`, `type`, `version`, `status` (draft/published)
- has many **Section** (ordered: listening, reading, writing, speaking)

### Section
- `id`, `testId`, `skill` (listening|reading|writing|speaking), `order`
- `durationSeconds`, timing rules (e.g. `audioPlayOnce`, `autoAdvance`)
- reading: has ordered **Passage**s; listening: ordered **Part**s (same shape)
- writing/speaking: has many **Prompt** (tasks / cue cards)
- assets: audio (listening), passage prose (reading), images (writing Task 1)

### Passage (reading) / Part (listening)
- `id`, `sectionId`, `order`, `title`, `body` (prose / audio ref)
- in `body`, paragraphs are separated by a blank line, and a paragraph that is
  a single capital letter is the **printed label** of the paragraph after it.
  "Which paragraph contains…" questions point at those labels, so the player
  renders them.
- has many **QuestionGroup**

### QuestionGroup
Groups questions that share an instruction and (often) an option list — this
mirrors how real tests present "Questions 14–18" as one block.
- `id`, `order`, `range` `[from, to]`, `type` (see enum below)
- `instruction` (verbatim rubric shown to the candidate)
- `sharedOptions?` — `{ label, text? }[]`. `label` is the letter or roman
  numeral the candidate answers with; `text` is the option as printed
  ("A  Kanayo F. Nwanze"). Groups whose letters are only implied by the rubric
  ("paragraphs A-I") carry a label with no text. The player prints a list with
  text once per group, then offers bare labels per question.
- `optionsReusable?` (bool — "you may use any letter more than once"). When
  absent on a `letter` group, the player dims letters already spent elsewhere
  in the group.
- `table?` — `string[][]`, for table completion. Rows of cells; the first row
  is a header when it holds no blanks. A cell marks question *n*'s blank with
  the token `[[n]]`, and the player renders an input in its place.
- `answerMatch` (matching policy for the whole group — see below)
- has many **Question**

**Question type enum** (observed in one real test — extend as needed):
`sentence_completion` · `summary_completion` · `true_false_not_given` ·
`yes_no_not_given` · `matching_information` · `matching_features` ·
`matching_headings` · `multiple_choice_single` · `multiple_choice_multi` ·
`short_answer`.

### Question + AnswerKey
- `id`, `groupId`, `number` (global 1–40), `content` (stem/statement)
- **AnswerKey** — server-side only, never sent to client pre-submit. Matching is
  **policy-driven** so the objective auto-scorer stays generic:

| `answerMatch.kind` | Used by | Rule |
|--------------------|---------|------|
| `text` | completion, short answer | Normalize (trim/collapse-ws/lowercase), then match any value in `accept[]`. Supports **alternates** (e.g. `["isolated","uncontacted"]`) and **multi-word** (`"land surface"`). |
| `enum` | TFNG / YNNG | Value must be one of a fixed option set. |
| `letter` | MCQ-single, matching | Single letter equality. |
| `letter-set` | MCQ-multi ("choose TWO") | Two+ question numbers form **one unordered group**; the submitted set must equal `acceptSet` regardless of order. |

> Seeding surfaced the `letter-set` case (Q23–24 "choose TWO"): two answer slots
> whose correctness is judged as an unordered set, not per-slot. The scorer must
> treat these numbers jointly.

### Prompt (Writing & Speaking — productive)
- `id`, `sectionId`, `taskType`
  - Writing: `task1` (with data image) | `task2` (essay prompt)
  - Speaking: `part1` | `part2` (cue card) | `part3`
- guidance metadata (target words, target minutes)

### BandConversion
- table mapping raw /40 → band, keyed by `skill` + test version. Configurable
  data, not code.

## Attempt entities (per user, per sitting)

### Attempt
- `id`, `userId`, `testId`, `status` (in_progress|submitted|scored)
- `startedAt`, `submittedAt`, per-section progress cursor
- has many ResponseItem, SectionResult, Submission

### ResponseItem
- `attemptId`, `questionId`, `value`, `flagged` (review marker), `answeredAt`

### Submission (productive skills)
- `attemptId`, `promptId`, `kind` (writing_text | speaking_audio)
- `textContent` **or** `audioBlobUrl`, `durationSeconds`
- `score`: nullable → populated in P2/P3 (per-criterion bands + rationale)

### SectionResult
- `attemptId`, `sectionId`, `rawScore` (L/R), `band`, `scoredAt`
- overall band derived across the four section results.

## Notes & open questions

- **Answer matching** for completion/short-answer needs a flexible rule set
  (alt spellings, articles, numbers-as-words). Model it as data on the key.
- **Audio storage** lifecycle + privacy (retention window, deletion) — 🔴 TBD.
- Do we snapshot the `Test` version into the `Attempt` so later content edits
  don't retroactively change historical results? (Recommended: yes.)
