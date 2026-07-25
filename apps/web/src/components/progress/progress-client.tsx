"use client";

import { useEffect, useMemo, useState } from "react";
import type { Attempt } from "@composed/domain";
import { attemptRepo, profileRepo } from "@/lib/data/client";
import { ProgressView } from "./progress-view";

export function ProgressClient() {
  const repo = useMemo(() => attemptRepo(), []);
  const [state, setState] = useState<{
    attempts: Attempt[];
    targetBand?: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      const attempts = repo.list();
      const profile = profileRepo().get();
      setState({ attempts, targetBand: profile?.targetBand });
    });
    return () => {
      cancelled = true;
    };
  }, [repo]);

  if (!state) {
    return <p className="py-24 text-center text-muted-foreground">Loading…</p>;
  }

  return (
    <ProgressView attempts={state.attempts} targetBand={state.targetBand} />
  );
}
