import type { TestSummary } from "@/lib/data/repositories";
import { Button } from "@/components/ui/button";

const SKILL_SHORT: Record<string, string> = {
  listening: "L",
  reading: "R",
  writing: "W",
  speaking: "S",
};

export function TestCatalog({ tests }: { tests: TestSummary[] }) {
  if (tests.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center text-muted-foreground">
        No tests available yet.
      </p>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {tests.map((t) => (
        <div
          key={t.id}
          className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              {t.source && (
                <p className="text-xs font-semibold uppercase tracking-wide text-accent-foreground/70 dark:text-accent">
                  {t.source}
                </p>
              )}
              <h3 className="mt-1 font-serif text-lg font-semibold text-foreground">
                {t.title}
              </h3>
            </div>
            {t.access === "private" && (
              <span className="shrink-0 rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Private
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {t.skills.map((s, i) => (
              <span
                key={`${s}-${i}`}
                className="grid h-6 w-6 place-items-center rounded-md bg-muted text-xs font-semibold text-muted-foreground"
                title={s}
              >
                {SKILL_SHORT[s]}
              </span>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            {t.totalQuestions > 0 && `${t.totalQuestions} questions · `}
            {t.durationMinutes} min · {t.type}
          </p>

          <div className="mt-auto">
            <Button
              href={`/mock?test=${t.id}`}
              variant="accent"
              size="md"
              aria-label={`Start ${t.title}`}
            >
              Start
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
