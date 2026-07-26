import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { Container } from "@/components/ui/container";
import { Wordmark } from "@/components/landing/wordmark";
import { AccountControl } from "@/components/auth/account-control";
import { ResultsClient } from "@/components/results/results-client";

export const metadata: Metadata = {
  title: "Your results",
  description: "See how you did on your mock.",
};

export default async function ResultsPage() {
  const { userId } = await auth();
  return (
    <main className="flex min-h-dvh flex-col">
      <div className="border-b border-border/70">
        <Container className="flex h-16 items-center justify-between">
          <Wordmark />
          <AccountControl />
        </Container>
      </div>
      <Container className="w-full max-w-2xl flex-1 py-12">
        <h1 className="mb-8 font-serif text-3xl font-semibold tracking-tight text-foreground">
          Your results
        </h1>
        <Suspense
          fallback={
            <p className="py-24 text-center text-muted-foreground">
              Scoring your mock…
            </p>
          }
        >
          <ResultsClient userId={userId} />
        </Suspense>
      </Container>
    </main>
  );
}
