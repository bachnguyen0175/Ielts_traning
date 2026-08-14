"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { TestSummary } from "@/lib/data/repositories";
import { importedTests } from "@/lib/data/imported-tests";
import { summarize } from "@/lib/data/local";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  HeadphonesIcon,
  BookIcon,
  PenIcon,
  MicIcon,
  ClockIcon,
  LibraryIcon,
  ArrowRightIcon,
} from "@/components/ui/icons";

const SKILLS = {
  listening: { label: "Listening", Icon: HeadphonesIcon },
  reading: { label: "Reading", Icon: BookIcon },
  writing: { label: "Writing", Icon: PenIcon },
  speaking: { label: "Speaking", Icon: MicIcon },
} as const;

function SkillChip({ skill }: { skill: string }) {
  const entry = SKILLS[skill as keyof typeof SKILLS];
  if (!entry) return null;
  const { label, Icon } = entry;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

function TestCard({ test }: { test: TestSummary }) {
  return (
    <Card className="group flex h-full flex-col transition-all duration-200 hover:border-foreground/20 hover:shadow-lg">
      <CardBody className="flex flex-1 flex-col">
        <div className="min-w-0">
          {test.source && (
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {test.source}
            </p>
          )}
          <h3 className="mt-1.5 font-serif text-lg font-semibold leading-snug tracking-tight text-foreground">
            {test.title}
          </h3>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {test.skills.map((s, i) => (
            <SkillChip key={`${s}-${i}`} skill={s} />
          ))}
        </div>

        <dl className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border/70 pt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <ClockIcon className="h-4 w-4" />
            <dt className="sr-only">Duration</dt>
            <dd>{test.durationMinutes} min</dd>
          </div>
          {test.totalQuestions > 0 && (
            <div className="flex items-center gap-1.5">
              <LibraryIcon className="h-4 w-4" />
              <dt className="sr-only">Questions</dt>
              <dd>{test.totalQuestions} questions</dd>
            </div>
          )}
          <div>
            <dt className="sr-only">Test type</dt>
            <dd className="capitalize">{test.type}</dd>
          </div>
        </dl>

        <div className="mt-6 flex-1" />

        <Button
          href={`/mock?test=${test.id}`}
          variant="accent"
          size="md"
          aria-label={`Start ${test.title}`}
          className="w-full"
        >
          Start
          <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Button>
      </CardBody>
    </Card>
  );
}

export function TestCatalog({ tests }: { tests: TestSummary[] }) {
  // `tests` is the server-rendered list. Imported tests live in localStorage,
  // which the server cannot read, so they are APPENDED on the client — the
  // first render matches the server, then the imports fill in. Subscribing
  // also picks up an import made in another tab.
  const imported = useSyncExternalStore(
    importedTests.subscribe,
    importedTests.list,
    importedTests.serverList
  );
  const all = useMemo(
    () => [...tests, ...imported.map(summarize)],
    [tests, imported]
  );

  if (all.length === 0) {
    return (
      <EmptyState icon={<LibraryIcon />} title="No tests available yet">
        Import a Reading paper written in markdown and it will show up here,
        ready to sit.
      </EmptyState>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {all.map((t, i) => (
        <div
          key={t.id}
          className="enter"
          style={{ ["--i" as string]: Math.min(i, 6) }}
        >
          <TestCard test={t} />
        </div>
      ))}
    </div>
  );
}
