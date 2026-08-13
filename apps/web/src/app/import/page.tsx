import type { Metadata } from "next";
import { AppShell, PageHeader } from "@/components/ui/app-shell";
import { Badge } from "@/components/ui/badge";
import { LockIcon } from "@/components/ui/icons";
import { ImportClient } from "@/components/import/import-client";

export const metadata: Metadata = {
  title: "Import a paper",
  description: "Turn a reading paper written in markdown into a sittable mock.",
};

export default function ImportPage() {
  return (
    <AppShell width="content">
      <PageHeader
        eyebrow="Library"
        title="Import a paper"
        lead="Upload a Reading paper written in markdown and sit it under real conditions. Parsing happens in your browser and the result is stored only on this device — nothing is uploaded to us."
      >
        <Badge tone="primary">
          <LockIcon className="h-3 w-3" />
          Stays on this device
        </Badge>
      </PageHeader>
      <ImportClient />
    </AppShell>
  );
}
