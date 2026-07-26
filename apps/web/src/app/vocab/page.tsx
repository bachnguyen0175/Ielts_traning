import type { Metadata } from "next";
import { auth } from "@/auth";
import { Container } from "@/components/ui/container";
import { Wordmark } from "@/components/landing/wordmark";
import { AuthNav } from "@/components/auth/auth-nav";
import { VocabClient } from "@/components/vocab/vocab-client";

export const metadata: Metadata = {
  title: "Vocabulary · Flashcards",
  description: "Save words from your tests and study them as flashcards.",
};

export default async function VocabPage() {
  const session = await auth();
  return (
    <main className="flex min-h-dvh flex-col">
      <div className="border-b border-border/70">
        <Container className="flex h-16 items-center justify-between">
          <Wordmark />
          <AuthNav />
        </Container>
      </div>
      <Container className="w-full max-w-2xl flex-1 py-12">
        <h1 className="mb-2 font-serif text-3xl font-semibold tracking-tight text-foreground">
          Vocabulary
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Words you save from your tests — study them as flashcards.
          {session?.user
            ? " Synced to your account."
            : " Sign in to sync across devices."}
        </p>
        <VocabClient userId={session?.user?.id ?? null} />
      </Container>
    </main>
  );
}
