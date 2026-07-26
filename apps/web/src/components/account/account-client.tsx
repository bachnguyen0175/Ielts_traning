"use client";

import { useEffect, useMemo, useState } from "react";
import type { Profile } from "@/lib/data/repositories";
import { profileStore } from "@/lib/data/profile-store";
import { Button } from "@/components/ui/button";

const BANDS = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];

const fieldClass =
  "w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground " +
  "shadow-sm outline-none transition-colors focus-visible:border-ring " +
  "focus-visible:ring-2 focus-visible:ring-ring/40";

export function AccountClient({ userId }: { userId: string | null }) {
  const store = useMemo(() => profileStore(userId), [userId]);
  const [loaded, setLoaded] = useState(false);
  const [band, setBand] = useState("");
  const [date, setDate] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    store.get().then((p) => {
      if (cancelled) return;
      setBand(p?.targetBand != null ? String(p.targetBand) : "");
      setDate(p?.testDate ?? "");
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [store]);

  if (!loaded) {
    return <p className="py-24 text-center text-muted-foreground">Loading…</p>;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const profile: Profile = {};
    if (band) profile.targetBand = Number(band);
    if (date) profile.testDate = date;
    await store.save(profile);
    setSaved(true);
  }

  return (
    <form onSubmit={save} className="space-y-6" noValidate>
      <p className="text-sm text-muted-foreground">
        {userId
          ? "Synced to your account across devices."
          : "Saved on this device. Sign in to sync across devices."}
      </p>

      <div className="space-y-2">
        <label
          htmlFor="target-band"
          className="block text-sm font-medium text-foreground"
        >
          Target band
        </label>
        <select
          id="target-band"
          value={band}
          onChange={(e) => {
            setBand(e.target.value);
            setSaved(false);
          }}
          className={fieldClass}
        >
          <option value="">Not sure yet</option>
          {BANDS.map((b) => (
            <option key={b} value={String(b)}>
              {b.toFixed(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="test-date"
          className="block text-sm font-medium text-foreground"
        >
          Test date
        </label>
        <input
          id="test-date"
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setSaved(false);
          }}
          className={fieldClass}
        />
      </div>

      <div className="flex items-center gap-4 pt-2">
        <Button type="submit" variant="accent" size="lg">
          Save changes
        </Button>
        {saved && (
          <span role="status" className="text-sm font-medium text-accent">
            Saved
          </span>
        )}
      </div>
    </form>
  );
}
