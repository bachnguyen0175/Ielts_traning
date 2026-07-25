"use client";

import type { Test } from "@composed/domain";
import { formatClock } from "@composed/domain";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useCountdown } from "./use-countdown";
import { SectionView } from "./section-view";

const SKILL_LABEL: Record<string, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

export function Player({
  test,
  sectionIndex,
  sectionStartedAt,
  responses,
  flagged,
  submissions,
  onAnswer,
  onToggleFlag,
  onSubmission,
  onAdvance,
  onFinish,
  now,
  audioUrls = {},
  onRecorded = () => {},
}: {
  test: Test;
  sectionIndex: number;
  sectionStartedAt: number;
  responses: Record<number, string>;
  flagged: number[];
  submissions: Record<string, string>;
  onAnswer: (n: number, v: string) => void;
  onToggleFlag: (n: number) => void;
  onSubmission: (promptId: string, text: string) => void;
  onAdvance: () => void;
  onFinish: () => void;
  now?: () => number;
  audioUrls?: Record<string, string>;
  onRecorded?: (promptId: string, url: string, seconds: number) => void;
}) {
  const section = test.sections[sectionIndex];
  const isLast = sectionIndex >= test.sections.length - 1;

  function handleNext() {
    if (isLast) onFinish();
    else onAdvance();
  }

  const remaining = useCountdown(sectionStartedAt, section.durationSeconds, {
    now,
    onExpire: handleNext,
  });
  const low = remaining <= 60;

  const questionNumbers = (section.passages ?? [])
    .flatMap((p) => p.questionGroups)
    .flatMap((g) => g.questions.map((q) => q.number));

  return (
    <main className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <Container className="flex h-16 items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Section {sectionIndex + 1} of {test.sections.length}
            </p>
            <p className="font-serif text-lg font-semibold text-foreground">
              {SKILL_LABEL[section.skill]}
            </p>
          </div>
          <div
            aria-label="Time remaining"
            className={[
              "rounded-full px-4 py-1.5 font-mono text-lg font-semibold tabular-nums",
              low
                ? "bg-accent/15 text-accent-foreground dark:text-accent"
                : "bg-muted text-foreground",
            ].join(" ")}
          >
            {formatClock(remaining)}
          </div>
        </Container>

        {questionNumbers.length > 0 && (
          <Container className="flex flex-wrap gap-1.5 pb-3">
            {questionNumbers.map((n) => {
              const answered = responses[n] != null && responses[n] !== "";
              const isFlagged = flagged.includes(n);
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => onToggleFlag(n)}
                  aria-label={`Question ${n}${isFlagged ? " (flagged)" : ""}`}
                  aria-pressed={isFlagged}
                  className={[
                    "grid h-7 w-7 place-items-center rounded-md text-xs font-medium transition-colors",
                    isFlagged
                      ? "ring-2 ring-accent"
                      : answered
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-muted-foreground hover:border-primary/40",
                  ].join(" ")}
                >
                  {n}
                </button>
              );
            })}
          </Container>
        )}
      </header>

      <Container className="flex-1 py-8">
        <SectionView
          section={section}
          responses={responses}
          onAnswer={onAnswer}
          submissions={submissions}
          onSubmission={onSubmission}
          audioUrls={audioUrls}
          onRecorded={onRecorded}
        />
      </Container>

      <footer className="sticky bottom-0 border-t border-border bg-background/90 backdrop-blur">
        <Container className="flex h-16 items-center justify-between">
          <p className="text-sm text-muted-foreground">
            No feedback until you finish.
          </p>
          <Button type="button" variant="accent" size="md" onClick={handleNext}>
            {isLast ? "Finish mock" : "Next section"}
          </Button>
        </Container>
      </footer>
    </main>
  );
}
