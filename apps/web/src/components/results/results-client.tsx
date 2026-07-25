"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { SectionScore } from "@composed/domain";
import { contentRepo, attemptRepo } from "@/lib/data/client";
import { computeObjectiveResults } from "@/lib/scoring";
import { ResultsView } from "./results-view";

export function ResultsClient() {
  const router = useRouter();
  const params = useSearchParams();
  const attemptId = params.get("a");
  const repo = useMemo(() => attemptRepo(), []);
  const [data, setData] = useState<{
    overall: number;
    results: SectionScore[];
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      if (!attemptId) return router.replace("/");
      const attempt = repo.get(attemptId);
      const test = attempt && contentRepo.getTest(attempt.testId);
      if (!attempt || !test) return router.replace("/");

      let results = attempt.results;
      let overall = attempt.overall;
      if (!results || overall == null) {
        const computed = computeObjectiveResults(test, attempt.responses);
        results = computed.results;
        overall = computed.overall;
        repo.complete(attemptId, results, overall);
      }
      setData({ overall, results });
    });
    return () => {
      cancelled = true;
    };
  }, [attemptId, repo, router]);

  if (!attemptId || !data) {
    return (
      <p className="py-24 text-center text-muted-foreground">
        Scoring your mock…
      </p>
    );
  }

  return (
    <ResultsView
      overall={data.overall}
      results={data.results}
      attemptId={attemptId}
    />
  );
}
