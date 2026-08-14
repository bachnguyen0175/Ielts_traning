import type { Test } from "@composed/domain";

/**
 * A compact, ORIGINAL Academic sample mock. 
 * Real structure, every objective question-type represented,
 * shortened durations so the flow is demoable and E2E-testable. Prose here is
 * original and safe to ship.
 */
export const SAMPLE_MOCK: Test = {
  id: "sample-academic-1",
  title: "Composed Sample — Academic Mock 1",
  type: "academic",
  source: "Composed original",
  sections: [
    // ── Listening ──────────────────────────────────────────────────────────
    {
      id: "s-listening",
      skill: "listening",
      order: 1,
      durationSeconds: 360,
      rules: { audioPlayOnce: true, autoAdvanceOnExpiry: true },
      audioSrc: "/audio/sample-listening.wav",
      passages: [
        {
          id: "l-part1",
          order: 1,
          title: "Part 1 — Community centre enquiry",
          body: "A caller asks the community centre about weekend classes.",
          questionGroups: [
            {
              id: "l-g1",
              range: [1, 3],
              type: "multiple_choice_single",
              instruction: "Choose the correct letter, A, B or C.",
              sharedOptions: ["A", "B", "C"],
              answerMatch: { kind: "letter" },
              questions: [
                { number: 1, content: "The pottery class runs on", accept: ["B"] },
                { number: 2, content: "The class costs", accept: ["A"] },
                { number: 3, content: "Members should bring", accept: ["C"] },
              ],
            },
            {
              id: "l-g2",
              range: [4, 6],
              type: "sentence_completion",
              instruction: "Complete the notes. ONE WORD ONLY.",
              answerMatch: {
                kind: "text",
                normalize: ["trim", "collapse-ws", "lowercase"],
              },
              questions: [
                { number: 4, content: "Meet by the ___.", accept: ["entrance"] },
                { number: 5, content: "Bring a ___.", accept: ["towel"] },
                { number: 6, content: "Ask for ___.", accept: ["Sarah"] },
              ],
            },
          ],
        },
      ],
    },

    // ── Reading ────────────────────────────────────────────────────────────
    {
      id: "s-reading",
      skill: "reading",
      order: 2,
      durationSeconds: 600,
      rules: { singleTimer: true, autoAdvanceOnExpiry: true },
      passages: [
        {
          id: "r-p1",
          order: 1,
          title: "The quiet return of the urban river",
          body: `For much of the twentieth century, the rivers running through industrial cities were treated as little more than drains. Factories discharged waste directly into the water, and many channels were straightened or buried beneath concrete to make room for roads and buildings. By the 1970s several of these rivers were considered biologically dead, unable to support fish or the birds that once fed on them.

The change, when it came, was gradual. Tighter regulations forced factories to treat their waste before releasing it. Volunteers cleared decades of debris, and engineers reintroduced bends and gravel beds that slowed the current and gave wildlife somewhere to shelter. Within a generation, species that had vanished began to reappear. Today, otters and kingfishers are recorded on stretches of water that were once devoid of life.

Researchers caution that recovery is fragile. A single pollution incident can undo years of progress, and warming summers place new stress on cold-water species. Still, the revival of the urban river is widely cited as evidence that environmental damage, though slow to repair, is not always permanent.`,
          questionGroups: [
            {
              id: "r-g1",
              range: [7, 9],
              type: "true_false_not_given",
              instruction:
                "Do the statements agree with the passage? TRUE, FALSE or NOT GIVEN.",
              answerMatch: {
                kind: "enum",
                options: ["TRUE", "FALSE", "NOT GIVEN"],
              },
              questions: [
                {
                  number: 7,
                  content:
                    "By the 1970s some urban rivers could not support fish.",
                  accept: ["TRUE"],
                },
                {
                  number: 8,
                  content: "Factories were closed down to clean the rivers.",
                  accept: ["FALSE"],
                },
                {
                  number: 9,
                  content: "Otters are now more common than kingfishers.",
                  accept: ["NOT GIVEN"],
                },
              ],
            },
            {
              id: "r-g2",
              range: [10, 12],
              type: "sentence_completion",
              instruction:
                "Complete the sentences. NO MORE THAN TWO WORDS from the passage.",
              answerMatch: {
                kind: "text",
                normalize: ["trim", "collapse-ws", "lowercase"],
              },
              questions: [
                {
                  number: 10,
                  content: "Many channels were buried beneath ___.",
                  accept: ["concrete"],
                },
                {
                  number: 11,
                  content: "Engineers reintroduced bends and ___.",
                  accept: ["gravel beds", "gravel"],
                },
                {
                  number: 12,
                  content: "A single ___ incident can undo years of progress.",
                  accept: ["pollution"],
                },
              ],
            },
          ],
        },
      ],
    },

    // ── Writing ──────────────────────────────────────────────────────────────
    {
      id: "s-writing",
      skill: "writing",
      order: 3,
      durationSeconds: 600,
      rules: { singleTimer: true, autoAdvanceOnExpiry: true },
      prompts: [
        {
          id: "w-t1",
          taskType: "task1",
          instruction:
            "The chart below shows the number of visitors to a city river path each month in 2025. Summarise the information by selecting and reporting the main features. Write at least 150 words.",
          targetWords: 150,
          imageAlt:
            "Bar chart of monthly visitors to a river path, peaking in summer.",
        },
        {
          id: "w-t2",
          taskType: "task2",
          instruction:
            "Some people believe cities should prioritise restoring nature over building new housing. To what extent do you agree or disagree? Write at least 250 words.",
          targetWords: 250,
        },
      ],
    },

    // ── Speaking ─────────────────────────────────────────────────────────────
    {
      id: "s-speaking",
      skill: "speaking",
      order: 4,
      durationSeconds: 840,
      prompts: [
        {
          id: "sp-p1",
          taskType: "part1",
          instruction:
            "Let's talk about where you live. Do you live in a city or a town? What do you like about it?",
          speakSeconds: 60,
        },
        {
          id: "sp-p2",
          taskType: "part2",
          instruction:
            "Describe a place near water you have visited. You should say: where it is, when you went, what you did there, and how you felt about it.",
          prepSeconds: 60,
          speakSeconds: 120,
        },
        {
          id: "sp-p3",
          taskType: "part3",
          instruction:
            "Why do you think people are drawn to rivers and lakes? Should governments spend money protecting natural spaces in cities?",
          speakSeconds: 90,
        },
      ],
    },
  ],
};
