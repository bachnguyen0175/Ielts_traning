# ADR-0011: Question presentation belongs in the data model

> Status: Accepted — implemented
> Date: 2026-08-22

## Context

An audit of one imported reading paper (`/import` → `parse-exam-md.ts`) found
that 29 of its 40 questions could not be answered on screen. The answer key was
perfect, all three passages parsed, every question type was inferred correctly,
and the importer reported no problems at all.

The cause was the same in every case: the parser read the information a
candidate needs, then had nowhere to put it.

- `QuestionGroup.sharedOptions` was `string[]`, a list of bare letters. The
  parser captured "A  Kanayo F. Nwanze" and kept only the `A`. Matching people,
  matching headings, and "choose TWO letters" all rendered as unlabelled letters
  (17 questions).
- `Passage.body` dropped the printed paragraph labels, because a line holding a
  single capital letter looked like structure rather than prose. Every "which
  paragraph contains…" question then pointed at paragraphs the candidate could
  not identify (14 questions, overlapping the above).
- A table-completion group had no field for its table, so the markdown rows fell
  through into the instruction string and rendered as raw pipes. The questions
  inside the cells got no stem at all (5 questions).

Two smaller faults had the same shape: a stem that wrapped onto a second source
line was truncated, with its tail appended to the group's instruction, and
`selectCount` was honoured by the scorer while the player drew one independent
radio group per answer box, so the same letter could be chosen twice.

None of this was visible from the type system, the tests, or the importer's
diagnostics. It was visible immediately on screen.

## Decision

**Everything a candidate needs in order to answer is part of the `Test` type,
and the importer warns when a question arrives unanswerable.**

Three additions to `packages/domain/src/types.ts`:

- `Option = { label: string; text?: string }`, and `sharedOptions?: Option[]`.
  `label` is what the answer is matched against; `text` is the option as
  printed. Letters that a rubric only implies ("paragraphs A-I") carry a label
  with no text.
- `QuestionGroup.table?: string[][]` for table completion. Cells mark a blank
  with the token `[[n]]`; the first row is a header when it holds no blanks.
- `Passage.body` keeps paragraph labels. A paragraph that is a single capital
  letter is the label of the paragraph that follows it. This is a documented
  convention on the existing field rather than a new one, so nothing has to be
  kept in sync with it.

The player follows the paper: an option list with text is printed **once** per
group and each question then takes a bare label, a letter-set group is one
control filling several answer boxes, and a table renders as a table with an
input at each blank.

The importer gains three answerability warnings: a lettered group whose printed
list was not found, paragraph-matching questions in a passage with no labels,
and a question with no text of its own.

## Alternatives considered

- **Keep `sharedOptions: string[]`, add a parallel `optionText` map keyed by
  letter.** No change to existing call sites. Rejected: two fields that must
  agree about the same list, which is the hand-maintained bookkeeping ADR-0008
  exists to avoid.
- **Store the option text inside the label string** (`"A — Kanayo F. Nwanze"`).
  Zero type churn. Rejected: the label is what the scorer compares against, so
  the display text would have to be stripped back out at match time.
- **A structured `paragraphs: { label?, text }[]` on `Passage`, replacing or
  shadowing `body`.** More explicit than a convention. Rejected as shadowing
  (two representations of the same prose, free to drift) and too wide as a
  replacement, since `body` is written by both parsers, both ingest scripts, and
  every committed fixture.
- **Fix only the parser and leave the table flattened into the instruction.**
  Cheapest. Rejected: the instruction is a plain string rendered verbatim, so
  a table can only ever arrive there as pipes.
- **Make the new warnings errors.** Stronger guarantee. Rejected: an error
  blocks the whole import, and a paper with one unanswerable group is still
  worth having. The import screen already surfaces warnings prominently.

## Consequences

- **`sharedOptions` is a breaking shape change.** The authored lane
  (`parse-md.ts`) and `sample-mock.ts` were updated with it. Any future consumer
  reads `opt.label`, never the option itself.
- **The authored markdown dialect still cannot express option text.** Its
  `options:` attribute is letters only, so an authored matching question has the
  same gap the imported one just lost. The dialect can grow `A = text` when a
  real authored test needs it; the type is no longer the blocker.
- **The player has three question layouts instead of one**, chosen by data
  (`table`, then `letter-set`, then the per-question list) rather than by type
  name.
- **Answerability is now checkable.** A group can be asked whether a candidate
  could answer it, which is what the new warnings do. That check did not exist
  before, and it is why the original failure shipped past every green test.
- **Rendering is part of verifying content work.** Every one of these faults was
  invisible in source and obvious in a screenshot, which is the same lesson
  ADR-0010 recorded for the UI.
- **Follow-ups:**
  1. The `/import` preview shows a group's option count; it could show whether
     the options have text, which is the single best predictor of a broken
     import.
  2. `withBlanks` swallows a full stop that follows a dotted leader, so a stem
     ending in a blank loses its final punctuation. Cosmetic.
  3. Decide whether the authored dialect gets option text (see above).
