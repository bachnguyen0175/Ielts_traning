# Content authoring format (`.test.md`)

> **Status: specification — the parser is not yet implemented.**
> This document defines the markdown dialect that `pnpm content:build` will
> accept. Nothing described here runs today. Written spec-first so the
> implementation has a target; see
> [ADR-0008](./architecture/decisions/0008-authored-content-pipeline.md).

Reference for authoring an original IELTS Academic test as a markdown file and
compiling it into a playable `Test`. Every heading, key, and notation is listed
here with the domain field it produces.

**Scope:** original or licensed content only, which is committed and deployed.
Cambridge material uses a separate, local-only lane —
[ADR-0006](./architecture/decisions/0006-content-ingestion.md).

---

## 1. Pipeline

```
content/authored/my-mock.test.md
        │  pnpm content:build content/authored/my-mock.test.md
        ▼
apps/web/src/lib/content/authored/<id>.ts     (generated — never hand-edit)
        │  registered in
        ▼
apps/web/src/lib/content/authored/index.ts    → AUTHORED_TESTS
        │  merged in apps/web/src/lib/data/local.ts
        ▼
TESTS → MockContentRepository → /tests → /mock?test=<id>
```

Both the markdown source and the generated `.ts` are committed. The markdown is
the source of truth; the `.ts` is build output kept in git so the app has no
build-time dependency on Python or a parser run.

---

## 2. File anatomy

```md
---
id: composed-academic-2
title: Composed Academic Mock 2
type: academic
source: Composed original
access: public
---

## Listening
duration: 30m
audio: /audio/mock2.wav
rules: audio-play-once, auto-advance

### Part 1 — Library enquiry
A caller asks the library about membership.

[1-3] multiple_choice_single
Choose the correct letter, A, B or C.
options: A | B | C
1. The library opens at = B
2. Membership costs = A
3. The caller wants to borrow = C

## Reading
duration: 60m
rules: single-timer, auto-advance

### Passage 1 — The quiet return of the urban river

For much of the twentieth century, the rivers running through industrial
cities were treated as little more than drains.

Tighter regulations forced factories to treat their waste.

[4-6] true_false_not_given
Do the statements agree with the passage?
4. By the 1970s some urban rivers could not support fish. = TRUE
5. Factories were closed down to clean the rivers. = FALSE
6. Otters are now more common than kingfishers. = NOT GIVEN

## Writing
duration: 60m

### Task 1 — task1
words: 150
image: Bar chart of monthly visitors to a river path, peaking in summer.
The chart below shows the number of visitors each month in 2025. Summarise
the information. Write at least 150 words.

## Speaking
duration: 14m

### Part 2 — part2
prep: 60s
speak: 120s
Describe a place you like to visit.
```

Four structural levels, all standard markdown:

| Markdown | Produces |
|---|---|
| front matter | `Test` |
| `##` heading | `Section` |
| `###` heading | `Passage` (Listening/Reading) or `Prompt` (Writing/Speaking) |
| `[n-m] type` | `QuestionGroup` |
| `n. stem = answer` | `Question` |

---

## 3. Front matter

Opens the file, delimited by `---`. Produces the `Test`.

| Key | Required | Values | Maps to |
|---|---|---|---|
| `id` | **yes** | kebab-case, unique across all tests | `Test.id` |
| `title` | **yes** | free text | `Test.title` |
| `type` | no | `academic` (default) · `general` | `Test.type` |
| `source` | no | free text, e.g. `Composed original` | `Test.source` |
| `access` | no | `public` (default) · `private` | `Test.access` |

`access: private` marks content that must never be deployed. Original content
you own is `public`.

---

## 4. Sections — `##`

The heading text names the skill and is matched case-insensitively:

```md
## Listening
duration: 30m
audio: /audio/mock2.wav
rules: audio-play-once, auto-advance
```

Valid headings: `Listening`, `Reading`, `Writing`, `Speaking` → `Section.skill`.
`Section.order` comes from document order (first `##` is `order: 1`).

### Section attributes

Attribute lines sit directly under the heading, before any prose or `###`.
Order among them does not matter.

