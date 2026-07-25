"use client";

import { useRef, useState } from "react";

/**
 * Play-once Listening audio. There are no native controls: a single Play action
 * that, once used, cannot be replayed — no pause, no rewind (SIT-3).
 */
export function ListeningAudio({ src }: { src: string }) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<"idle" | "playing" | "ended">("idle");

  function play() {
    if (state !== "idle") return;
    setState("playing");
    try {
      const p = ref.current?.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } catch {
      /* media may be unavailable in some environments */
    }
  }

  const label =
    state === "idle"
      ? "Play audio"
      : state === "playing"
        ? "Playing…"
        : "Audio finished";

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={play}
          disabled={state !== "idle"}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:brightness-110 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
          {label}
        </button>
        <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground/80 dark:text-accent">
          Plays once
        </span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        No pause, no rewind — just like the real test.
      </p>
      <audio
        ref={ref}
        src={src}
        data-testid="listening-audio"
        onEnded={() => setState("ended")}
        preload="auto"
      />
    </div>
  );
}
