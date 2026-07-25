import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useCountdown } from "./use-countdown";

describe("useCountdown", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("counts down each second and fires onExpire once", () => {
    let clock = 0;
    const now = () => clock;
    const onExpire = vi.fn();

    const { result } = renderHook(() =>
      useCountdown(0, 3, { now, tickMs: 1000, onExpire })
    );
    expect(result.current).toBe(3);

    act(() => {
      clock = 1000;
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(2);

    act(() => {
      clock = 3000;
      vi.advanceTimersByTime(2000);
    });
    expect(result.current).toBe(0);
    expect(onExpire).toHaveBeenCalledTimes(1);

    // further ticks do not re-fire
    act(() => {
      clock = 5000;
      vi.advanceTimersByTime(2000);
    });
    expect(onExpire).toHaveBeenCalledTimes(1);
  });
});