| Key | Required | Grammar | Maps to |
|---|---|---|---|
| `duration` | **yes** | `30m` · `1800s` · `1h` | `Section.durationSeconds` |
| `audio` | Listening only | path under `apps/web/public/` | `Section.audioSrc` |
| `rules` | no | comma-separated, see below | `Section.rules` |
| `id` | no | overrides the derived id | `Section.id` |

### Rules vocabulary

| Written | Sets |
|---|---|
| `audio-play-once` | `rules.audioPlayOnce: true` |
| `single-timer` | `rules.singleTimer: true` |
| `auto-advance` | `rules.autoAdvanceOnExpiry: true` |

`audio-play-once` is the non-negotiable Listening fidelity rule (no pause, no
rewind, no replay). The parser **warns** if a Listening section omits it.

### Authentic durations

| Section | Real test | Note |
|---|---|---|
| Listening | `30m` | plus 10 min transfer in the paper test |
| Reading | `60m` | single timer across all passages |
| Writing | `60m` | Task 1 ≈ 20 min, Task 2 ≈ 40 min |
| Speaking | `11m`–`14m` | three parts |

Shortened durations are legitimate for demo and E2E fixtures — `sample-mock.ts`
uses 6–14 minutes so a full sitting is testable. Use real timings for anything a
candidate will sit.

---

## 5. Passages — `###` (Listening & Reading)

```md
### Passage 1 — The quiet return of the urban river

For much of the twentieth century, the rivers running through industrial
cities were treated as little more than drains.

Tighter regulations forced factories to treat their waste.

[4-6] true_false_not_given
...
```

| Element | Maps to |
|---|---|
| heading text | `Passage.title` |
| document order | `Passage.order` |
| everything between the heading and the first `[n-m]` | `Passage.body` |
| `id:` attribute line | `Passage.id` (else derived) |

Blank-line-separated paragraphs in the body are preserved as `\n\n`. Body is
optional for Listening (where the audio carries the content) but expected for
Reading — the parser **warns** on an empty Reading passage so drafts still
compile.

---

## 6. Question groups — `[n-m] type`

```md
[14-18] matching_information
Which paragraph contains the following information?
NB You may use any letter more than once.
options: A | B | C | D | E | F | G
reusable: yes
14. A description of the harvesting process = C
15. A comparison with a rival spice = B
```

**Parse order under a `[n-m] type` header:**

1. **Attribute lines** — any line beginning with a key from the closed set
   below, followed by `:`.
2. **Instruction** — every other non-numbered line, joined with a space.
   A colon inside instruction text is safe: only the closed key set is treated
   as an attribute.
3. **Question lines** — lines beginning `n.`.

| Key | Applies to | Grammar | Maps to |
|---|---|---|---|
| `options` | letter-based types | `A \| B \| C` | `sharedOptions` |
| `reusable` | matching types | `yes` · `no` | `optionsReusable` |
| `select` | `multiple_choice_multi` | integer | `selectCount` |
| `answers` | `multiple_choice_multi` | `B, D` | `acceptSet` |
| `match` | any | see §9 | overrides inferred `answerMatch` |
| `id` | any | string | `QuestionGroup.id` |

`[14-18]` becomes `QuestionGroup.range: [14, 18]`.

---

## 7. The ten question types

| Type | Answer style | Needs `options` | Example question line |
|---|---|---|---|
| `sentence_completion` | text | no | `10. Channels were buried beneath ___. = concrete` |
| `summary_completion` | text | no | `19. ___ was the main cause. = human error` |
| `short_answer` | text | no | `4. What must members bring? = passport` |
| `true_false_not_given` | enum | no | `7. Rivers could not support fish. = TRUE` |
| `yes_no_not_given` | enum | no | `12. The author supports the ban. = YES` |
| `multiple_choice_single` | letter | **yes** | `27. The writer suggests that = A` |
| `matching_information` | letter | **yes** | `14. A description of harvesting = C` |
| `matching_features` | letter | **yes** | `33. Reached the islands first = E` |
| `matching_headings` | letter | **yes** | `21. Section B = iv` |
| `multiple_choice_multi` | letter-set | **yes** | *(no question lines — see below)* |

