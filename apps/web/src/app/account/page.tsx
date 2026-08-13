import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { AppShell, PageHeader } from "@/components/ui/app-shell";
import { MigrateLocalData } from "@/components/auth/migrate-local-data";
import { AccountClient } from "@/components/account/account-client";

export const metadata: Metadata = {
  title: "Account",
  description: "Manage your target band and test date.",
};

export default async function AccountPage() {
  const { userId } = await auth();
  return (
    <AppShell width="form">
      <PageHeader
        eyebrow="Settings"
        title="Account"
        lead="Your goal and your deadline — both feed the dashboard and your progress chart."
      />
      <AccountClient userId={userId} />
      {userId && <MigrateLocalData userId={userId} />}
    </AppShell>
  );
}
