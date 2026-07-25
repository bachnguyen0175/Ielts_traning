# Band Descriptors — Writing & Speaking

> Status: 🟡 draft
>
> The four-criteria rubrics used to score the productive skills. In the MVP,
> scoring is **deferred** — these criteria are shown to users for self-review and
> become the schema for AI scoring in Phase 2. Keep the criteria as structured
> data so a score can attach to each one.

## Why this matters

Writing and Speaking are where credibility is won or lost. Objective L/R scoring
is mechanical; productive-skill scoring must map transparently to the **official
four criteria** or users won't trust it.

## Writing — four criteria

Each scored 0–9; the task band is their average (with task-specific weighting
handled at the section level).

| Criterion | Applies to | Assesses |
|-----------|-----------|----------|
| **Task Achievement** (Task 1) / **Task Response** (Task 2) | Both tasks | Whether the response fully addresses the prompt, covers key features/position, appropriate length & format |
| **Coherence & Cohesion** | Both | Logical organization, paragraphing, linking, referencing |
| **Lexical Resource** | Both | Range, precision, and appropriacy of vocabulary; spelling |
| **Grammatical Range & Accuracy** | Both | Range of structures, control, punctuation |

## Speaking — four criteria

Each scored 0–9; the Speaking band is their average.

| Criterion | Assesses |
|-----------|----------|
| **Fluency & Coherence** | Speech rate/continuity, hesitation, logical flow, connectives |
| **Lexical Resource** | Vocabulary range, paraphrase ability, idiomatic use |
| **Grammatical Range & Accuracy** | Sentence complexity and correctness |
| **Pronunciation** | Intelligibility, stress, rhythm, intonation, individual sounds |

## Data shape (for scoring — 🔴 to finalize in P2)

A submission score should decompose into per-criterion bands so feedback is
explainable:

```
WritingScore {
  taskAchievement | taskResponse: band
  coherenceCohesion: band
  lexicalResource:  band
  grammaticalRange: band
  overall: band            // derived
  rationale: text          // per-criterion notes (AI or human)
}
```

## Phase notes

- **MVP:** criteria displayed as a self-assessment checklist beside the user's
  own submission. No numeric score generated.
- **P2 (Writing AI scoring):** LLM returns a band per criterion **with cited
  evidence** from the text. Calibrate against a labeled sample set before trust.
- **P3 (Speaking):** requires transcription + pronunciation analysis; scope
  separately.

## Open questions

- Source of a calibrated reference set to validate AI bands against real scores.
- How much rationale/evidence to surface without encouraging gaming.
