"use client";

import { useEffect, useState } from "react";
import type { Attempt } from "@composed/domain";
import { attemptRepo, profileRepo } from "@/lib/data/client";
import { pullAttempts, pullProfile } from "@/lib/actions/db-actions";
import { ProgressView } from "./progress-view";

export function ProgressClient({ userId }: { userId: string | null }) {
  const [state, setState] = useState<{
    attempts: Attempt[];
    targetBand?: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Signed-in → cross-device history from Neon; guest → localStorage.
      const [attempts, targetBand] = userId
        ? [await pullAttempts(), (await pullProfile())?.targetBand]
        : [attemptRepo().list(), profileRepo().get()?.targetBand];
      if (!cancelled) setState({ attempts, targetBand });
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (!state) {
    return <p className="py-24 text-center text-muted-foreground">Loading…</p>;
  }

  return (
    <ProgressView attempts={state.attempts} targetBand={state.targetBand} />
  );
}
