import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Wordmark } from "@/components/landing/wordmark";
import { ProgressClient } from "@/components/progress/progress-client";

export const metadata: Metadata = {
  title: "Your progress",
  description: "Your attempt history and progress toward your target band.",
};

export default function ProgressPage() {
  return (
    <main className="flex min-h-dvh flex-col">
      <div className="border-b border-border/70">
        <Container className="flex h-16 items-center">
          <Wordmark />
        </Container>
      </div>
      <Container className="w-full max-w-2xl flex-1 py-12">
        <h1 className="mb-8 font-serif text-3xl font-semibold tracking-tight text-foreground">
          Your progress
        </h1>
        <ProgressClient />
      </Container>
    </main>
  );
}
