"use client";

import { useState } from "react";
import type { Profile } from "@/lib/data/repositories";
import { Button } from "@/components/ui/button";
import { Field, FieldInput, FieldSelect } from "@/components/ui/field";
import { TargetIcon, CalendarIcon } from "@/components/ui/icons";

const BANDS = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];

/** Today in the browser's own timezone — `toISOString()` would shift the date. */
function today(): string {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

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
      className="space-y-7"
      noValidate
    >
      <div className="flex gap-4">
        <span className="mt-0.5 hidden h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground sm:grid">
          <TargetIcon />
        </span>
        <Field
          label="Target band"
          hint="Sets the marker on your band dial and the gap we track. Optional."
          className="flex-1"
        >
          <FieldSelect value={band} onChange={(e) => setBand(e.target.value)}>
            <option value="">Not sure yet</option>
            {BANDS.map((b) => (
              <option key={b} value={String(b)}>
                {b.toFixed(1)}
              </option>
            ))}
          </FieldSelect>
        </Field>
      </div>

      <div className="flex gap-4">
        <span className="mt-0.5 hidden h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground sm:grid">
          <CalendarIcon />
        </span>
        <Field
          label="Test date"
          hint="When you sit the real exam. Turns into a countdown. Optional."
          className="flex-1"
        >
          <FieldInput
            type="date"
            min={today()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>
      </div>

      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
        <Button type="submit" variant="accent" size="lg">
          Start a mock
        </Button>
        <button
          type="button"
          onClick={() => onStart(null)}
          className="cursor-pointer rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Skip for now
        </button>
      </div>
    </form>
  );
}
