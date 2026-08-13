"use client";

import { useState } from "react";
import type { VocabItem } from "@/lib/data/repositories";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { CheckIcon, SparkIcon } from "@/components/ui/icons";

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
    const pct = items.length > 0 ? Math.round((remembered / items.length) * 100) : 0;
    return (
      <Card tone="raised" className="relative isolate overflow-hidden text-center">
        <div className="aurora opacity-25" aria-hidden="true" />
        <CardBody className="px-6 py-10">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-accent/15 text-accent">
            <SparkIcon className="h-6 w-6" />
          </span>
          <p className="mt-4 font-serif text-2xl font-semibold tracking-tight text-foreground">
            Session complete
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            You reviewed {items.length} {items.length === 1 ? "card" : "cards"} —
            remembered {remembered}.
          </p>

          <div className="mx-auto mt-6 h-1.5 max-w-xs overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 text-xs tabular-nums text-muted-foreground">
            {pct}% recalled
          </p>

          <Button className="mt-6" variant="outline" onClick={restart}>
            Study again
          </Button>
        </CardBody>
      </Card>
    );
  }

  const card = items[index];
  const progress = (index / items.length) * 100;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-baseline justify-between">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Card {index + 1} / {items.length}
          </p>
          <p className="text-xs tabular-nums text-muted-foreground">
            {remembered} remembered
          </p>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Card tone="raised" className="min-h-64">
        <CardBody className="grid min-h-64 place-items-center px-6 py-10 text-center">
          <div>
            <p className="font-serif text-4xl font-semibold tracking-tight text-foreground">
              {card.term}
            </p>

            {revealed ? (
              <div className="mt-5 space-y-1.5 border-t border-border/70 pt-5">
                {card.definition ? (
                  <p className="text-base leading-relaxed text-foreground">
                    {card.definition}
                  </p>
                ) : (
                  <p className="text-sm italic text-muted-foreground">
                    No definition saved
                  </p>
                )}
                {card.source && (
                  <p className="text-xs text-muted-foreground">
                    from {card.source}
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-5 text-sm text-muted-foreground">
                Recall the meaning…
              </p>
            )}
          </div>
        </CardBody>
      </Card>

      {revealed ? (
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button variant="outline" onClick={() => grade(false)}>
            Review again
          </Button>
          <Button variant="primary" onClick={() => grade(true)}>
            <CheckIcon className="h-4 w-4" />
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
