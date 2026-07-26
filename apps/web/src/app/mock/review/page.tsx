import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@/auth";
import { Container } from "@/components/ui/container";
import { Wordmark } from "@/components/landing/wordmark";
import { AccountMenu } from "@/components/auth/account-menu";
import { ReviewClient } from "@/components/review/review-client";

export const metadata: Metadata = {
  title: "Review",
  description: "Review your answers and submissions.",
};

export default async function ReviewPage() {
  const session = await auth();
  return (
    <main className="flex min-h-dvh flex-col">
      <div className="border-b border-border/70">
        <Container className="flex h-16 items-center justify-between">
          <Wordmark />
          <AccountMenu />
        </Container>
      </div>
      <Container className="w-full max-w-3xl flex-1 py-12">
        <h1 className="mb-8 font-serif text-3xl font-semibold tracking-tight text-foreground">
          Review
        </h1>
        <Suspense
          fallback={
            <p className="py-24 text-center text-muted-foreground">
              Loading review…
            </p>
          }
        >
          <ReviewClient userId={session?.user?.id ?? null} />
        </Suspense>
      </Container>
    </main>
  );
}
