"use client";

import type { Test } from "@composed/domain";
import { formatClock } from "@composed/domain";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cx } from "@/lib/cx";
import { useCountdown } from "./use-countdown";
import { SectionView } from "./section-view";
import {
  HeadphonesIcon,
  BookIcon,
  PenIcon,
  MicIcon,
  ArrowRightIcon,
} from "@/components/ui/icons";

const SKILLS = {
  listening: { label: "Listening", Icon: HeadphonesIcon },
  reading: { label: "Reading", Icon: BookIcon },
  writing: { label: "Writing", Icon: PenIcon },
  speaking: { label: "Speaking", Icon: MicIcon },
} as const;

/**
 * Clock urgency. Amber is caution, rose is "you are about to run out" — the one
 * place the app spends a hot colour, because a silently expiring section is
 * worse than an alarming one.
 */
function urgency(remaining: number): "calm" | "caution" | "urgent" {
  if (remaining <= 60) return "urgent";
  if (remaining <= 300) return "caution";
  return "calm";
}

const CLOCK_STYLES = {
  calm: "bg-muted text-foreground",
  caution: "bg-accent/15 text-accent-foreground dark:text-accent",
  urgent: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
} as const;

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
  const tone = urgency(remaining);
  const elapsedPct = Math.min(
    100,
    Math.max(0, (1 - remaining / section.durationSeconds) * 100),
  );

  const skill = SKILLS[section.skill as keyof typeof SKILLS];
  const SkillIcon = skill?.Icon;

  const questionNumbers = (section.passages ?? [])
    .flatMap((p) => p.questionGroups)
    .flatMap((g) => g.questions.map((q) => q.number));

  const answeredCount = questionNumbers.filter(
    (n) => responses[n] != null && responses[n] !== "",
  ).length;

  return (
    <main className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <Container className="flex h-16 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {SkillIcon && (
              <span className="hidden h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground sm:grid">
                <SkillIcon className="h-5 w-5" />
              </span>
            )}
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Section {sectionIndex + 1} of {test.sections.length}
              </p>
              <p className="font-serif text-lg font-semibold leading-tight text-foreground">
                {skill?.label ?? section.skill}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Which sections are done, which is live, which are ahead. */}
            <ol
              aria-hidden="true"
              className="hidden items-center gap-1.5 sm:flex"
            >
              {test.sections.map((s, i) => (
                <li
                  key={s.id}
                  className={cx(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === sectionIndex
                      ? "w-7 bg-accent"
                      : i < sectionIndex
                        ? "w-4 bg-foreground/35"
                        : "w-4 bg-border",
                  )}
                />
              ))}
            </ol>

            <div
              role="timer"
              aria-label="Time remaining"
              className={cx(
                "rounded-full px-4 py-1.5 font-mono text-lg font-semibold tabular-nums transition-colors duration-300",
                CLOCK_STYLES[tone],
              )}
            >
              {formatClock(remaining)}
            </div>
          </div>
        </Container>

        {/* Elapsed time as a hairline — glanceable without reading the clock. */}
        <div className="h-0.5 w-full bg-border/60">
          <div
            className={cx(
              "h-full transition-[width] duration-1000 ease-linear",
              tone === "urgent"
                ? "bg-rose-500"
                : tone === "caution"
                  ? "bg-accent"
                  : "bg-foreground/30",
            )}
            style={{ width: `${elapsedPct}%` }}
          />
        </div>

        {questionNumbers.length > 0 && (
          <Container className="flex flex-wrap items-center gap-1.5 py-3">
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
                  title={`Question ${n} — click to ${isFlagged ? "unflag" : "flag for review"}`}
                  className={cx(
                    "grid h-7 w-7 cursor-pointer place-items-center rounded-md text-xs font-medium tabular-nums transition-all duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                    isFlagged
                      ? "bg-accent/20 text-accent-foreground ring-2 ring-accent dark:text-accent"
                      : answered
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {n}
                </button>
              );
            })}

            <p className="ml-auto text-xs text-muted-foreground">
              <span className="font-medium tabular-nums text-foreground">
                {answeredCount}
              </span>
              /{questionNumbers.length} answered · click a number to flag it
            </p>
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

      <footer className="sticky bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur-md">
        <Container className="flex h-16 items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            No feedback until you finish.
          </p>
          <Button type="button" variant="accent" size="md" onClick={handleNext}>
            {isLast ? "Finish mock" : "Next section"}
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </Container>
      </footer>
    </main>
  );
}
