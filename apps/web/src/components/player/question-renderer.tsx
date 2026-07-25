"use client";

import type { QuestionGroup } from "@composed/domain";

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
      {group.questions.map((q) => (
        <li key={q.number} className="space-y-3">
          <div className="flex gap-3">
            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
              {q.number}
            </span>
            {q.content && <p className="text-foreground">{q.content}</p>}
          </div>

          {options ? (
            <fieldset
              role="radiogroup"
              aria-label={`Question ${q.number}`}
              className="flex flex-wrap gap-2 pl-9"
            >
              {options.map((opt) => {
                const id = `q${q.number}-${opt}`;
                const selected = responses[q.number] === opt;
                return (
                  <label
                    key={opt}
                    htmlFor={id}
                    className={[
                      "cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                      selected
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40",
                      disabled ? "pointer-events-none opacity-60" : "",
                    ].join(" ")}
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
                value={responses[q.number] ?? ""}
                disabled={disabled}
                onChange={(e) => onAnswer(q.number, e.target.value)}
                className="w-full max-w-sm rounded-lg border border-border bg-card px-3 py-2 text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-60"
                placeholder="Type your answer"
              />
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
