import { describe, it, expect } from "vitest";
import { SAMPLE_MOCK } from "./content/sample-mock";
import { computeObjectiveResults } from "./scoring";

const PERFECT: Record<number, string> = {
  // listening
  1: "B",
  2: "A",
  3: "C",
  4: "entrance",
  5: "towel",
  6: "Sarah",
  // reading
  7: "TRUE",
  8: "FALSE",
  9: "NOT GIVEN",
  10: "concrete",
  11: "gravel beds",
  12: "pollution",
};

describe("computeObjectiveResults", () => {
  it("scores L & R only, with a band per section", () => {
    const { results } = computeObjectiveResults(SAMPLE_MOCK, PERFECT);
    expect(results.map((r) => r.skill).sort()).toEqual(["listening", "reading"]);
  });

  it("gives a perfect response the top indicative band", () => {
    const { results, overall } = computeObjectiveResults(SAMPLE_MOCK, PERFECT);
    for (const r of results) {
      expect(r.raw).toBe(r.max);
      expect(r.band).toBe(9);
    }
    expect(overall).toBe(9);
  });

  it("scores partial answers below the top band", () => {
    const partial = { ...PERFECT };
    delete partial[1];
    delete partial[2];
    delete partial[3];
    const { results } = computeObjectiveResults(SAMPLE_MOCK, partial);
    const listening = results.find((r) => r.skill === "listening")!;
    expect(listening.raw).toBe(3);
    expect(listening.band).toBeLessThan(9);
  });
});

describe("an unattempted section", () => {
  it("is band 0, not the floor of the conversion table", () => {
    // IELTS scores "did not attempt" as 0 and "attempted, nothing right" as 1.
    // A raw of 0 is the same number either way, so only the responses can tell
    // them apart — and reporting 2.0 for a blank paper was neither.
    const blank = computeObjectiveResults(SAMPLE_MOCK, {});
    expect(blank.results.every((r) => r.band === 0)).toBe(true);
    expect(blank.overall).toBe(0);
  });

  it("is band 1 once it has been attempted, however badly", () => {
    const wrong: Record<number, string> = {};
    for (const r of computeObjectiveResults(SAMPLE_MOCK, {}).results) {
      for (const m of r.marks) wrong[m.number] = "definitely not the answer";
    }
    const attempted = computeObjectiveResults(SAMPLE_MOCK, wrong);
    expect(attempted.results.every((r) => r.raw === 0)).toBe(true);
    expect(attempted.results.every((r) => r.band === 1)).toBe(true);
  });

  it("does not count whitespace as an attempt", () => {
    const blanks = computeObjectiveResults(SAMPLE_MOCK, { 1: "  ", 4: "" });
    expect(blanks.results.every((r) => r.band === 0)).toBe(true);
  });
});
