"use client";

import type { Section } from "@composed/domain";
import { wordCount } from "@/lib/text";
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
    <div className="space-y-8">
      {groups.map((g) => (
        <section key={g.id} className="space-y-4">
          <p className="text-sm font-medium text-foreground">{g.instruction}</p>
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
      <div className="mx-auto max-w-3xl space-y-8">
        {section.audioSrc && <ListeningAudio src={section.audioSrc} />}
        {(section.passages ?? []).map((p) => (
          <p key={p.id} className="text-sm text-muted-foreground">
            {p.title}
          </p>
        ))}
        {questions}
      </div>
    );
  }

  if (section.skill === "reading") {
    return (
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-6">
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
      <div className="mx-auto max-w-2xl space-y-10">
        {(section.prompts ?? []).map((prompt) => {
          const text = submissions[prompt.id] ?? "";
          const count = wordCount(text);
          const target = prompt.targetWords ?? 0;
          const under = target > 0 && count < target;
          return (
            <div key={prompt.id} className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {prompt.taskType}
              </p>
              <p className="leading-relaxed text-foreground">
                {prompt.instruction}
              </p>
              <textarea
                aria-label={`Response for ${prompt.taskType}`}
                value={text}
                onChange={(e) => onSubmission(prompt.id, e.target.value)}
                rows={8}
                className="w-full rounded-xl border border-border bg-card p-4 text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                placeholder="Write your response…"
              />
              <p
                data-testid="wordcount"
                className={[
                  "text-sm tabular-nums",
                  under ? "text-muted-foreground" : "text-foreground",
                ].join(" ")}
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
          );
        })}
      </div>
    );
  }

  // speaking
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {(section.prompts ?? []).map((prompt) => (
        <div
          key={prompt.id}
          className="space-y-4 rounded-xl border border-border bg-card p-5"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {prompt.taskType}
          </p>
          <p className="leading-relaxed text-foreground">{prompt.instruction}</p>
          <SpeakingRecorder
            existingUrl={audioUrls[prompt.id]}
            onRecorded={(url, seconds) => onRecorded(prompt.id, url, seconds)}
          />
        </div>
      ))}
    </div>
  );
}