### Letter-set groups

`multiple_choice_multi` is the one type with **no numbered question lines**. The
group declares how many letters to choose and which are correct; the parser
generates one `acceptSetMember` slot per number in the range.

```md
[23-24] multiple_choice_multi
Choose TWO letters A–E. Which TWO benefits are mentioned?
options: A | B | C | D | E
select: 2
answers: C, D
```

Produces `selectCount: 2`, `acceptSet: ["C","D"]`, `answerMatch: {kind:
"letter-set", anyOrder: true}`, and questions `23` and `24` each with
`acceptSetMember: true`. `select` must equal both the range width and the
number of `answers`.

### Reusable options

`matching_information` and `matching_features` commonly allow an option to be
used more than once ("NB You may use any letter more than once"). Write
`reusable: yes` → `optionsReusable: true`.

---

## 8. Answer notation

| Notation | Meaning |
|---|---|
| `= answer` | the accepted answer, after the stem |
| ` / ` | separates alternates → `accept: ["gravel beds", "gravel"]` |
| `___` | a gap in the stem (three or more underscores) |
| `answers:` | letter-set group answers (replaces `=`) |

```md
11. Engineers reintroduced bends and ___. = gravel beds / gravel
```
→ `{ number: 11, content: "Engineers reintroduced bends and ___.", accept: ["gravel beds", "gravel"] }`

**Splitting rule:** the stem and answer are split on the **last** occurrence of
a spaced ` = `. A stem containing `=` is therefore safe as long as the real
separator is last.

**Enum spelling is exact and uppercase:** `TRUE` · `FALSE` · `NOT GIVEN` ·
`YES` · `NO`. `Not Given` and `NOTGIVEN` are errors, not silent corrections.

Stems are optional (`Question.content` is optional in the domain) — a bare
`14. = C` is valid for reference-style content where wording is withheld. For
authored content, always write the stem.

---

## 9. Inferred `answerMatch`

You do not write `answerMatch`. It follows from the question type:

| Type | Inferred |
|---|---|
| `sentence_completion`, `summary_completion`, `short_answer` | `{kind: "text", caseSensitive: false, normalize: ["trim","collapse-ws","lowercase"]}` |
| `true_false_not_given` | `{kind: "enum", options: ["TRUE","FALSE","NOT GIVEN"]}` |
| `yes_no_not_given` | `{kind: "enum", options: ["YES","NO","NOT GIVEN"]}` |
| `multiple_choice_single`, `matching_information`, `matching_features`, `matching_headings` | `{kind: "letter"}` |
| `multiple_choice_multi` | `{kind: "letter-set", anyOrder: true}` |

Override only when a group genuinely differs — e.g. an answer where case
carries meaning:

```md
match: text case-sensitive
```

---

## 10. Prompts — `###` (Writing & Speaking)

Writing and Speaking have no questions, only prompts. The `###` heading carries
the display name and, after an em dash, the `taskType`:

```md
### Task 1 — task1
words: 150
image: Bar chart of monthly visitors to a river path, peaking in summer.
The chart below shows the number of visitors each month in 2025. Summarise
the information. Write at least 150 words.
```

| Key | Applies to | Maps to |
|---|---|---|
| `words` | Writing | `Prompt.targetWords` |
| `image` | Writing | `Prompt.imageAlt` |
| `prep` | Speaking | `Prompt.prepSeconds` |
| `speak` | Speaking | `Prompt.speakSeconds` |
| `id` | both | `Prompt.id` |

All remaining prose becomes `Prompt.instruction`. Conventional `taskType`
values: `task1`, `task2` (Writing); `part1`, `part2`, `part3` (Speaking).

`image:` supplies alt text only — the chart asset itself is referenced by the
screen, not the format. Writing Task 1 without a real chart is still sittable.

---

## 11. Derived IDs

Every id is generated deterministically, so you rarely write one:

