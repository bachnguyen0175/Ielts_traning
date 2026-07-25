"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Test } from "@composed/domain";
import { contentRepo, attemptRepo } from "@/lib/data/client";
import { ReviewView } from "./review-view";
import { VocabCapture } from "@/components/vocab/vocab-capture";

interface Loaded {
  test: Test;
  responses: Record<number, string>;
  submissions: Record<string, string>;
  audioUrls: Record<string, string>;
}

export function ReviewClient() {
  const router = useRouter();
  const params = useSearchParams();
  const attemptId = params.get("a");
  const repo = useMemo(() => attemptRepo(), []);
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      if (!attemptId) return router.replace("/");
      const attempt = repo.get(attemptId);
      const test = attempt && contentRepo.getTest(attempt.testId);
      if (!attempt || !test) return router.replace("/");
      const submissions: Record<string, string> = {};
      const audioUrls: Record<string, string> = {};
      for (const s of attempt.submissions) {
        if (s.textContent != null) submissions[s.promptId] = s.textContent;
        if (s.audioUrl != null) audioUrls[s.promptId] = s.audioUrl;
      }
      setLoaded({ test, responses: attempt.responses, submissions, audioUrls });
    });
    return () => {
      cancelled = true;
    };
  }, [attemptId, repo, router]);

  if (!loaded) {
    return (
      <p className="py-24 text-center text-muted-foreground">Loading review…</p>
    );
  }

  return (
    <div className="space-y-10">
      <ReviewView
        test={loaded.test}
        responses={loaded.responses}
        submissions={loaded.submissions}
        audioUrls={loaded.audioUrls}
      />
      <VocabCapture source={loaded.test.title} />
    </div>
  );
}
