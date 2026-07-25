import { describe, it, expect } from "vitest";
import { SAMPLE_MOCK } from "./content/sample-mock";
import { reviewSection } from "./review";

const reading = SAMPLE_MOCK.sections.find((s) => s.skill === "reading")!;

describe("reviewSection", () => {
  it("marks a correct answer and shows the expected answer", () => {
    const review = reviewSection(reading, { 7: "TRUE" });
    const q7 = review.find((r) => r.number === 7)!;
    expect(q7.correct).toBe(true);
    expect(q7.your).toBe("TRUE");
    expect(q7.answer).toContain("TRUE");
  });

  it("marks a wrong answer incorrect but still shows the correct one", () => {
    const review = reviewSection(reading, { 7: "FALSE" });
    const q7 = review.find((r) => r.number === 7)!;
    expect(q7.correct).toBe(false);
    expect(q7.answer).toContain("TRUE");
  });

  it("covers every question in the section", () => {
    const review = reviewSection(reading, {});
    expect(review.map((r) => r.number)).toEqual([7, 8, 9, 10, 11, 12]);
    expect(review.every((r) => r.correct === false)).toBe(true);
  });
});
