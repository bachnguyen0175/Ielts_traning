"use client";

import { useState } from "react";
import type { Profile } from "@/lib/data/repositories";
import { Button } from "@/components/ui/button";

const BANDS = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];

const fieldClass =
  "w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground " +
  "shadow-sm outline-none transition-colors focus-visible:border-ring " +
  "focus-visible:ring-2 focus-visible:ring-ring/40";

export function OnboardingForm({
  onStart,
}: {
  onStart: (profile: Profile | null) => void;
}) {
  const [band, setBand] = useState("");
  const [date, setDate] = useState("");

  function start() {
    const profile: Profile = {};
    if (band) profile.targetBand = Number(band);
    if (date) profile.testDate = date;
    onStart(profile);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start();
      }}
      className="space-y-6"
      noValidate
    >
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
          onChange={(e) => setBand(e.target.value)}
          className={fieldClass}
        >
          <option value="">Not sure yet</option>
          {BANDS.map((b) => (
            <option key={b} value={String(b)}>
              {b.toFixed(1)}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          We&rsquo;ll use this to track your progress. Optional.
        </p>
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
          onChange={(e) => setDate(e.target.value)}
          className={fieldClass}
        />
        <p className="text-xs text-muted-foreground">
          When are you sitting the real exam? Optional.
        </p>
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
        <Button type="submit" variant="accent" size="lg">
          Start a mock
        </Button>
        <button
          type="button"
          onClick={() => onStart(null)}
          className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          Skip for now
        </button>
      </div>
    </form>
  );
}
