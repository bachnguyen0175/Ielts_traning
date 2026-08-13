import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Wordmark } from "@/components/landing/wordmark";
import { AccountControl } from "@/components/auth/account-control";
import { ImportClient } from "@/components/import/import-client";

export const metadata: Metadata = {
  title: "Import a paper",
  description: "Turn a reading paper written in markdown into a sittable mock.",
};

export default function ImportPage() {
  return (
    <main className="flex min-h-dvh flex-col">
      <div className="border-b border-border/70">
        <Container className="flex h-16 items-center justify-between">
          <Wordmark />
          <AccountControl />
        </Container>
      </div>
      <Container className="w-full max-w-3xl flex-1 py-12">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
          Import a paper
        </h1>
        <p className="mt-2 mb-8 text-muted-foreground">
          Upload a Reading paper written in markdown and sit it under real
          conditions. Parsing happens in your browser and the result is stored
          only on this device — nothing is uploaded to us.
        </p>
        <ImportClient />
      </Container>
    </main>
  );
}
