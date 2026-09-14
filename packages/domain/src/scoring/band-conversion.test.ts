import { describe, it, expect } from "vitest";
import { rawToBand, overallBand } from "./band-conversion";

describe("rawToBand (Academic, approximate)", () => {
  it("maps top scores to 9.0", () => {
    expect(rawToBand("reading", 40)).toBe(9);
    expect(rawToBand("listening", 39)).toBe(9);
  });

  it("maps representative Reading thresholds", () => {
    expect(rawToBand("reading", 30)).toBe(7);
    expect(rawToBand("reading", 27)).toBe(6.5);
    expect(rawToBand("reading", 23)).toBe(6);
  });

  it("maps representative Listening thresholds", () => {
    expect(rawToBand("listening", 30)).toBe(7);
    expect(rawToBand("listening", 23)).toBe(6);
  });

  it("does not award band 2 for getting nothing right", () => {
    // The table used to bottom out at band 2, so a blank paper read as 2.0.
    // Band 1 is the non-user floor; band 0 means the paper was not attempted,
    // which a raw score alone cannot tell (see lib/scoring.ts).
    for (const skill of ["listening", "reading"] as const) {
      expect(rawToBand(skill, 0)).toBe(1);
      expect(rawToBand(skill, 2)).toBe(1);
      expect(rawToBand(skill, 3)).toBe(2);
      expect(rawToBand(skill, 4)).toBe(2.5);
    }
  });

  it("is monotonic — a higher raw never yields a lower band", () => {
    for (const skill of ["listening", "reading"] as const) {
      let prev = 0;
      for (let raw = 0; raw <= 40; raw++) {
        const b = rawToBand(skill, raw);
        expect(b).toBeGreaterThanOrEqual(prev);
        prev = b;
      }
    }
  });
});

describe("overallBand (IELTS rounding)", () => {
  it("averages and rounds to the nearest half band", () => {
    // .25 rounds up to .5
    expect(overallBand([8, 7.5, 6.5, 7])).toBe(7.5); // avg 7.25 → 7.5
    // .75 rounds up to the whole
    expect(overallBand([6.5, 7, 7, 7])).toBe(7); // avg 6.875 → 7.0
    // below .25 rounds down
    expect(overallBand([6.5, 6.5, 6.5, 6])).toBe(6.5); // avg 6.375 → 6.5
  });

  it("returns an exact average unchanged when already on a half band", () => {
    expect(overallBand([6.5, 6.5, 6.5, 6.5])).toBe(6.5);
  });
});
