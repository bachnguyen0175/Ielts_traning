"use client";

import { useState } from "react";
import type { VocabItem } from "@/lib/data/repositories";
import { Button } from "@/components/ui/button";

/**
 * Flashcard study session over the given cards. Purely presentational: it owns
 * the current-index/flip state and reports each grade via `onGrade` so the
 * caller can persist it (mock SRS, see lib/srs.ts).
 */
export function FlashcardDeck({
  items,
  onGrade,
}: {
  items: VocabItem[];
  onGrade: (item: VocabItem, remembered: boolean) => void;
}) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [remembered, setRemembered] = useState(0);

  const done = index >= items.length;

  function grade(ok: boolean) {
    onGrade(items[index], ok);
    if (ok) setRemembered((n) => n + 1);
    setRevealed(false);
    setIndex((i) => i + 1);
  }

  function restart() {
    setIndex(0);
    setRevealed(false);
    setRemembered(0);
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <p className="font-serif text-2xl font-semibold text-foreground">
          Session complete
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          You reviewed {items.length} {items.length === 1 ? "card" : "cards"} —
          remembered {remembered}.
        </p>
        <Button className="mt-6" variant="outline" onClick={restart}>
          Study again
        </Button>
      </div>
    );
  }

  const card = items[index];

  return (
    <div className="space-y-4">
      <p className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Card {index + 1} / {items.length}
      </p>
      <div className="grid min-h-56 place-items-center rounded-2xl border border-border bg-card p-8 text-center">
        <div className="space-y-4">
          <p className="font-serif text-3xl font-semibold text-foreground">
            {card.term}
          </p>
          {revealed ? (
            <div className="space-y-1">
              {card.definition ? (
                <p className="text-base text-foreground">{card.definition}</p>
              ) : (
                <p className="text-sm italic text-muted-foreground">
                  No definition saved
                </p>
              )}
              {card.source && (
                <p className="text-xs text-muted-foreground">from {card.source}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Recall the meaning…</p>
          )}
        </div>
      </div>

      {revealed ? (
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => grade(false)}>
            Review again
          </Button>
          <Button variant="primary" onClick={() => grade(true)}>
            Got it
          </Button>
        </div>
      ) : (
        <div className="flex justify-center">
          <Button variant="accent" onClick={() => setRevealed(true)}>
            Show definition
          </Button>
        </div>
      )}
    </div>
  );
}
