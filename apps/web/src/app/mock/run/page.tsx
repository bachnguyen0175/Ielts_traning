import type { Metadata } from "next";
import { Suspense } from "react";
import { RunClient } from "@/components/player/run-client";

export const metadata: Metadata = {
  title: "Your mock",
  description: "Sit your mock under real conditions.",
};

export default function RunPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-dvh place-items-center">
          <p className="text-muted-foreground">Loading your mock…</p>
        </main>
      }
    >
      <RunClient />
    </Suspense>
  );
}