| Entity | Rule | Example |
|---|---|---|
| Section | `s-<skill>` | `s-reading` |
| Passage | `<l\|r>-p<order>` | `r-p1` |
| Question group | `<passageId>-g<n>` | `r-p1-g2` |
| Writing prompt | `w-<taskType>` | `w-task1` |
| Speaking prompt | `sp-<taskType>` | `sp-part2` |

Any `id:` attribute overrides its derived value. Hand-written fixtures such as
`sample-mock.ts` use slightly different ids (`l-part1`, `r-g1`) — those predate
this format and are not regenerated.

---

## 12. Validation

The build refuses to emit a `Test` that fails any **error** rule. Warnings are
printed and the build continues, so drafts still compile.

| # | Rule | Severity |
|---|---|---|
| 1 | Question numbers unique across the whole test | error |
| 2 | Numbers contiguous within a section (no gaps) | error |
| 3 | Every question number falls inside its group's `range` | error |
| 4 | Group `range` width equals its question count | error |
| 5 | Every question has an answer (except letter-set slots) | error |
| 6 | Letter answers appear in that group's `options` | error |
| 7 | `select` equals the range width and the `answers` count | error |
| 8 | Enum answers spelled exactly (`NOT GIVEN`, not `Not Given`) | error |
| 9 | Letter-based types declare `options` | error |
| 10 | `duration` present and greater than zero | error |
| 11 | `audio:` file exists under `apps/web/public/` | error |
| 12 | Listening section declares `audio:` | error |
| 13 | Section has passages (L/R) or prompts (W/S) as its skill requires | error |
| 14 | `id` does not collide with an existing test | error |
| 15 | Reading passage body is non-empty | warning |
| 16 | Listening section declares `audio-play-once` | warning |
| 17 | Section duration differs from the authentic timing | warning |

Every diagnostic reports the source file and line:

```
my-mock.test.md:88  error  Q23 has no answer (group [23-26] sentence_completion)
my-mock.test.md:41  error  answer "F" is not in options A | B | C | D | E
my-mock.test.md:12  warn   Reading duration 10m differs from the authentic 60m
```

---

## 13. Worked example

A complete, minimal, valid test — one Reading passage, two groups, six
questions:

```md
---
id: composed-reading-1
title: Composed Reading Drill 1
type: academic
source: Composed original
access: public
---

## Reading
duration: 20m
rules: single-timer, auto-advance

### Passage 1 — The quiet return of the urban river

For much of the twentieth century, the rivers running through industrial
cities were treated as little more than drains. By the 1970s several were
considered biologically dead.

The change was gradual. Tighter regulations forced factories to treat their
waste, and engineers reintroduced bends and gravel beds.

[1-3] true_false_not_given
Do the statements agree with the passage?
1. By the 1970s some urban rivers could not support fish. = TRUE
2. Factories were closed down to clean the rivers. = FALSE
3. Otters are now more common than kingfishers. = NOT GIVEN

[4-6] sentence_completion
Complete the sentences. NO MORE THAN TWO WORDS from the passage.
4. Many channels were buried beneath ___. = concrete
5. Engineers reintroduced bends and ___. = gravel beds / gravel
6. A single ___ incident can undo years of progress. = pollution
```

Compiles to a `Test` with one `Section` (`s-reading`, `durationSeconds: 1200`),
one `Passage` (`r-p1`), two `QuestionGroup`s (`r-p1-g1` with `enum` matching,
`r-p1-g2` with `text` matching), and six `Question`s.

---

## 14. Related

| Doc | Why |
|---|---|
| [ADR-0008](./architecture/decisions/0008-authored-content-pipeline.md) | Why markdown, why a CLI, why committed output |
| [ADR-0006](./architecture/decisions/0006-content-ingestion.md) | The separate Cambridge lane (gitignored, never deployed) |
| [`architecture/data-model.md`](./architecture/data-model.md) | The entities this format produces |
| [`domain/ielts-overview.md`](./domain/ielts-overview.md) | Authentic format, timing, question types |
| [`content/README.md`](../content/README.md) | Copyright posture — what may be committed |
| `packages/domain/src/types.ts` | The `Test` type this format must satisfy |
