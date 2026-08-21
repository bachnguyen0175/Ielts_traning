import { describe, expect, it } from "vitest";
import type { Test } from "@composed/domain";
import { upgradeStored } from "./imported-tests";

/** A test as it was stored before ADR-0011: options are bare letters. */
const legacy = () =>
  [
    {
      id: "legacy",
      title: "Stored before ADR-0011",
      type: "academic",
      sections: [
        {
          id: "s",
          skill: "reading",
          order: 1,
          durationSeconds: 3600,
          passages: [
            {
              id: "p",
              order: 1,
              title: "A passage",
              questionGroups: [
                {
                  id: "g1",
                  range: [1, 1],
                  type: "matching_information",
                  instruction: "Which paragraph?",
                  sharedOptions: ["A", "B", "C"],
                  answerMatch: { kind: "letter" },
                  questions: [{ number: 1, content: "A statement", accept: ["B"] }],
                },
                {
                  id: "g2",
                  range: [2, 2],
                  type: "sentence_completion",
                  instruction: "ONE WORD ONLY",
                  answerMatch: { kind: "text" },
                  questions: [{ number: 2, content: "A gap ___", accept: ["word"] }],
                },
              ],
            },
          ],
        },
      ],
    },
  ] as unknown as Test[];

describe("upgradeStored", () => {
  it("turns bare letters into labelled options", () => {
    const [test] = upgradeStored(legacy());
    const g = test.sections[0].passages![0].questionGroups[0];
    // Left as strings, every label reads as undefined and the player draws
    // empty chips that all look selected.
    expect(g.sharedOptions).toEqual([
      { label: "A" },
      { label: "B" },
      { label: "C" },
    ]);
  });

  it("leaves a group with no options alone", () => {
    const [test] = upgradeStored(legacy());
    expect(
      test.sections[0].passages![0].questionGroups[1].sharedOptions
    ).toBeUndefined();
  });

  it("leaves already-upgraded options untouched", () => {
    const current = [
      {
        id: "current",
        title: "Stored after ADR-0011",
        type: "academic",
        sections: [
          {
            id: "s",
            skill: "reading",
            order: 1,
            durationSeconds: 3600,
            passages: [
              {
                id: "p",
                order: 1,
                title: "A passage",
                questionGroups: [
                  {
                    id: "g",
                    range: [1, 1],
                    type: "matching_features",
                    instruction: "Match each statement.",
                    sharedOptions: [{ label: "A", text: "Rivers Trust" }],
                    answerMatch: { kind: "letter" },
                    questions: [{ number: 1, accept: ["A"] }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ] as unknown as Test[];
    const [test] = upgradeStored(current);
    expect(test.sections[0].passages![0].questionGroups[0].sharedOptions).toEqual([
      { label: "A", text: "Rivers Trust" },
    ]);
  });
});
