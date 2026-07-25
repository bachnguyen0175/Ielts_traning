import { describe, it, expect } from "vitest";
import { DAY_MS, nextBox, dueAt, reviewCard, isDue } from "./srs";

describe("srs (placeholder Leitner scheduler)", () => {
  it("promotes on remembered, capping at the last box", () => {
    expect(nextBox(0, true)).toBe(1);
    expect(nextBox(3, true)).toBe(4);
    expect(nextBox(4, true)).toBe(4); // capped
  });

  it("resets to box 0 on forgotten", () => {
    expect(nextBox(4, false)).toBe(0);
    expect(nextBox(1, false)).toBe(0);
  });

  it("schedules later due dates for higher boxes", () => {
    const now = 1_000_000;
    expect(dueAt(0, now)).toBe(now + 0 * DAY_MS);
    expect(dueAt(1, now)).toBe(now + 1 * DAY_MS);
    expect(dueAt(4, now)).toBeGreaterThan(dueAt(3, now));
  });

  it("reviewCard advances the box and recomputes due", () => {
    const card = { box: 1, dueAt: 0 };
    const now = 5_000;
    const remembered = reviewCard(card, true, now);
    expect(remembered.box).toBe(2);
    expect(remembered.dueAt).toBe(now + 3 * DAY_MS);

    const forgot = reviewCard(card, false, now);
    expect(forgot.box).toBe(0);
    expect(forgot.dueAt).toBe(now);
  });

  it("isDue compares dueAt to now", () => {
    expect(isDue({ dueAt: 100 }, 200)).toBe(true);
    expect(isDue({ dueAt: 300 }, 200)).toBe(false);
  });
});
