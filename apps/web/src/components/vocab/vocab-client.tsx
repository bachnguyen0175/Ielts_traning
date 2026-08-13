"use client";

import { useEffect, useMemo, useState } from "react";
import type { VocabItem } from "@/lib/data/repositories";
import { vocabStore } from "@/lib/data/vocab-store";
import { EXAMPLE_VOCAB } from "@/lib/content/example-vocab";
import { MAX_BOX } from "@/lib/srs";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cx } from "@/lib/cx";
import { CardsIcon, XIcon, ArrowLeftIcon } from "@/components/ui/icons";
import { FlashcardDeck } from "./flashcard-deck";

/** Mastery as filled pips — readable at a glance, unlike "2/5". */
function Mastery({ box }: { box: number }) {
  return (
    <span
      className="flex shrink-0 items-center gap-1"
      title={`Mastery ${box}/${MAX_BOX}`}
      aria-label={`Mastery ${box} of ${MAX_BOX}`}
    >
      {Array.from({ length: MAX_BOX }, (_, i) => (
        <span
          key={i}
          className={cx(
            "h-1.5 w-1.5 rounded-full",
            i < box ? "bg-accent" : "bg-border",
          )}
        />
      ))}
    </span>
  );
}

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
          className="inline-flex cursor-pointer items-center gap-2 rounded-full text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to your words
        </button>
        <FlashcardDeck
          items={items}
          onGrade={(item, remembered) => void store.review(item, remembered)}
        />
      </div>
    );
  }

  const inputClass =
    "h-11 rounded-xl border border-border bg-background/60 px-3.5 text-sm text-foreground " +
    "placeholder:text-muted-foreground/70 transition-colors duration-200 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  return (
    <div className="space-y-8">
      <Card>
        <CardBody className="p-5">
          <form onSubmit={addWord} className="space-y-3">
            <p className="text-sm font-medium text-foreground">Add a word</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                aria-label="Word"
                placeholder="e.g. mitigate"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className={cx(inputClass, "flex-1")}
              />
              <input
                aria-label="Definition"
                placeholder="meaning (optional)"
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                className={cx(inputClass, "flex-[2]")}
              />
              <Button type="submit" variant="primary">
                Save
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {items.length === 0 ? (
        <EmptyState icon={<CardsIcon />} title="No words saved yet">
          <p>
            Save words you meet while reviewing a test, then study them here as
            flashcards. Want to see how it works?
          </p>
          {/* ⚠️ demo-only: injects flagged example words (lib/content/example-vocab.ts) */}
          <div className="mt-6 flex justify-center">
            <Button variant="outline" onClick={loadExamples}>
              Load example words
            </Button>
          </div>
        </EmptyState>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium tabular-nums text-foreground">
                {items.length}
              </span>{" "}
              {items.length === 1 ? "word" : "words"} saved
            </p>
            <Button variant="accent" onClick={() => setStudying(true)}>
              Study flashcards
            </Button>
          </div>

          <Card className="overflow-hidden">
            <ul className="divide-y divide-border/70">
              {items.map((it) => (
                <li
                  key={it.id}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors duration-150 hover:bg-muted/30"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{it.term}</p>
                    {it.definition && (
                      <p className="truncate text-sm text-muted-foreground">
                        {it.definition}
                      </p>
                    )}
                  </div>
                  <Mastery box={it.box} />
                  <button
                    aria-label={`Remove ${it.term}`}
                    onClick={async () => {
                      await store.remove(it.id);
                      await refresh();
                    }}
                    className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
