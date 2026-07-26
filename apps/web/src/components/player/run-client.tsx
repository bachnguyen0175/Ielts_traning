"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Test } from "@composed/domain";
import { contentRepo, attemptRepo } from "@/lib/data/client";
import { pullAttempt, pushAttempt } from "@/lib/actions/db-actions";
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

export function RunClient({ userId }: { userId: string | null }) {
  const router = useRouter();
  const params = useSearchParams();
  const attemptId = params.get("a");
  const repo = useMemo(() => attemptRepo(), []);
  const [state, setState] = useState<PlayerState | null>(null);

  // Debounced write-through to Neon for signed-in users (real-time cross-device
  // sync). The player keeps writing localStorage instantly; this mirrors it.
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function scheduleSync(id: string) {
    if (!userId) return;
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      const a = repo.get(id);
      if (a) void pushAttempt(a).catch(() => {});
    }, 1500);
  }
  function flushSync(id: string) {
    if (!userId) return;
    if (syncTimer.current) clearTimeout(syncTimer.current);
    const a = repo.get(id);
    if (a) void pushAttempt(a).catch(() => {});
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!attemptId) return router.replace("/mock");
      // Resume: hydrate localStorage from the DB copy if signed in (cross-device).
      if (userId) {
        const dbAttempt = await pullAttempt(attemptId).catch(() => null);
        if (dbAttempt && !cancelled) repo.put(dbAttempt);
      }
      if (cancelled) return;

      const attempt = repo.get(attemptId);
      const test = attempt && contentRepo.getTest(attempt.testId);
      if (!attempt || !test) return router.replace("/mock");

      const section = test.sections[attempt.currentSectionIndex];
      repo.startSection(attemptId, section.id);
      const fresh = repo.get(attemptId);
      if (!fresh || cancelled) return;
      setState({
        test,
        sectionIndex: fresh.currentSectionIndex,
        sectionStartedAt: fresh.sectionStartedAt[section.id],
        responses: fresh.responses,
        flagged: fresh.flagged,
        submissions: submissionsMap(fresh.submissions),
        audioUrls: audioMap(fresh.submissions),
      });
      scheduleSync(attemptId); // persist the started-section timestamp
    })();
    return () => {
      cancelled = true;
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId, repo, router, userId]);

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
        scheduleSync(id);
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
        scheduleSync(id);
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
        scheduleSync(id);
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
        flushSync(id); // section boundary — persist immediately
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
        scheduleSync(id);
      }}
      onFinish={() => {
        flushSync(id);
        router.push(`/mock/results?a=${id}`);
      }}
    />
  );
}
