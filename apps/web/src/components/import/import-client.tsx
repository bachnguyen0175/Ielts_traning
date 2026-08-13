"use client";

import { useState } from "react";
import type { Test } from "@composed/domain";
import {
  parseExamMarkdown,
  type Diagnostic,
} from "@/lib/content/parse-exam-md";
import { importedTests } from "@/lib/data/imported-tests";
import { Button } from "@/components/ui/button";

interface Parsed {
  test: Test | null;
  diagnostics: Diagnostic[];
  fileName: string;
}

export function ImportClient() {
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [saved, setSaved] = useState<Test[]>([]);
  const [dragging, setDragging] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Read existing imports once on the client — localStorage is unavailable
  // during SSR, so this cannot happen in the initial render.
  if (!hydrated && typeof window !== "undefined") {
    setHydrated(true);
    setSaved(importedTests.list());
  }

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    const text = await file.text();
    setParsed({ ...parseExamMarkdown(text), fileName: file.name });
  }

  function save() {
    if (!parsed?.test) return;
    setSaved(importedTests.save(parsed.test));
    setParsed(null);
  }

  function remove(id: string) {
    setSaved(importedTests.remove(id));
  }

  const errors = parsed?.diagnostics.filter((d) => d.severity === "error") ?? [];
  const warnings =
    parsed?.diagnostics.filter((d) => d.severity === "warning") ?? [];

  return (
    <div className="space-y-8">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${
          dragging
            ? "border-foreground/40 bg-card"
            : "border-border bg-card/50 hover:border-foreground/30"
        }`}
      >
        <input
          type="file"
          accept=".md,.markdown,.txt"
          className="sr-only"
          onChange={(e) => void handleFiles(e.target.files)}
        />
        <p className="font-medium text-foreground">
          Drop a reading paper, or click to choose
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Markdown with <code>READING PASSAGE n</code> headings,{" "}
          <code>Questions n-m</code> blocks, and an answer key
        </p>
      </label>

      {parsed && (
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-serif text-xl font-semibold text-foreground">
            {parsed.test?.title ?? parsed.fileName}
          </h2>

          {errors.length > 0 && (
            <ul className="mt-4 space-y-1 text-sm">
              {errors.map((d, i) => (
                <li key={i} className="text-red-600 dark:text-red-400">
                  <span className="opacity-60">line {d.line}</span> — {d.message}
                </li>
              ))}
            </ul>
          )}

          {parsed.test && (
            <>
              <Summary test={parsed.test} />
              {warnings.length > 0 && (
                <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
                  {warnings.map((d, i) => (
                    <li key={i}>
                      <span className="opacity-60">line {d.line}</span> —{" "}
                      {d.message}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-6 flex gap-3">
                <Button onClick={save}>Save to this browser</Button>
                <Button variant="outline" onClick={() => setParsed(null)}>
                  Discard
                </Button>
              </div>
            </>
          )}
        </section>
      )}

      <section>
        <h2 className="font-serif text-xl font-semibold text-foreground">
          Imported tests
        </h2>
        {saved.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-muted-foreground">
            Nothing imported yet.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {saved.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {t.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {questionCount(t)} questions · stored in this browser only
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button href={`/mock?test=${t.id}`} variant="outline">
                    Sit
                  </Button>
                  <Button variant="ghost" onClick={() => remove(t.id)}>
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function questionCount(test: Test): number {
  return test.sections
    .flatMap((s) => s.passages ?? [])
    .flatMap((p) => p.questionGroups)
    .reduce((n, g) => n + g.questions.length, 0);
}

function Summary({ test }: { test: Test }) {
  const passages = test.sections.flatMap((s) => s.passages ?? []);
  return (
    <div className="mt-4 space-y-3">
      <p className="text-sm text-muted-foreground">
        {passages.length} passages · {questionCount(test)} questions ·{" "}
        {Math.round(test.sections[0].durationSeconds / 60)} minutes
      </p>
      {passages.map((p) => (
        <div key={p.id} className="rounded-xl border border-border/70 p-4">
          <p className="font-medium text-foreground">{p.title}</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {p.questionGroups.map((g) => (
              <li key={g.id}>
                <span className="tabular-nums">
                  {g.range[0]}–{g.range[1]}
                </span>{" "}
                · {g.type.replace(/_/g, " ")}
                {g.sharedOptions ? ` · ${g.sharedOptions.length} options` : ""}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
