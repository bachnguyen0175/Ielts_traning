import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

/**
 * Empty states must say what is missing *and* offer the next move — a blank
 * panel reads as a bug (ux-guidelines: Feedback / Empty States).
 *
 * Children are the body: description text, then whatever action fits.
 */
export function EmptyState({
  icon,
  title,
  className,
  children,
}: {
  icon: ReactNode;
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cx(
        "flex flex-col items-center rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center",
        className,
      )}
    >
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
        {icon}
      </span>
      <h3 className="mt-4 font-serif text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <div className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </div>
  );
}
