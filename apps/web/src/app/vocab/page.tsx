import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { AppShell, PageHeader } from "@/components/ui/app-shell";
import { MigrateLocalData } from "@/components/auth/migrate-local-data";
import { VocabClient } from "@/components/vocab/vocab-client";

export const metadata: Metadata = {
  title: "Vocabulary · Flashcards",
  description: "Save words from your tests and study them as flashcards.",
};

export default async function VocabPage() {
  const { userId } = await auth();
  return (
    <AppShell width="form">
      <PageHeader
        eyebrow="Study"
        title="Vocabulary"
        lead={
          <>
            Words you save from your tests — study them as flashcards.
            {userId
              ? " Synced to your account."
              : " Sign in to sync across devices."}
          </>
        }
      />
      <VocabClient userId={userId} />
      {userId && <MigrateLocalData userId={userId} />}
    </AppShell>
  );
}
