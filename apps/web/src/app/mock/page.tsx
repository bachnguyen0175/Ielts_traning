import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { Wordmark } from "@/components/landing/wordmark";
import { PretestClient } from "@/components/pretest/pretest-client";

export const metadata: Metadata = {
  title: "Pre-test",
  description: "Get ready to sit your mock under real conditions.",
};

export default function MockPage() {
  return (
    <main className="flex min-h-dvh flex-col">
      <div className="border-b border-border/70">
        <Container className="flex h-16 items-center">
          <Wordmark />
        </Container>
      </div>
      <Container className="w-full max-w-2xl flex-1 py-12">
        <Suspense
          fallback={
            <p className="py-16 text-center text-muted-foreground">Loading…</p>
          }
        >
          <PretestClient />
        </Suspense>
      </Container>
    </main>
  );
}
