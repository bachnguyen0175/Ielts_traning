"use client";

import { useEffect, useMemo, useState } from "react";
import type { Profile } from "@/lib/data/repositories";
import { profileStore } from "@/lib/data/profile-store";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Field, FieldInput, FieldSelect } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, LockIcon } from "@/components/ui/icons";

const BANDS = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];

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
    <div className="space-y-6">
      <Badge tone={userId ? "primary" : "neutral"}>
        <LockIcon className="h-3 w-3" />
        {userId
          ? "Synced to your account across devices"
          : "Saved on this device only"}
      </Badge>

      <Card>
        <CardBody className="sm:p-7">
          <form onSubmit={save} className="space-y-6" noValidate>
            <Field
              label="Target band"
              hint="Marked on your band dial and used for the gap on your progress chart."
            >
              <FieldSelect
                value={band}
                onChange={(e) => {
                  setBand(e.target.value);
                  setSaved(false);
                }}
              >
                <option value="">Not sure yet</option>
                {BANDS.map((b) => (
                  <option key={b} value={String(b)}>
                    {b.toFixed(1)}
                  </option>
                ))}
              </FieldSelect>
            </Field>

            <Field
              label="Test date"
              hint="Turns into a countdown on your dashboard."
            >
              <FieldInput
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSaved(false);
                }}
              />
            </Field>

            <div className="flex items-center gap-4 border-t border-border/70 pt-6">
              <Button type="submit" variant="accent" size="lg">
                Save changes
              </Button>
              {saved && (
                <span
                  role="status"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-accent"
                >
                  <CheckIcon className="h-4 w-4" />
                  Saved
                </span>
              )}
            </div>
          </form>
        </CardBody>
      </Card>

      {!userId && (
        <Card tone="quiet">
          <CardBody className="flex flex-wrap items-center justify-between gap-4 p-5">
            <p className="text-sm text-muted-foreground">
              Sign in to keep your band history and vocabulary across devices.
            </p>
            <Button href="/sign-in" variant="outline" size="md">
              Sign in
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
