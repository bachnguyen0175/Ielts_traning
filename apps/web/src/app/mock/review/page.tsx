import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { AppShell, PageHeader } from "@/components/ui/app-shell";
import { ReviewClient } from "@/components/review/review-client";

export const metadata: Metadata = {
  title: "Review",
  description: "Review your answers and submissions.",
};

export default async function ReviewPage() {
  const { userId } = await auth();
  return (
    <AppShell width="content">
      <PageHeader
        eyebrow="Answer by answer"
        title="Review"
        lead="What you wrote, what was expected, and the criteria to judge your own Writing and Speaking against."
      />
      <Suspense
        fallback={
          <p className="py-24 text-center text-muted-foreground">
            Loading review…
          </p>
        }
      >
        <ReviewClient userId={userId} />
      </Suspense>
    </AppShell>
  );
}
