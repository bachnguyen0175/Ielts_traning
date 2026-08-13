import type { Test } from "@composed/domain";
import { reviewSection } from "@/lib/review";
import { Card, CardBody } from "@/components/ui/card";
import { cx } from "@/lib/cx";
import {
  CheckIcon,
  XIcon,
  HeadphonesIcon,
  BookIcon,
  PenIcon,
  MicIcon,
} from "@/components/ui/icons";

const WRITING_CRITERIA = [
  "Task Achievement / Response",
  "Coherence & Cohesion",
  "Lexical Resource",
  "Grammatical Range & Accuracy",
];
const SPEAKING_CRITERIA = [
  "Fluency & Coherence",
  "Lexical Resource",
  "Grammatical Range & Accuracy",
  "Pronunciation",
];

const SKILLS = {
  listening: { label: "Listening", Icon: HeadphonesIcon },
  reading: { label: "Reading", Icon: BookIcon },
  writing: { label: "Writing", Icon: PenIcon },
  speaking: { label: "Speaking", Icon: MicIcon },
} as const;

function Mark({ correct }: { correct: boolean }) {
  return (
    <span
      aria-label={correct ? "correct" : "incorrect"}
      className={cx(
        "grid h-6 w-6 shrink-0 place-items-center rounded-full",
        // Not `bg-destructive` — no such token exists in the theme, so the old
        // version rendered the wrong-answer mark with no background at all.
        correct
          ? "bg-emerald-600/15 text-emerald-700 dark:text-emerald-300"
          : "bg-rose-600/15 text-rose-700 dark:text-rose-300",
      )}
    >
      {correct ? (
        <CheckIcon className="h-3.5 w-3.5" />
      ) : (
        <XIcon className="h-3.5 w-3.5" />
      )}
    </span>
  );
}

function SectionHeading({
  skill,
  children,
}: {
  skill: keyof typeof SKILLS;
  children?: React.ReactNode;
}) {
  const { label, Icon } = SKILLS[skill];
  return (
    <h2 className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-serif text-2xl font-semibold tracking-tight text-foreground">
      <span className="flex items-center gap-2.5">
        <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
        {label}
      </span>
      {children}
    </h2>
  );
}

function Criteria({ list }: { list: string[] }) {
  return (
    <div className="mt-4 rounded-xl border border-border bg-background/40 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        Self-review against the band criteria
      </p>
      <ul className="mt-2.5 grid gap-1.5 sm:grid-cols-2">
        {list.map((c) => (
          <li key={c} className="flex items-center gap-2 text-sm text-foreground">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ReviewView({
  test,
  responses,
  submissions,
  audioUrls,
}: {
  test: Test;
  responses: Record<number, string>;
  submissions: Record<string, string>;
  audioUrls: Record<string, string>;
}) {
  return (
    <div className="space-y-12">
      {test.sections.map((section, i) => {
        const skill = section.skill as keyof typeof SKILLS;

        if (section.skill === "listening" || section.skill === "reading") {
          const reviews = reviewSection(section, responses);
          const correct = reviews.filter((r) => r.correct).length;
          const pct =
            reviews.length > 0 ? (correct / reviews.length) * 100 : 0;

          return (
            <section
              key={section.id}
              className="enter"
              style={{ ["--i" as string]: Math.min(i, 4) }}
            >
              <SectionHeading skill={skill}>
                <span className="text-base font-normal tabular-nums text-muted-foreground">
                  {correct}/{reviews.length} correct
                </span>
              </SectionHeading>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <Card className="mt-4 overflow-hidden">
                <ul className="divide-y divide-border/70">
                  {reviews.map((r) => (
                    <li
                      key={r.number}
                      className={cx(
                        "flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-3",
                        !r.correct && "bg-rose-500/[0.04]",
                      )}
                    >
                      <span className="w-6 shrink-0 text-sm font-semibold tabular-nums text-muted-foreground">
                        {r.number}
                      </span>
                      <Mark correct={r.correct} />
                      <span className="min-w-0 text-sm text-foreground">
                        {r.your || (
                          <em className="text-muted-foreground">blank</em>
                        )}
                      </span>
                      {!r.correct && (
                        <span className="ml-auto text-sm text-muted-foreground">
                          Correct:{" "}
                          <span className="font-medium text-foreground">
                            {r.answer}
                          </span>
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          );
        }

        const criteria =
          section.skill === "writing" ? WRITING_CRITERIA : SPEAKING_CRITERIA;

        return (
          <section
            key={section.id}
            className="enter"
            style={{ ["--i" as string]: Math.min(i, 4) }}
          >
            <SectionHeading skill={skill} />
            <div className="mt-4 space-y-4">
              {(section.prompts ?? []).map((p) => (
                <Card key={p.id}>
                  <CardBody>
                    <p className="text-sm leading-relaxed text-foreground">
                      {p.instruction}
                    </p>
                    {section.skill === "writing" ? (
                      <blockquote className="mt-4 whitespace-pre-wrap rounded-xl border-l-2 border-accent bg-muted/40 p-4 text-sm leading-relaxed text-foreground">
                        {submissions[p.id] || (
                          <span className="text-muted-foreground">
                            No response
                          </span>
                        )}
                      </blockquote>
                    ) : audioUrls[p.id] ? (
                      <audio
                        controls
                        src={audioUrls[p.id]}
                        className="mt-4 w-full"
                      />
                    ) : (
                      <p className="mt-4 text-sm text-muted-foreground">
                        No recording
                      </p>
                    )}
                    <Criteria list={criteria} />
                  </CardBody>
                </Card>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
