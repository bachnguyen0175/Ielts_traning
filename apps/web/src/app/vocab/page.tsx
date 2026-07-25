import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Wordmark } from "@/components/landing/wordmark";
import { VocabClient } from "@/components/vocab/vocab-client";

export const metadata: Metadata = {
  title: "Vocabulary · Flashcards",
  description: "Save words from your tests and study them as flashcards.",
};

export default function VocabPage() {
  return (
    <main className="flex min-h-dvh flex-col">
      <div className="border-b border-border/70">
        <Container className="flex h-16 items-center">
          <Wordmark />
        </Container>
      </div>
      <Container className="w-full max-w-2xl flex-1 py-12">
        <h1 className="mb-2 font-serif text-3xl font-semibold tracking-tight text-foreground">
          Vocabulary
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Words you save from your tests — study them as flashcards.
        </p>
        <VocabClient />
      </Container>
    </main>
  );
}
