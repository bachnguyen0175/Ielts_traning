import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@/auth";
import { RunClient } from "@/components/player/run-client";

export const metadata: Metadata = {
  title: "Your mock",
  description: "Sit your mock under real conditions.",
};

export default async function RunPage() {
  const session = await auth();
  return (
    <Suspense
      fallback={
        <main className="grid min-h-dvh place-items-center">
          <p className="text-muted-foreground">Loading your mock…</p>
        </main>
      }
    >
      <RunClient userId={session?.user?.id ?? null} />
    </Suspense>
  );
}
