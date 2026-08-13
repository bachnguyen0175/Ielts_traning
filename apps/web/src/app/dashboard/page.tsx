import type { Metadata } from "next";
import { auth, currentUser } from "@clerk/nextjs/server";
import { AppShell, PageHeader } from "@/components/ui/app-shell";
import { MigrateLocalData } from "@/components/auth/migrate-local-data";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your next step, progress snapshot, and study shortcuts.",
};

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = userId ? await currentUser() : null;
  const greeting = user?.firstName ? `Welcome back, ${user.firstName}` : "Welcome back";

  return (
    // Only the chrome changed here — the dashboard's own layout is unchanged.
    <AppShell width="wide">
      <PageHeader
        title={greeting}
        lead="One step at a time — here is where you stand."
      />
      <DashboardClient userId={userId} />
      {userId && <MigrateLocalData userId={userId} />}
    </AppShell>
  );
}
