"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Progressive scroll-reveal. The visual transition lives in CSS (.reveal) and is
 * automatically disabled under prefers-reduced-motion. A <noscript> fallback in
 * the layout keeps content visible without JS.
 */
export function Reveal({
  children,
  className,
  as: Tag = "div",
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "li";
  delayMs?: number;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // Environments without IntersectionObserver (e.g. jsdom): reveal
      // immediately, deferred to a microtask so it isn't a synchronous
      // setState in the effect body.
      Promise.resolve().then(() => setShown(true));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={["reveal", className].filter(Boolean).join(" ")}
      data-shown={shown ? "true" : "false"}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
