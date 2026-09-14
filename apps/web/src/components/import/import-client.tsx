"use client";

import { useEffect, useState } from "react";
import type { Test } from "@composed/domain";
import {
  parseExamMarkdown,
  type Diagnostic,
} from "@/lib/content/parse-exam-md";
import { importedTests } from "@/lib/data/imported-tests";
import { amIAdmin, publishTest } from "@/lib/actions/db-actions";
import { Button } from "@/components/ui/button";
import { Card, CardBody, Eyebrow } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { cx } from "@/lib/cx";
import {
  UploadIcon,
  FileIcon,
  AlertIcon,
  InfoIcon,
  CheckIcon,
} from "@/components/ui/icons";

interface Parsed {
  test: Test | null;
  diagnostics: Diagnostic[];
  fileName: string;
}

export function ImportClient() {
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [saved, setSaved] = useState<Test[]>([]);
  // Whether THIS user may publish. Decided server-side from the Clerk session;
  // the button's absence is a courtesy, not the guard — publishTest re-checks.
  const [isAdmin, setIsAdmin] = useState(false);
  const [publishState, setPublishState] = useState<
    "idle" | "publishing" | "done" | "failed"
  >("idle");

  useEffect(() => {
    void amIAdmin()
      .then(setIsAdmin)
      .catch(() => setIsAdmin(false));
  }, []);
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

  async function publish() {
    if (!parsed?.test) return;
    setPublishState("publishing");
    const ok = await publishTest(parsed.test).catch(() => false);
    setPublishState(ok ? "done" : "failed");
    if (ok) setParsed(null);
  }

  function remove(id: string) {
    setSaved(importedTests.remove(id));
  }

  const errors = parsed?.diagnostics.filter((d) => d.severity === "error") ?? [];
  const warnings =
    parsed?.diagnostics.filter((d) => d.severity === "warning") ?? [];

  return (
    <div className="space-y-10">
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
        className={cx(
          "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center",
          "transition-colors duration-200",
          // The real <input> is visually hidden, so the ring has to live here
          // or keyboard users get no focus indicator at all.
          "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
          dragging
            ? "border-accent bg-accent/10"
            : "border-border bg-card/40 hover:border-foreground/30 hover:bg-card/70",
        )}
      >
        <input
          type="file"
          accept=".md,.markdown,.txt"
          className="sr-only"
          onChange={(e) => void handleFiles(e.target.files)}
        />
        <span
          className={cx(
            "grid h-14 w-14 place-items-center rounded-2xl transition-colors duration-200",
            dragging ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground",
          )}
        >
          <UploadIcon className="h-6 w-6" />
        </span>
        <span className="mt-4 font-serif text-lg font-semibold tracking-tight text-foreground">
          {dragging ? "Drop it here" : "Drop a reading paper, or click to choose"}
        </span>
        <span className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
          Markdown with <code className="rounded bg-muted px-1 py-0.5 text-xs">READING PASSAGE n</code>{" "}
          headings, <code className="rounded bg-muted px-1 py-0.5 text-xs">Questions n-m</code>{" "}
          blocks, and an answer key.
        </span>
      </label>

      {parsed && (
        <Card tone={errors.length > 0 ? "notice" : "raised"}>
          <CardBody>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
                <FileIcon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <Eyebrow>{parsed.fileName}</Eyebrow>
                <h2 className="mt-1 font-serif text-xl font-semibold tracking-tight text-foreground">
                  {parsed.test?.title ?? "Could not read this paper"}
                </h2>
              </div>
              {parsed.test && (
                <Badge tone="good" className="shrink-0">
                  <CheckIcon className="h-3 w-3" />
                  Parsed
                </Badge>
              )}
            </div>

            {errors.length > 0 && (
              <DiagnosticList
                tone="error"
                title={`${errors.length} problem${errors.length === 1 ? "" : "s"} — nothing was imported`}
                items={errors}
              />
            )}

            {parsed.test && (
              <>
                <Summary test={parsed.test} />

                {warnings.length > 0 && (
                  <DiagnosticList
                    tone="warning"
                    title={`${warnings.length} thing${warnings.length === 1 ? "" : "s"} to check`}
                    items={warnings}
                  />
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button onClick={save} variant="accent">
                    Save to this browser
                  </Button>
                  {isAdmin && (
                    <Button
                      onClick={() => void publish()}
                      variant="outline"
                      disabled={publishState === "publishing"}
                    >
                      {publishState === "publishing"
                        ? "Publishing…"
                        : "Publish to everyone"}
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => setParsed(null)}>
                    Discard
                  </Button>
                </div>
                {isAdmin && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Publishing puts this paper in the shared library, where
                    every signed-in user can sit it.
                  </p>
                )}
                {publishState === "failed" && (
                  <p className="mt-3 text-xs text-rose-500">
                    Could not publish. You may no longer have permission.
                  </p>
                )}
              </>
            )}
          </CardBody>
        </Card>
      )}

      <section>
        <h2 className="font-serif text-xl font-semibold tracking-tight text-foreground">
          Imported tests
        </h2>
        {saved.length === 0 ? (
          <EmptyState
            className="mt-4"
            icon={<FileIcon />}
            title="Nothing imported yet"
          >
            Papers you import appear here and in your test library, ready to sit.
          </EmptyState>
        ) : (
          <ul className="mt-4 space-y-3">
            {saved.map((t) => (
              <li key={t.id}>
                <Card>
                  <CardBody className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">
                        {t.title}
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {questionCount(t)} questions · stored in this browser only
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button href={`/mock?test=${t.id}`} variant="outline">
                        Sit
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => remove(t.id)}
                        aria-label={`Remove ${t.title}`}
                      >
                        Remove
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function DiagnosticList({
  tone,
  title,
  items,
}: {
  tone: "error" | "warning";
  title: string;
  items: Diagnostic[];
}) {
  const isError = tone === "error";
  return (
    <div
      className={cx(
        "mt-5 rounded-xl border p-4",
        isError
          ? "border-rose-500/25 bg-rose-500/[0.07]"
          : "border-border bg-muted/40",
      )}
    >
      <p
        className={cx(
          "flex items-center gap-2 text-sm font-medium",
          isError ? "text-rose-800 dark:text-rose-300" : "text-foreground",
        )}
      >
        {isError ? (
          <AlertIcon className="h-4 w-4" />
        ) : (
          <InfoIcon className="h-4 w-4" />
        )}
        {title}
      </p>
      <ul className="mt-2.5 space-y-1.5 text-sm text-muted-foreground">
        {items.map((d, i) => (
          <li key={i} className="flex gap-2">
            <span className="shrink-0 tabular-nums opacity-60">
              line {d.line}
            </span>
            <span>{d.message}</span>
          </li>
        ))}
      </ul>
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
    <div className="mt-5">
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
        <span>
          <span className="font-medium text-foreground">{passages.length}</span>{" "}
          passages
        </span>
        <span>
          <span className="font-medium text-foreground">
            {questionCount(test)}
          </span>{" "}
          questions
        </span>
        <span>
          <span className="font-medium text-foreground">
            {Math.round(test.sections[0].durationSeconds / 60)}
          </span>{" "}
          minutes
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        {passages.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-border/70 bg-background/40 p-4"
          >
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
    </div>
  );
}
