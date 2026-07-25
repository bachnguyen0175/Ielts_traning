"use client";

import { useState } from "react";
import Link from "next/link";
import { vocabRepo } from "@/lib/data/client";
import { Button } from "@/components/ui/button";

/**
 * Post-test vocabulary capture (REV-7): shown on Review so candidates can save
 * words they met in the test they just sat. Saves to the VocabRepository seam
 * with the test title as the source; studied later on /vocab.
 */
export function VocabCapture({ source }: { source?: string }) {
  const [term, setTerm] = useState("");
  const [count, setCount] = useState(0);

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!vocabRepo().add({ term, source })) return;
    setTerm("");
    setCount((n) => n + 1);
  }

  return (
    <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-lg font-semibold text-foreground">
          Save words to study
        </h2>
        <Link
          href="/vocab"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          Your flashcards →
        </Link>
      </div>
      <p className="text-sm text-muted-foreground">
        Add any word you want to remember from this test.
      </p>
      <form onSubmit={save} className="flex flex-col gap-3 sm:flex-row">
        <input
          aria-label="Word to save"
          placeholder="e.g. nutmeg"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button type="submit" variant="primary">
          Save word
        </Button>
      </form>
      {count > 0 && (
        <p aria-live="polite" className="text-sm text-muted-foreground">
          Saved {count} {count === 1 ? "word" : "words"} —{" "}
          <Link href="/vocab" className="text-primary underline-offset-4 hover:underline">
            study now
          </Link>
          .
        </p>
      )}
    </section>
  );
}
