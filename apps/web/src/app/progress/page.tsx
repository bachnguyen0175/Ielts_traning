import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { Container } from "@/components/ui/container";
import { Wordmark } from "@/components/landing/wordmark";
import { AccountControl } from "@/components/auth/account-control";
import { MigrateLocalData } from "@/components/auth/migrate-local-data";
import { ProgressClient } from "@/components/progress/progress-client";

export const metadata: Metadata = {
  title: "Your progress",
  description: "Your attempt history and progress toward your target band.",
};

export default async function ProgressPage() {
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
          Your progress
        </h1>
        <ProgressClient userId={userId} />
        {userId && <MigrateLocalData userId={userId} />}
      </Container>
    </main>
  );
}
