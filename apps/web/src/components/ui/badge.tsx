import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

const TONES = {
  neutral: "border-border bg-muted/60 text-muted-foreground",
  accent: "border-accent/30 bg-accent/15 text-accent-foreground dark:text-accent",
  primary: "border-primary/25 bg-primary/12 text-primary",
  /** Scored correct, target met, section finished. */
  good: "border-emerald-600/25 bg-emerald-600/12 text-emerald-800 dark:text-emerald-300",
  /** Scored wrong, expired, missed. */
  bad: "border-rose-600/25 bg-rose-600/12 text-rose-800 dark:text-rose-300",
} as const;

export type BadgeTone = keyof typeof TONES;

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
