"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import type { TestSummary } from "@/lib/data/repositories";
import { importedTests } from "@/lib/data/imported-tests";
import { publishedTests } from "@/lib/data/published-tests";
import { loadPublishedTests } from "@/lib/data/published-tests-loader";
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

function TestCard({ test, label }: { test: TestSummary; label: string }) {
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
            {label}
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

type CatalogGroup = {
  heading: string;
  tests: { test: TestSummary; label: string }[];
};

/**
 * A paper's title usually names the book first and the paper inside it second
 * — "Cambridge IELTS 15 - Reading Test 1". Split on that first dash so the book
 * can head its own group and each card prints only what sets it apart. A title
 * with no dash has no book to belong to, so it heads a group alone.
 */
const SERIES = /^(.+?)\s+[-\u2013\u2014]\s+(.+)$/;

export function groupBySeries(tests: TestSummary[]): CatalogGroup[] {
  const groups: CatalogGroup[] = [];
  for (const test of tests) {
    const m = SERIES.exec(test.title);
    const heading = m ? m[1] : test.title;
    const entry = { test, label: m ? m[2] : test.title };
    // First appearance fixes the order, so groups keep the order the tests
    // arrived in: built-ins, then the shared library, then this browser's.
    const existing = groups.find((g) => g.heading === heading);
    if (existing) existing.tests.push(entry);
    else groups.push({ heading, tests: [entry] });
  }
  return groups;
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
  // Published tests are fetched, so they arrive the same way: after the first
  // render. They come before the browser's own imports — they are the shared
  // library, not this machine's scratch copies.
  useEffect(() => {
    void loadPublishedTests();
  }, []);
  const published = useSyncExternalStore(
    publishedTests.subscribe,
    publishedTests.list,
    publishedTests.serverList
  );
  const all = useMemo(
    () => [...tests, ...published.map(summarize), ...imported.map(summarize)],
    [tests, published, imported]
  );

  const groups = useMemo(() => groupBySeries(all), [all]);

  if (all.length === 0) {
    return (
      <EmptyState icon={<LibraryIcon />} title="No tests available yet">
        Import a Reading paper written in markdown and it will show up here,
        ready to sit.
      </EmptyState>
    );
  }

  return (
    <div className="space-y-10">
      {groups.map((group, gi) => {
        // The stagger runs across the whole page, not restarted per group.
        const offset = groups
          .slice(0, gi)
          .reduce((n, g) => n + g.tests.length, 0);
        // Indexed, not slugified: the id is never seen, and slugifying two
        // headings that differ only in punctuation collides.
        const headingId = `catalog-group-${gi}`;
        return (
          <section key={group.heading} aria-labelledby={headingId}>
            {/* The count sits beside the heading, not inside it — inside, it
                runs onto the end of the accessible name ("Cambridge 151
                paper"). */}
            <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2
                id={headingId}
                className="font-serif text-xl font-semibold tracking-tight text-foreground"
              >
                {group.heading}
              </h2>
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {group.tests.length}{" "}
                {group.tests.length === 1 ? "paper" : "papers"}
              </span>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {group.tests.map(({ test, label }, i) => (
                <div
                  key={test.id}
                  className="enter"
                  style={{ ["--i" as string]: Math.min(offset + i, 6) }}
                >
                  <TestCard test={test} label={label} />
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
