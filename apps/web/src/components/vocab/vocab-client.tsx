"use client";

import { useEffect, useMemo, useState } from "react";
import type { VocabItem } from "@/lib/data/repositories";
import { vocabStore } from "@/lib/data/vocab-store";
import { EXAMPLE_VOCAB } from "@/lib/content/example-vocab";
import { MAX_BOX } from "@/lib/srs";
import { Button } from "@/components/ui/button";
import { FlashcardDeck } from "./flashcard-deck";

export function VocabClient({ userId }: { userId: string | null }) {
  const store = useMemo(() => vocabStore(userId), [userId]);
  const [items, setItems] = useState<VocabItem[] | null>(null);
  const [studying, setStudying] = useState(false);
  const [term, setTerm] = useState("");
  const [definition, setDefinition] = useState("");

  const refresh = async () => setItems(await store.list());

  useEffect(() => {
    let cancelled = false;
    store.list().then((v) => {
      if (!cancelled) setItems(v);
    });
    return () => {
      cancelled = true;
    };
  }, [store]);

  if (items === null) {
    return <p className="py-24 text-center text-muted-foreground">Loading…</p>;
  }

  async function addWord(e: React.FormEvent) {
    e.preventDefault();
    if (!(await store.add({ term, definition }))) return;
    setTerm("");
    setDefinition("");
    await refresh();
  }

  async function loadExamples() {
    for (const w of EXAMPLE_VOCAB) await store.add(w);
    await refresh();
  }

  if (studying && items.length > 0) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => {
            setStudying(false);
            void refresh();
          }}
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          ← Back to your words
        </button>
        <FlashcardDeck
          items={items}
          onGrade={(item, remembered) => void store.review(item, remembered)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={addWord}
        className="space-y-3 rounded-2xl border border-border bg-card p-5"
      >
        <p className="text-sm font-semibold text-foreground">Add a word</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            aria-label="Word"
            placeholder="e.g. mitigate"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <input
            aria-label="Definition"
            placeholder="meaning (optional)"
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
            className="h-10 flex-[2] rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button type="submit" variant="primary">
            Save
          </Button>
        </div>
      </form>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
          <p className="font-serif text-xl font-semibold text-foreground">
            No words saved yet
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Save words you meet while reviewing a test, then study them here as
            flashcards. Want to see how it works?
          </p>
          {/* ⚠️ demo-only: injects flagged example words (lib/content/example-vocab.ts) */}
          <Button className="mt-6" variant="outline" onClick={loadExamples}>
            Load example words
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? "word" : "words"} saved
            </p>
            <Button variant="accent" onClick={() => setStudying(true)}>
              Study flashcards
            </Button>
          </div>
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
            {items.map((it) => (
              <li key={it.id} className="flex items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{it.term}</p>
                  {it.definition && (
                    <p className="truncate text-sm text-muted-foreground">
                      {it.definition}
                    </p>
                  )}
                </div>
                <span
                  title={`Mastery ${it.box}/${MAX_BOX}`}
                  className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {it.box}/{MAX_BOX}
                </span>
                <button
                  aria-label={`Remove ${it.term}`}
                  onClick={async () => {
                    await store.remove(it.id);
                    await refresh();
                  }}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
