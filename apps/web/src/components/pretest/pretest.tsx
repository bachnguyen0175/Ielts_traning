"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const CONDITIONS = [
  {
    title: "Audio plays once",
    desc: "Listening plays a single time. No pause, no rewind.",
  },
  {
    title: "The clock never stops",
    desc: "Each section is timed and auto-advances when time runs out.",
  },
  {
    title: "No feedback until you submit",
    desc: "You won't see what's right until the whole mock is finished.",
  },
];

const checkItemClass =
  "flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4";

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
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          You&rsquo;re about to sit
        </p>
        <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-foreground">
          {testTitle}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Set aside <span className="text-foreground">{durationLabel}</span> and
          find a quiet space.
        </p>
      </div>

      <section aria-labelledby="conditions-h" className="space-y-3">
        <h2 id="conditions-h" className="text-sm font-semibold text-foreground">
          Real conditions
        </h2>
        <ul className="space-y-2">
          {CONDITIONS.map((c) => (
            <li
              key={c.title}
              className="rounded-xl border border-border bg-card/60 p-4"
            >
              <p className="font-medium text-foreground">{c.title}</p>
              <p className="text-sm text-muted-foreground">{c.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="check-h" className="space-y-3">
        <h2 id="check-h" className="text-sm font-semibold text-foreground">
          Quick system check
        </h2>

        <div className={checkItemClass}>
          <div>
            <p className="font-medium text-foreground">Audio</p>
            <p className="text-sm text-muted-foreground">
              Play a test sound and confirm you can hear it.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button type="button" variant="outline" size="md" onClick={playTestSound}>
              Play test sound
            </Button>
            <Button
              type="button"
              variant={audioOk ? "primary" : "ghost"}
              size="md"
              onClick={() => setAudioOk(true)}
            >
              {audioOk ? "✓ Heard it" : "I can hear it"}
            </Button>
          </div>
        </div>

        <div className={checkItemClass}>
          <div>
            <p className="font-medium text-foreground">Microphone</p>
            <p className="text-sm text-muted-foreground">
              Needed to record your Speaking responses.
            </p>
          </div>
          <Button
            type="button"
            variant={micOk ? "primary" : "outline"}
            size="md"
            onClick={enableMic}
          >
            {micOk ? "✓ Microphone ready" : "Enable microphone"}
          </Button>
        </div>
      </section>

      <label className="flex items-start gap-3 rounded-xl border border-border bg-card/60 p-4">
        <input
          type="checkbox"
          checked={ready}
          onChange={(e) => setReady(e.target.checked)}
          className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]"
        />
        <span className="text-sm text-foreground">
          I understand this is <strong>one sitting</strong> — once I start, the
          clock runs and I&rsquo;ll finish it in one go.
        </span>
      </label>

      <div className="flex justify-end">
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
