import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Wordmark } from "@/components/landing/wordmark";
import { AccountMenu } from "@/components/auth/account-menu";
import { contentRepo } from "@/lib/data/client";
import { TestCatalog } from "@/components/tests/test-catalog";

export const metadata: Metadata = {
  title: "Test library",
  description: "Choose a test to sit under real conditions.",
};

export default function TestsPage() {
  const tests = contentRepo.listTests();
  return (
    <main className="flex min-h-dvh flex-col">
      <div className="border-b border-border/70">
        <Container className="flex h-16 items-center justify-between">
          <Wordmark />
          <AccountMenu />
        </Container>
      </div>
      <Container className="w-full max-w-3xl flex-1 py-12">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
          Test library
        </h1>
        <p className="mt-2 mb-8 text-muted-foreground">
          Pick a test to sit under authentic conditions.
        </p>
        <TestCatalog tests={tests} />
      </Container>
    </main>
  );
}
