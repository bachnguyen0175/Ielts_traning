import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { AppShell, PageHeader } from "@/components/ui/app-shell";
import { MigrateLocalData } from "@/components/auth/migrate-local-data";
import { ProgressClient } from "@/components/progress/progress-client";

export const metadata: Metadata = {
  title: "Your progress",
  description: "Your attempt history and progress toward your target band.",
};

export default async function ProgressPage() {
  const { userId } = await auth();
  return (
    <AppShell width="content">
      <PageHeader
        eyebrow="Over time"
        title="Your progress"
        lead="Every sitting you have finished, and where the trend is heading against your target."
      />
      <ProgressClient userId={userId} />
      {userId && <MigrateLocalData userId={userId} />}
    </AppShell>
  );
}
