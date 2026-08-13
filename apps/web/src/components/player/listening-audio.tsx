"use client";

import { useRef, useState } from "react";
import { cx } from "@/lib/cx";
import { PlayIcon, HeadphonesIcon, CheckIcon } from "@/components/ui/icons";

/**
 * Play-once Listening audio. There are no native controls: a single Play action
 * that, once used, cannot be replayed — no pause, no rewind (SIT-3).
 *
 * The progress bar is deliberately read-only. Knowing how far through you are
 * is information the real test gives you too; being able to drag it is not.
 */
export function ListeningAudio({ src }: { src: string }) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<"idle" | "playing" | "ended">("idle");
  const [progress, setProgress] = useState(0);

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
    <div
      className={cx(
        "rounded-2xl border p-5 backdrop-blur-sm transition-colors duration-300",
        state === "playing"
          ? "border-accent/40 bg-accent/[0.07]"
          : "border-border bg-card/60",
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={cx(
            "grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors duration-300",
            state === "ended"
              ? "bg-muted text-muted-foreground"
              : "bg-primary/12 text-primary",
          )}
        >
          {state === "ended" ? (
            <CheckIcon className="h-5 w-5" />
          ) : (
            <HeadphonesIcon className="h-5 w-5" />
          )}
        </span>

        <button
          type="button"
          onClick={play}
          disabled={state !== "idle"}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <PlayIcon className="h-4 w-4" />
          {label}
        </button>

        <span className="rounded-full border border-accent/30 bg-accent/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground dark:text-accent">
          Plays once
        </span>
      </div>

      {state !== "idle" && (
        <div
          className="mt-4 h-1 overflow-hidden rounded-full bg-muted"
          role="presentation"
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-500 ease-linear"
            style={{ width: `${state === "ended" ? 100 : progress}%` }}
          />
        </div>
      )}

      <p className="mt-3 text-xs text-muted-foreground">
        No pause, no rewind — just like the real test.
      </p>

      <audio
        ref={ref}
        src={src}
        data-testid="listening-audio"
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          if (el.duration > 0) {
            setProgress((el.currentTime / el.duration) * 100);
          }
        }}
        onEnded={() => setState("ended")}
        preload="auto"
      />
    </div>
  );
}
