"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { cx } from "@/lib/cx";
import {
  HeadphonesIcon,
  ClockIcon,
  LockIcon,
  CheckIcon,
  MicIcon,
  PlayIcon,
} from "@/components/ui/icons";

const CONDITIONS = [
  {
    Icon: HeadphonesIcon,
    title: "Audio plays once",
    desc: "Listening plays a single time. No pause, no rewind.",
  },
  {
    Icon: ClockIcon,
    title: "The clock never stops",
    desc: "Each section is timed and auto-advances when time runs out.",
  },
  {
    Icon: LockIcon,
    title: "No feedback until you submit",
    desc: "You won't see what's right until the whole mock is finished.",
  },
];

/** A system-check row. `done` drives the tick, not a different layout. */
function CheckRow({
  done,
  icon,
  title,
  desc,
  children,
}: {
  done: boolean;
  icon: React.ReactNode;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Card
        tone={done ? "notice" : "plain"}
        className={cx(
          "transition-colors duration-200",
          done && "border-accent/40",
        )}
      >
        <CardBody className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
          <span
            className={cx(
              "grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors duration-200",
              done
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {done ? <CheckIcon className="h-5 w-5" /> : icon}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {children}
          </div>
        </CardBody>
      </Card>
    </li>
  );
}

export function Pretest({
  testTitle,
  durationLabel,
  onStart,
}: {
  testTitle: string;
  durationLabel: string;
  onStart: () => void;
}) {
  const [audioOk, setAudioOk] = useState(false);
  const [micOk, setMicOk] = useState(false);
  const [ready, setReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canStart = audioOk && micOk && ready;
  const doneCount = [audioOk, micOk, ready].filter(Boolean).length;

  async function playTestSound() {
    try {
      await audioRef.current?.play();
    } catch {
      /* autoplay/asset may be unavailable; the user confirms manually */
    }
  }

  async function enableMic() {
    try {
      const stream = await navigator.mediaDevices?.getUserMedia({ audio: true });
      stream?.getTracks().forEach((t) => t.stop());
    } catch {
      /* permission may be denied in this environment; still let them proceed */
    }
    setMicOk(true);
  }

  return (
    <div className="space-y-10">
      <header className="enter" style={{ ["--i" as string]: 0 }}>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          You&rsquo;re about to sit
        </p>
        <h1 className="mt-2.5 font-serif text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
          {testTitle}
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Set aside{" "}
          <span className="font-medium text-foreground">{durationLabel}</span>{" "}
          and find a quiet space.
        </p>
      </header>

      <section
        aria-labelledby="conditions-h"
        className="enter"
        style={{ ["--i" as string]: 1 }}
      >
        <h2
          id="conditions-h"
          className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground"
        >
          Real conditions
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {CONDITIONS.map(({ Icon, title, desc }) => (
            <li
              key={title}
              className="rounded-2xl border border-border bg-card/60 p-4 backdrop-blur-sm"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-muted text-muted-foreground">
                <Icon className="h-4 w-4" />
              </span>
              <p className="mt-3 font-medium leading-snug text-foreground">
                {title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {desc}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="check-h"
        className="enter"
        style={{ ["--i" as string]: 2 }}
      >
        <div className="flex items-baseline justify-between gap-4">
          <h2
            id="check-h"
            className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground"
          >
            Quick system check
          </h2>
          <span className="text-xs font-medium tabular-nums text-muted-foreground">
            {doneCount} of 3 ready
          </span>
        </div>

        <div
          className="mt-3 h-1 overflow-hidden rounded-full bg-muted"
          role="presentation"
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
            style={{ width: `${(doneCount / 3) * 100}%` }}
          />
        </div>

        <ul className="mt-4 space-y-3">
          <CheckRow
            done={audioOk}
            icon={<HeadphonesIcon className="h-5 w-5" />}
            title="Audio"
            desc="Play a test sound and confirm you can hear it."
          >
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={playTestSound}
            >
              <PlayIcon className="h-4 w-4" />
              Play test sound
            </Button>
            <Button
              type="button"
              variant={audioOk ? "primary" : "ghost"}
              size="md"
              onClick={() => setAudioOk(true)}
            >
              {audioOk ? "Heard it" : "I can hear it"}
            </Button>
          </CheckRow>

          <CheckRow
            done={micOk}
            icon={<MicIcon className="h-5 w-5" />}
            title="Microphone"
            desc="Needed to record your Speaking responses."
          >
            <Button
              type="button"
              variant={micOk ? "primary" : "outline"}
              size="md"
              onClick={enableMic}
            >
              {micOk ? "Microphone ready" : "Enable microphone"}
            </Button>
          </CheckRow>
        </ul>
      </section>

      <label
        className={cx(
          "enter flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors duration-200",
          ready
            ? "border-accent/40 bg-accent/[0.07]"
            : "border-border bg-card/60 hover:border-foreground/20",
        )}
        style={{ ["--i" as string]: 3 }}
      >
        <input
          type="checkbox"
          checked={ready}
          onChange={(e) => setReady(e.target.checked)}
          className="mt-0.5 h-4 w-4 cursor-pointer accent-[hsl(var(--accent))]"
        />
        <span className="text-sm leading-relaxed text-foreground">
          I understand this is <strong>one sitting</strong> — once I start, the
          clock runs and I&rsquo;ll finish it in one go.
        </span>
      </label>

      <div
        className="enter flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end"
        style={{ ["--i" as string]: 4 }}
      >
        {!canStart && (
          <p className="text-sm text-muted-foreground sm:mr-auto">
            Finish the checks above to begin.
          </p>
        )}
        <Button
          type="button"
          variant="accent"
          size="lg"
          disabled={!canStart}
          onClick={onStart}
        >
          Start the mock
        </Button>
      </div>

      <audio ref={audioRef} src="/audio/sample-listening.wav" preload="none" />
    </div>
  );
}
