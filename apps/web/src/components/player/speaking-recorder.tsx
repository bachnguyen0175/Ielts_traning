"use client";

import { useRef, useState } from "react";

type RecState = "idle" | "recording" | "done" | "unsupported";

/**
 * Best-effort Speaking capture via MediaRecorder (SIT-10). Degrades gracefully
 * where media APIs are unavailable. Stores a blob URL for later self-review.
 */
export function SpeakingRecorder({
  existingUrl,
  onRecorded,
}: {
  existingUrl?: string;
  onRecorded: (url: string, seconds: number) => void;
}) {
  const [state, setState] = useState<RecState>(existingUrl ? "done" : "idle");
  const [url, setUrl] = useState<string | undefined>(existingUrl);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const startRef = useRef(0);

  async function start() {
    const md =
      typeof navigator !== "undefined" ? navigator.mediaDevices : undefined;
    if (!md?.getUserMedia || typeof MediaRecorder === "undefined") {
      setState("unsupported");
      return;
    }
    try {
      const stream = await md.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunks.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) chunks.current.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunks.current, {
          type: rec.mimeType || "audio/webm",
        });
        const objectUrl = URL.createObjectURL(blob);
        const seconds = Math.max(1, Math.round((Date.now() - startRef.current) / 1000));
        setUrl(objectUrl);
        setState("done");
        onRecorded(objectUrl, seconds);
        stream.getTracks().forEach((t) => t.stop());
      };
      startRef.current = Date.now();
      rec.start();
      recRef.current = rec;
      setState("recording");
    } catch {
      setState("unsupported");
    }
  }

  function stop() {
    recRef.current?.stop();
  }

  if (state === "unsupported") {
    return (
      <p className="text-sm text-muted-foreground">
        Recording isn&rsquo;t available in this environment. Your response would
        be captured here on a supported device.
      </p>
    );
  }

  if (state === "done" && url) {
    return (
      <div className="space-y-3">
        <audio controls src={url} className="w-full" />
        <button
          type="button"
          onClick={() => setState("idle")}
          className="cursor-pointer rounded-full text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Re-record
        </button>
      </div>
    );
  }

  if (state === "recording") {
    return (
      <button
        type="button"
        onClick={stop}
        className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-accent-foreground shadow-sm transition-all duration-200 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {/* motion-safe: every animation in this app is opt-out-able. */}
        <span className="h-2.5 w-2.5 rounded-full bg-current motion-safe:animate-pulse" />
        Stop recording
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={start}
      className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-medium text-foreground shadow-sm transition-colors duration-200 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <span className="h-2.5 w-2.5 rounded-full bg-accent" />
      Record answer
    </button>
  );
}
