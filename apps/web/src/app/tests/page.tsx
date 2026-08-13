import type { Metadata } from "next";
import { AppShell, PageHeader } from "@/components/ui/app-shell";
import { Button } from "@/components/ui/button";
import { UploadIcon } from "@/components/ui/icons";
import { contentRepo } from "@/lib/data/client";
import { TestCatalog } from "@/components/tests/test-catalog";

export const metadata: Metadata = {
  title: "Test library",
  description: "Choose a test to sit under real conditions.",
};

export default function TestsPage() {
  const tests = contentRepo.listTests();
  return (
    <AppShell width="content">
      <PageHeader
        eyebrow="Choose your paper"
        title="Test library"
        lead="Every test here runs under authentic conditions — real timing, play-once audio, and no marking until you submit."
      >
        <Button href="/import" variant="outline" size="md">
          <UploadIcon className="h-4 w-4" />
          Import a paper
        </Button>
      </PageHeader>
      <TestCatalog tests={tests} />
    </AppShell>
  );
}
