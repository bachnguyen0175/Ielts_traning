import type { Test } from "@composed/domain";
import { reviewSection } from "@/lib/review";

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

const SKILL_LABEL: Record<string, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

function Mark({ correct }: { correct: boolean }) {
  return (
    <span
      aria-label={correct ? "correct" : "incorrect"}
      className={[
        "grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold",
        correct
          ? "bg-primary/15 text-primary"
          : "bg-destructive/15 text-[hsl(0_70%_45%)]",
      ].join(" ")}
    >
      {correct ? "✓" : "✕"}
    </span>
  );
}

function Criteria({ list }: { list: string[] }) {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Self-review against the band criteria
      </p>
      <ul className="mt-2 space-y-1.5">
        {list.map((c) => (
          <li key={c} className="flex items-center gap-2 text-sm text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
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
      {test.sections.map((section) => {
        if (section.skill === "listening" || section.skill === "reading") {
          const reviews = reviewSection(section, responses);
          const correct = reviews.filter((r) => r.correct).length;
          return (
            <section key={section.id} className="space-y-4">
              <h2 className="font-serif text-2xl font-semibold text-foreground">
                {SKILL_LABEL[section.skill]}{" "}
                <span className="text-base font-normal text-muted-foreground">
                  · {correct}/{reviews.length} correct
                </span>
              </h2>
              <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
                {reviews.map((r) => (
                  <li key={r.number} className="flex items-center gap-3 p-3">
                    <span className="w-6 text-sm font-semibold text-muted-foreground">
                      {r.number}
                    </span>
                    <Mark correct={r.correct} />
                    <span className="text-sm text-foreground">
                      {r.your || <em className="text-muted-foreground">blank</em>}
                    </span>
                    {!r.correct && (
                      <span className="ml-auto text-sm text-muted-foreground">
                        Correct: <span className="text-foreground">{r.answer}</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          );
        }

        const criteria =
          section.skill === "writing" ? WRITING_CRITERIA : SPEAKING_CRITERIA;
        return (
          <section key={section.id} className="space-y-4">
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              {SKILL_LABEL[section.skill]}
            </h2>
            {(section.prompts ?? []).map((p) => (
              <div key={p.id} className="space-y-3 rounded-2xl border border-border bg-card p-5">
                <p className="text-sm text-foreground">{p.instruction}</p>
                {section.skill === "writing" ? (
                  <blockquote className="whitespace-pre-wrap rounded-lg bg-muted/50 p-4 text-sm text-foreground">
                    {submissions[p.id] || (
                      <span className="text-muted-foreground">No response</span>
                    )}
                  </blockquote>
                ) : audioUrls[p.id] ? (
                  <audio controls src={audioUrls[p.id]} className="w-full" />
                ) : (
                  <p className="text-sm text-muted-foreground">No recording</p>
                )}
                <Criteria list={criteria} />
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}
