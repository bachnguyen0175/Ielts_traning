import { describe, it, expect } from "vitest";
import type { Attempt } from "@composed/domain";
import { nextAction } from "./next-action";

function attempt(over: Partial<Attempt>): Attempt {
  return {
    id: "a1",
    testId: "sample",
    status: "submitted",
    startedAt: 1000,
    sectionStartedAt: {},
    currentSectionIndex: 0,
    responses: {},
    flagged: [],
    submissions: [],
    ...over,
  };
}

describe("nextAction", () => {
  it("invites a first mock when there is no history", () => {
    expect(nextAction([])).toMatchObject({
      href: "/mock",
      label: "Start your first mock",
    });
  });

  it("resumes an in-progress attempt, linking to its id", () => {
    const a = attempt({ id: "abc", status: "in_progress", overall: undefined });
    expect(nextAction([a])).toMatchObject({
      href: "/mock/run?a=abc",
      label: "Resume your mock",
    });
  });

  it("offers a new mock once a scored attempt exists", () => {
    const a = attempt({ status: "submitted", overall: 6.5 });
    expect(nextAction([a])).toMatchObject({
      href: "/mock",
      label: "Start a new mock",
    });
  });
});
