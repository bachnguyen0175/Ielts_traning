import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { AppShell, PageHeader } from "@/components/ui/app-shell";
import { ResultsClient } from "@/components/results/results-client";

export const metadata: Metadata = {
  title: "Your results",
  description: "See how you did on your mock.",
};

export default async function ResultsPage() {
  const { userId } = await auth();
  return (
    <AppShell width="form">
      <PageHeader
        eyebrow="Mock complete"
        title="Your results"
        lead="Here is where you landed. Nothing was marked until you submitted."
      />
      <Suspense
        fallback={
          <p className="py-24 text-center text-muted-foreground">
            Scoring your mock…
          </p>
        }
      >
        <ResultsClient userId={userId} />
      </Suspense>
    </AppShell>
  );
}
