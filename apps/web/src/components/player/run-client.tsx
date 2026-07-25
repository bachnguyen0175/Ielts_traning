"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Test } from "@composed/domain";
import { contentRepo, attemptRepo } from "@/lib/data/client";
import { Player } from "./player";

interface PlayerState {
  test: Test;
  sectionIndex: number;
  sectionStartedAt: number;
  responses: Record<number, string>;
  flagged: number[];
  submissions: Record<string, string>;
  audioUrls: Record<string, string>;
}

function submissionsMap(list: { promptId: string; textContent?: string }[]) {
  const map: Record<string, string> = {};
  for (const s of list) if (s.textContent != null) map[s.promptId] = s.textContent;
  return map;
}

function audioMap(list: { promptId: string; audioUrl?: string }[]) {
  const map: Record<string, string> = {};
  for (const s of list) if (s.audioUrl != null) map[s.promptId] = s.audioUrl;
  return map;
}

export function RunClient() {
  const router = useRouter();
  const params = useSearchParams();
  const attemptId = params.get("a");
  const repo = useMemo(() => attemptRepo(), []);
  const [state, setState] = useState<PlayerState | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Load from client storage in a microtask (avoids synchronous setState in
    // the effect body) and start the current section's clock.
    Promise.resolve().then(() => {
      if (cancelled) return;
      if (!attemptId) return router.replace("/mock");
      const attempt = repo.get(attemptId);
      const test = attempt && contentRepo.getTest(attempt.testId);
      if (!attempt || !test) return router.replace("/mock");

      const section = test.sections[attempt.currentSectionIndex];
      repo.startSection(attemptId, section.id);
      const fresh = repo.get(attemptId);
      if (!fresh) return;
      setState({
        test,
        sectionIndex: fresh.currentSectionIndex,
        sectionStartedAt: fresh.sectionStartedAt[section.id],
        responses: fresh.responses,
        flagged: fresh.flagged,
        submissions: submissionsMap(fresh.submissions),
        audioUrls: audioMap(fresh.submissions),
      });
    });
    return () => {
      cancelled = true;
    };
  }, [attemptId, repo, router]);

  if (!attemptId || !state) {
    return (
      <main className="grid min-h-dvh place-items-center">
        <p className="text-muted-foreground">Loading your mock…</p>
      </main>
    );
  }

  const id = attemptId;

  return (
    <Player
      test={state.test}
      sectionIndex={state.sectionIndex}
      sectionStartedAt={state.sectionStartedAt}
      responses={state.responses}
      flagged={state.flagged}
      submissions={state.submissions}
      onAnswer={(n, v) => {
        repo.saveResponse(id, n, v);
        setState((s) => (s ? { ...s, responses: { ...s.responses, [n]: v } } : s));
      }}
      onToggleFlag={(n) => {
        repo.toggleFlag(id, n);
        setState((s) => {
          if (!s) return s;
          const flagged = s.flagged.includes(n)
            ? s.flagged.filter((x) => x !== n)
            : [...s.flagged, n];
          return { ...s, flagged };
        });
      }}
      onSubmission={(promptId, text) => {
        repo.saveSubmission(id, {
          promptId,
          kind: "writing_text",
          textContent: text,
        });
        setState((s) =>
          s ? { ...s, submissions: { ...s.submissions, [promptId]: text } } : s
        );
      }}
      onAdvance={() => {
        repo.advanceSection(id);
        const a = repo.get(id);
        if (!a) return;
        const section = state.test.sections[a.currentSectionIndex];
        repo.startSection(id, section.id);
        const fresh = repo.get(id);
        if (!fresh) return;
        setState((s) =>
          s
            ? {
                ...s,
                sectionIndex: fresh.currentSectionIndex,
                sectionStartedAt: fresh.sectionStartedAt[section.id],
              }
            : s
        );
      }}
      onRecorded={(promptId, url, seconds) => {
        repo.saveSubmission(id, {
          promptId,
          kind: "speaking_audio",
          audioUrl: url,
          durationSeconds: seconds,
        });
        setState((s) =>
          s ? { ...s, audioUrls: { ...s.audioUrls, [promptId]: url } } : s
        );
      }}
      onFinish={() => {
        router.push(`/mock/results?a=${id}`);
      }}
    />
  );
}
