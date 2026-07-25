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
