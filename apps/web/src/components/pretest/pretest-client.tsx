"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { contentRepo, attemptRepo } from "@/lib/data/client";
import { publishedTests } from "@/lib/data/published-tests";
import { loadPublishedTests } from "@/lib/data/published-tests-loader";
import { Pretest } from "./pretest";

const DEFAULT_TEST_ID = "sample-academic-1";

export function PretestClient() {
  const router = useRouter();
  const params = useSearchParams();
  const testId = params.get("test") ?? DEFAULT_TEST_ID;
  // Re-render once the published tests arrive; until they have, "missing" and
  // "still loading" are the same empty result and the screen would wrongly
  // report a published test as not found.
  useEffect(() => {
    void loadPublishedTests();
  }, []);
  const ready = useSyncExternalStore(
    publishedTests.subscribe,
    publishedTests.ready,
    () => false,
  );
  const test = contentRepo.getTest(testId);

  if (!test && !ready) {
    return (
      <p className="py-16 text-center text-muted-foreground">Loading…</p>
    );
  }

  if (!test) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        That test could not be found.
      </p>
    );
  }

  const totalMin = Math.round(
    test.sections.reduce((s, x) => s + x.durationSeconds, 0) / 60
  );

  function start() {
    const attempt = attemptRepo().create(testId);
    router.push(`/mock/run?a=${attempt.id}`);
  }

  return (
    <Pretest
      testTitle={test.title}
      durationLabel={`about ${totalMin} minutes`}
      onStart={start}
    />
  );
}
