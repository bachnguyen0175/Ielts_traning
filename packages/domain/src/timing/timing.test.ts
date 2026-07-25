import { describe, it, expect } from "vitest";
import {
  remainingSeconds,
  isExpired,
  elapsedSeconds,
  formatClock,
  nextSectionIndex,
} from "./timing";

describe("timing math (server-anchored via startedAt)", () => {
  it("computes remaining seconds, clamped at zero", () => {
    expect(remainingSeconds(0, 60, 10_000)).toBe(50);
    expect(remainingSeconds(0, 60, 70_000)).toBe(0);
  });

  it("expires exactly when elapsed reaches the duration", () => {
    expect(isExpired(0, 60, 59_999)).toBe(false);
    expect(isExpired(0, 60, 60_000)).toBe(true);
  });

  it("computes elapsed seconds from the anchor", () => {
    expect(elapsedSeconds(1_000, 4_000)).toBe(3);
  });
});

describe("formatClock", () => {
  it("formats mm:ss under an hour", () => {
    expect(formatClock(65)).toBe("01:05");
    expect(formatClock(0)).toBe("00:00");
  });
  it("formats h:mm:ss at/over an hour", () => {
    expect(formatClock(3661)).toBe("1:01:01");
  });
  it("never shows negative time", () => {
    expect(formatClock(-5)).toBe("00:00");
  });
});

describe("nextSectionIndex", () => {
  it("advances to the next section, or null at the end", () => {
    expect(nextSectionIndex(4, 0)).toBe(1);
    expect(nextSectionIndex(4, 3)).toBeNull();
  });
});
