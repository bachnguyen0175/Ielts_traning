import { describe, it, expect } from "vitest";
import { scoreQuestionGroup, scoreSection } from "./answer-match";
import type { QuestionGroup, Section } from "../types";

function textGroup(): QuestionGroup {
  return {
    id: "g",
    range: [1, 4],
    type: "sentence_completion",
    instruction: "ONE WORD ONLY",
    answerMatch: {
      kind: "text",
      caseSensitive: false,
      normalize: ["trim", "collapse-ws", "lowercase"],
    },
    questions: [
      { number: 1, accept: ["oval"] },
      { number: 2, accept: ["land surface"] },
      { number: 3, accept: ["isolated", "uncontacted"] },
      { number: 4, accept: ["Run"] },
    ],
  };
}

describe("text matching", () => {
  it("is case-insensitive and trims/collapses whitespace", () => {
    const r = scoreQuestionGroup(textGroup(), { 1: "  Oval " });
    expect(r.marks.find((m) => m.number === 1)?.correct).toBe(true);
  });

  it("accepts multi-word answers with collapsed internal whitespace", () => {
    const r = scoreQuestionGroup(textGroup(), { 2: "land   surface" });
    expect(r.marks.find((m) => m.number === 2)?.correct).toBe(true);
  });

  it("accepts any listed alternate", () => {
    const r = scoreQuestionGroup(textGroup(), { 3: "Uncontacted" });
    expect(r.marks.find((m) => m.number === 3)?.correct).toBe(true);
  });

  it("marks wrong and missing answers incorrect", () => {
    const r = scoreQuestionGroup(textGroup(), { 1: "round" });
    expect(r.marks.find((m) => m.number === 1)?.correct).toBe(false);
    // q2-4 unanswered
    expect(r.raw).toBe(0);
  });

  it("respects caseSensitive when set", () => {
    const g = textGroup();
    g.answerMatch = { kind: "text", caseSensitive: true };
    expect(
      scoreQuestionGroup(g, { 4: "run" }).marks.find((m) => m.number === 4)
        ?.correct
    ).toBe(false);
    expect(
      scoreQuestionGroup(g, { 4: "Run" }).marks.find((m) => m.number === 4)
        ?.correct
    ).toBe(true);
  });
});

describe("enum (TFNG) matching", () => {
  const g: QuestionGroup = {
    id: "g",
    range: [5, 6],
    type: "true_false_not_given",
    instruction: "TRUE/FALSE/NOT GIVEN",
    answerMatch: { kind: "enum", options: ["TRUE", "FALSE", "NOT GIVEN"] },
    questions: [
      { number: 5, accept: ["FALSE"] },
      { number: 6, accept: ["NOT GIVEN"] },
    ],
  };

  it("matches case-insensitively against the accepted option", () => {
    const r = scoreQuestionGroup(g, { 5: "false", 6: "not given" });
    expect(r.raw).toBe(2);
  });

  it("marks a different option incorrect", () => {
    const r = scoreQuestionGroup(g, { 5: "TRUE" });
    expect(r.marks.find((m) => m.number === 5)?.correct).toBe(false);
  });
});

describe("letter matching", () => {
  const g: QuestionGroup = {
    id: "g",
    range: [14, 15],
    type: "matching_information",
    instruction: "A–G",
    answerMatch: { kind: "letter" },
    questions: [
      { number: 14, accept: ["C"] },
      { number: 15, accept: ["B"] },
    ],
  };

  it("matches a single letter case-insensitively", () => {
    expect(scoreQuestionGroup(g, { 14: "c", 15: "B" }).raw).toBe(2);
  });
});

describe("letter-set (choose TWO) matching", () => {
  const g: QuestionGroup = {
    id: "g",
    range: [23, 24],
    type: "multiple_choice_multi",
    instruction: "Choose TWO letters",
    answerMatch: { kind: "letter-set", anyOrder: true },
    selectCount: 2,
    acceptSet: ["C", "D"],
    questions: [
      { number: 23, acceptSetMember: true },
      { number: 24, acceptSetMember: true },
    ],
  };

  it("awards full marks regardless of slot order", () => {
    expect(scoreQuestionGroup(g, { 23: "C", 24: "D" }).raw).toBe(2);
    expect(scoreQuestionGroup(g, { 23: "D", 24: "C" }).raw).toBe(2);
  });

  it("awards partial credit for one correct letter", () => {
    expect(scoreQuestionGroup(g, { 23: "C", 24: "A" }).raw).toBe(1);
  });

  it("does not double-count a repeated correct letter", () => {
    expect(scoreQuestionGroup(g, { 23: "C", 24: "C" }).raw).toBe(1);
  });

  it("awards zero for two wrong letters", () => {
    expect(scoreQuestionGroup(g, { 23: "A", 24: "B" }).raw).toBe(0);
  });
});

describe("scoreSection", () => {
  const section: Section = {
    id: "sec",
    skill: "reading",
    order: 1,
    durationSeconds: 3600,
    passages: [
      {
        id: "p1",
        order: 1,
        title: "P1",
        questionGroups: [textGroup()],
      },
    ],
  };

  it("aggregates raw and max across a section's groups", () => {
    const r = scoreSection(section, { 1: "oval", 2: "land surface" });
    expect(r.raw).toBe(2);
    expect(r.max).toBe(4);
    expect(r.skill).toBe("reading");
    expect(r.marks).toHaveLength(4);
  });
});
