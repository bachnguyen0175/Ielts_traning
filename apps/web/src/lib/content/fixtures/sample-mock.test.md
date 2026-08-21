---
id: sample-academic-1
title: Composed Sample — Academic Mock 1
type: academic
source: Composed original
---

<!--
  The sample mock, authored in the markdown dialect (docs/content-authoring-format.md).

  This file is the round-trip fixture for parse-md.test.ts: compiling it must
  deep-equal the hand-written SAMPLE_MOCK in apps/web/src/lib/content/sample-mock.ts.
  That test is the parser's strongest guarantee, so keep the two in step — if you
  change sample-mock.ts, change this file to match.

  Durations are deliberately short so a full sitting is demoable and E2E-testable;
  the parser warns about that, which is expected here.
-->

## Listening
id: s-listening
duration: 6m
audio: /audio/sample-listening.wav
rules: audio-play-once, auto-advance

### Part 1 — Community centre enquiry
id: l-part1

A caller asks the community centre about weekend classes.

[1-3] multiple_choice_single
id: l-g1
Choose the correct letter, A, B or C.
options: A | B | C
1. The pottery class runs on = B
2. The class costs = A
3. Members should bring = C

[4-6] sentence_completion
id: l-g2
Complete the notes. ONE WORD ONLY.
4. Meet by the ___. = entrance
5. Bring a ___. = towel
6. Ask for ___. = Sarah

## Reading
id: s-reading
duration: 10m
rules: single-timer, auto-advance

### The quiet return of the urban river
id: r-p1

For much of the twentieth century, the rivers running through industrial
cities were treated as little more than drains. Factories discharged waste
directly into the water, and many channels were straightened or buried
beneath concrete to make room for roads and buildings. By the 1970s several
of these rivers were considered biologically dead, unable to support fish or
the birds that once fed on them.

The change, when it came, was gradual. Tighter regulations forced factories
to treat their waste before releasing it. Volunteers cleared decades of
debris, and engineers reintroduced bends and gravel beds that slowed the
current and gave wildlife somewhere to shelter. Within a generation, species
that had vanished began to reappear. Today, otters and kingfishers are
recorded on stretches of water that were once devoid of life.

Researchers caution that recovery is fragile. A single pollution incident can
undo years of progress, and warming summers place new stress on cold-water
species. Still, the revival of the urban river is widely cited as evidence
that environmental damage, though slow to repair, is not always permanent.

[7-9] true_false_not_given
id: r-g1
Do the statements agree with the passage? TRUE, FALSE or NOT GIVEN.
7. By the 1970s some urban rivers could not support fish. = TRUE
8. Factories were closed down to clean the rivers. = FALSE
9. Otters are now more common than kingfishers. = NOT GIVEN

[10-12] sentence_completion
id: r-g2
Complete the sentences. NO MORE THAN TWO WORDS from the passage.
10. Many channels were buried beneath ___. = concrete
11. Engineers reintroduced bends and ___. = gravel beds / gravel
12. A single ___ incident can undo years of progress. = pollution

## Writing
id: s-writing
duration: 10m
rules: single-timer, auto-advance

### Task 1 — task1
id: w-t1
words: 150
image: Bar chart of monthly visitors to a river path, peaking in summer.

The chart below shows the number of visitors to a city river path each month
in 2025. Summarise the information by selecting and reporting the main
features. Write at least 150 words.

### Task 2 — task2
id: w-t2
words: 250

Some people believe cities should prioritise restoring nature over building
new housing. To what extent do you agree or disagree? Write at least 250
words.

## Speaking
id: s-speaking
duration: 14m

### Part 1 — part1
id: sp-p1
speak: 60s

Let's talk about where you live. Do you live in a city or a town? What do you
like about it?

### Part 2 — part2
id: sp-p2
prep: 60s
speak: 120s

Describe a place near water you have visited. You should say: where it is,
when you went, what you did there, and how you felt about it.

### Part 3 — part3
id: sp-p3
speak: 90s

Why do you think people are drawn to rivers and lakes? Should governments
spend money protecting natural spaces in cities?
