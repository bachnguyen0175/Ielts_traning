"use client";

import type { Section } from "@composed/domain";
import { wordCount } from "@/lib/text";
import { cx } from "@/lib/cx";
import { QuestionRenderer } from "./question-renderer";
import { ListeningAudio } from "./listening-audio";
import { HighlightablePassage } from "./highlightable-passage";
import { SpeakingRecorder } from "./speaking-recorder";

export function SectionView({
  section,
  responses,
  onAnswer,
  submissions,
  onSubmission,
  audioUrls,
  onRecorded,
}: {
  section: Section;
  responses: Record<number, string>;
  onAnswer: (n: number, v: string) => void;
  submissions: Record<string, string>;
  onSubmission: (promptId: string, text: string) => void;
  audioUrls: Record<string, string>;
  onRecorded: (promptId: string, url: string, seconds: number) => void;
}) {
  const groups = (section.passages ?? []).flatMap((p) => p.questionGroups);

  const questions = (
    <div className="space-y-6">
      {groups.map((g) => (
        <section
          key={g.id}
          className="rounded-2xl border border-border bg-card/50 p-5 backdrop-blur-sm sm:p-6"
        >
          <div className="mb-4 flex items-baseline gap-3 border-b border-border/70 pb-3">
            <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-semibold tabular-nums text-muted-foreground">
              {g.range[0]}–{g.range[1]}
            </span>
            <p className="text-sm font-medium leading-relaxed text-foreground">
              {g.instruction}
            </p>
          </div>
          <QuestionRenderer
            group={g}
            responses={responses}
            onAnswer={onAnswer}
          />
        </section>
      ))}
    </div>
  );

  if (section.skill === "listening") {
    return (
      <div className="mx-auto max-w-3xl space-y-7">
        {section.audioSrc && <ListeningAudio src={section.audioSrc} />}
        {(section.passages ?? []).map((p) => (
          <p
            key={p.id}
            className="font-serif text-lg font-semibold tracking-tight text-foreground"
          >
            {p.title}
          </p>
        ))}
        {questions}
      </div>
    );
  }

  if (section.skill === "reading") {
    return (
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        {/* The passage stays put while the questions scroll beside it — the
            paper equivalent of keeping a finger on the page. */}
        <div className="space-y-5 lg:sticky lg:top-44 lg:max-h-[calc(100dvh-13rem)] lg:overflow-y-auto lg:pr-4">
          {(section.passages ?? []).map((p) => (
            <HighlightablePassage key={p.id} title={p.title} body={p.body} />
          ))}
          <p className="text-xs text-muted-foreground">
            Tip: select text in the passage to highlight it.
          </p>
        </div>
        {questions}
      </div>
    );
  }

  if (section.skill === "writing") {
    return (
      <div className="mx-auto max-w-3xl space-y-8">
        {(section.prompts ?? []).map((prompt) => {
          const text = submissions[prompt.id] ?? "";
          const count = wordCount(text);
          const target = prompt.targetWords ?? 0;
          const under = target > 0 && count < target;
          const pct = target > 0 ? Math.min(100, (count / target) * 100) : 0;
          return (
            <div
              key={prompt.id}
              className="rounded-2xl border border-border bg-card/50 p-5 backdrop-blur-sm sm:p-6"
            >
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {prompt.taskType}
              </p>
              <p className="mt-2.5 leading-relaxed text-foreground">
                {prompt.instruction}
              </p>
              <textarea
                aria-label={`Response for ${prompt.taskType}`}
                value={text}
                onChange={(e) => onSubmission(prompt.id, e.target.value)}
                rows={12}
                className="mt-4 w-full resize-y rounded-xl border border-border bg-background/60 p-4 leading-relaxed text-foreground outline-none transition-colors duration-200 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                placeholder="Write your response…"
              />

              <div className="mt-3 flex items-center gap-4">
                {target > 0 && (
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cx(
                        "h-full rounded-full transition-[width] duration-300 ease-out",
                        under ? "bg-muted-foreground/50" : "bg-accent",
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
                <p
                  data-testid="wordcount"
                  className={cx(
                    "shrink-0 text-sm tabular-nums",
                    under ? "text-muted-foreground" : "text-foreground",
                  )}
                >
                  <span className="font-semibold">{count}</span> words
                  {target > 0 && ` · target ${target}`}
                  {under && (
                    <span className="ml-1 text-muted-foreground">
                      (under length)
                    </span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // speaking
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {(section.prompts ?? []).map((prompt) => (
        <div
          key={prompt.id}
          className="rounded-2xl border border-border bg-card/50 p-5 backdrop-blur-sm sm:p-6"
        >
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {prompt.taskType}
          </p>
          <p className="mt-2.5 leading-relaxed text-foreground">
            {prompt.instruction}
          </p>
          <div className="mt-5">
            <SpeakingRecorder
              existingUrl={audioUrls[prompt.id]}
              onRecorded={(url, seconds) => onRecorded(prompt.id, url, seconds)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
