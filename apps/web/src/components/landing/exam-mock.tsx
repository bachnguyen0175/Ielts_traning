import type { ReactNode } from "react";

/**
 * Decorative, stylized preview of the test interface. Purely visual — hidden
 * from assistive tech so it doesn't inject fake semantics into the page.
 */
export function ExamMock({ variant = "reading" }: { variant?: "reading" | "listening" }) {
  return (
    <div
      aria-hidden="true"
      className="relative select-none rounded-2xl border border-border bg-card shadow-xl shadow-primary/5"
    >
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-border px-5 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
        <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
        <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
        <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
          <span className="font-medium">
            {variant === "reading" ? "Reading · Passage 2" : "Listening · Part 3"}
          </span>
          <TimerPill>{variant === "reading" ? "37:41" : "04:12"}</TimerPill>
        </div>
      </div>

      <div className="grid gap-5 p-5 sm:grid-cols-2">
        {/* left: passage / audio */}
        <div className="space-y-2.5">
          {variant === "listening" && (
            <div className="mb-3 flex items-end gap-[3px]">
              {[9, 15, 7, 20, 12, 24, 10, 18, 6, 22, 14, 8, 17, 11, 21, 9].map(
                (h, i) => (
                  <span
                    key={i}
                    className="w-1 rounded-full bg-primary/40"
                    style={{ height: `${h}px` }}
                  />
                )
              )}
              <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground/80 dark:text-accent">
                Plays once
              </span>
            </div>
          )}
          <Line w="w-full" />
          <Line w="w-[92%]" />
          <Line w="w-[97%]" highlight />
          <Line w="w-[78%]" />
          <Line w="w-full" />
          <Line w="w-[64%]" />
        </div>

        {/* right: a question */}
        <div className="space-y-3 rounded-xl bg-muted/50 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Question 18
          </div>
          <Line w="w-[88%]" />
          <div className="space-y-2 pt-1">
            <Option label="A" />
            <Option label="B" selected />
            <Option label="C" />
            <Option label="D" />
          </div>
        </div>
      </div>

      {/* question nav */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-border px-5 py-3">
        {Array.from({ length: 13 }).map((_, i) => (
          <span
            key={i}
            className={[
              "grid h-6 w-6 place-items-center rounded-md text-[10px] font-medium",
              i === 4
                ? "bg-primary text-primary-foreground"
                : i === 7
                  ? "ring-2 ring-accent text-foreground"
                  : i < 4
                    ? "bg-muted text-muted-foreground"
                    : "border border-border text-muted-foreground",
            ].join(" ")}
          >
            {i + 1}
          </span>
        ))}
      </div>
    </div>
  );
}

function TimerPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-1 font-mono text-xs font-semibold text-accent-foreground/90 dark:text-accent">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      {children}
    </span>
  );
}

function Line({ w, highlight }: { w: string; highlight?: boolean }) {
  return (
    <div
      className={[
        "h-2.5 rounded-full",
        w,
        highlight ? "bg-accent/25" : "bg-muted-foreground/15",
      ].join(" ")}
    />
  );
}

function Option({ label, selected }: { label: string; selected?: boolean }) {
  return (
    <div
      className={[
        "flex items-center gap-2.5 rounded-lg border px-3 py-2",
        selected
          ? "border-primary/40 bg-primary/5"
          : "border-border bg-background/40",
      ].join(" ")}
    >
      <span
        className={[
          "grid h-4 w-4 place-items-center rounded-full border text-[9px] font-semibold",
          selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/40 text-muted-foreground",
        ].join(" ")}
      >
        {label}
      </span>
      <span
        className={[
          "h-2 rounded-full",
          selected ? "w-24 bg-primary/30" : "w-20 bg-muted-foreground/15",
        ].join(" ")}
      />
    </div>
  );
}
