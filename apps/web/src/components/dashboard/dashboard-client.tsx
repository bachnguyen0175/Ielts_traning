"use client";

import { useEffect, useState } from "react";
import type { Attempt } from "@composed/domain";
import { attemptRepo } from "@/lib/data/client";
import { profileStore } from "@/lib/data/profile-store";
import { vocabStore } from "@/lib/data/vocab-store";
import { pullAttempts } from "@/lib/actions/db-actions";
import { DashboardView } from "./dashboard-view";

export function DashboardClient({ userId }: { userId: string | null }) {
  const [state, setState] = useState<{
    attempts: Attempt[];
    targetBand?: number;
    testDate?: string;
    vocabDue: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Signed-in → Neon via server actions; guest → localStorage.
      const attempts = userId ? await pullAttempts() : attemptRepo().list();
      const profile = await profileStore(userId).get();
      const vocab = await vocabStore(userId).list();
      const now = Date.now();
      const vocabDue = vocab.filter((v) => v.dueAt <= now).length;
      if (!cancelled) {
        setState({
          attempts,
          targetBand: profile?.targetBand,
          testDate: profile?.testDate,
          vocabDue,
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (!state) {
    return <p className="py-24 text-center text-muted-foreground">Loading…</p>;
  }

  return (
    <DashboardView
      attempts={state.attempts}
      targetBand={state.targetBand}
      testDate={state.testDate}
      vocabDue={state.vocabDue}
    />
  );
}
