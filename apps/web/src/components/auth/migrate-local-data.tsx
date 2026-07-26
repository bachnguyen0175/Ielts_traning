"use client";

import { useEffect } from "react";
import { attemptRepo, profileRepo, vocabRepo } from "@/lib/data/client";
import {
  pushAttempt,
  pushProfile,
  pushVocabAdd,
} from "@/lib/actions/db-actions";

/**
 * One-time guest→account migration. On first load while signed in, pushes any
 * localStorage progress (profile, attempts, saved vocab) into the user's DB,
 * then flags it done per-user so it never re-runs. Renders nothing.
 * Idempotent by design: attempts upsert by id; the flag guards vocab dupes.
 */
export function MigrateLocalData({ userId }: { userId: string }) {
  useEffect(() => {
    const key = `composed.migrated.${userId}`;
    if (localStorage.getItem(key)) return;
    (async () => {
      try {
        const profile = profileRepo().get();
        if (profile && (profile.targetBand != null || profile.testDate)) {
          await pushProfile(profile);
        }
        for (const a of attemptRepo().list()) await pushAttempt(a);
        for (const v of vocabRepo().list()) await pushVocabAdd(v);
        localStorage.setItem(key, "1");
      } catch {
        // best-effort; will retry on next signed-in load
      }
    })();
  }, [userId]);

  return null;
}
