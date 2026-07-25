"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts from 0 → `to` when scrolled into view. Respects reduced motion and
 * SSR/no-IO environments by settling on the final value immediately (deferred
 * to a microtask so it isn't a synchronous setState in the effect body).
 */
export function CountUp({
  to,
  decimals = 0,
  durationMs = 1400,
  className,
}: {
  to: number;
  decimals?: number;
  durationMs?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduced || typeof IntersectionObserver === "undefined") {
      Promise.resolve().then(() => setValue(to));
      return;
    }

    let raf = 0;
    let started = false;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started) {
            started = true;
            const start = performance.now();
            const tick = (now: number) => {
              const p = Math.min(1, (now - start) / durationMs);
              const eased = 1 - Math.pow(1 - p, 3);
              setValue(to * eased);
              if (p < 1) raf = requestAnimationFrame(tick);
              else setValue(to);
            };
            raf = requestAnimationFrame(tick);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, durationMs]);

  return (
    <span ref={ref} className={className}>
      {value.toFixed(decimals)}
    </span>
  );
}
