"use client";

import { useEffect, useRef, useState } from "react";
import { remainingSeconds, isExpired } from "@composed/domain";

/**
 * Server-anchored countdown: remaining time is always derived from `startedAtMs`
 * + `durationSeconds`, so a reload resumes with the clock still running. Ticks
 * once a second and fires `onExpire` exactly once.
 */
export function useCountdown(
  startedAtMs: number,
  durationSeconds: number,
  opts?: { now?: () => number; tickMs?: number; onExpire?: () => void }
): number {
  const now = opts?.now ?? (() => Date.now());
  const tickMs = opts?.tickMs ?? 1000;
  const [remaining, setRemaining] = useState(() =>
    remainingSeconds(startedAtMs, durationSeconds, now())
  );
  const firedExpire = useRef(false);
  const onExpire = opts?.onExpire;

  useEffect(() => {
    firedExpire.current = false;
    const tick = () => {
      const t = now();
      setRemaining(remainingSeconds(startedAtMs, durationSeconds, t));
      if (isExpired(startedAtMs, durationSeconds, t) && !firedExpire.current) {
        firedExpire.current = true;
        onExpire?.();
      }
    };
    tick();
    const id = setInterval(tick, tickMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAtMs, durationSeconds, tickMs]);

  return remaining;
}
