"use client";

import type { QuestionGroup } from "@composed/domain";
import { cx } from "@/lib/cx";

function optionsFor(group: QuestionGroup): string[] | null {
  const m = group.answerMatch;
  if (m.kind === "enum") return m.options;
  if (m.kind === "letter" || m.kind === "letter-set") {
    return group.sharedOptions ?? ["A", "B", "C", "D"];
  }
  return null; // text input
}

export function QuestionRenderer({
  group,
  responses,
  onAnswer,
  disabled,
}: {
  group: QuestionGroup;
  responses: Record<number, string>;
  onAnswer: (questionNumber: number, value: string) => void;
  disabled?: boolean;
}) {
  const options = optionsFor(group);

  return (
    <ol className="space-y-6">
      {group.questions.map((q) => {
        const answer = responses[q.number];
        const answered = answer != null && answer !== "";

        return (
          <li key={q.number} className="space-y-3">
            <div className="flex gap-3">
              <span
                className={cx(
                  "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md text-xs font-semibold tabular-nums transition-colors duration-200",
                  answered
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {q.number}
              </span>
              {q.content && (
                <p className="leading-relaxed text-foreground">{q.content}</p>
              )}
            </div>

            {options ? (
              <fieldset
                role="radiogroup"
                aria-label={`Question ${q.number}`}
                className="flex flex-wrap gap-2 pl-9"
              >
                {options.map((opt) => {
                  const id = `q${q.number}-${opt}`;
                  const selected = answer === opt;
                  return (
                    <label
                      key={opt}
                      htmlFor={id}
                      className={cx(
                        // 44px min touch target — options are the most-tapped
                        // control in the whole app.
                        "inline-flex min-h-11 cursor-pointer items-center rounded-xl border px-4 text-sm font-medium",
                        "transition-all duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background",
                        selected
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                        disabled && "pointer-events-none opacity-60",
                      )}
                    >
                      <input
                        id={id}
                        type="radio"
                        name={`q-${q.number}`}
                        value={opt}
                        checked={selected}
                        disabled={disabled}
                        onChange={() => onAnswer(q.number, opt)}
                        className="sr-only"
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </fieldset>
            ) : (
              <div className="pl-9">
                <input
                  type="text"
                  aria-label={`Question ${q.number}`}
                  value={answer ?? ""}
                  disabled={disabled}
                  onChange={(e) => onAnswer(q.number, e.target.value)}
                  className={cx(
                    "w-full max-w-sm rounded-xl border bg-card px-3.5 py-2.5 text-foreground outline-none",
                    "transition-colors duration-200 placeholder:text-muted-foreground/70",
                    "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-60",
                    answered ? "border-primary/50" : "border-border",
                  )}
                  placeholder="Type your answer"
                />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
