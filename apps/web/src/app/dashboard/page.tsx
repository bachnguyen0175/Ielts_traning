import type { Metadata } from "next";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Container } from "@/components/ui/container";
import { Wordmark } from "@/components/landing/wordmark";
import { AccountControl } from "@/components/auth/account-control";
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
    <main className="flex min-h-dvh flex-col">
      <div className="border-b border-border/70">
        <Container className="flex h-16 items-center justify-between">
          <Wordmark />
          <AccountControl />
        </Container>
      </div>
      <Container className="w-full max-w-5xl flex-1 py-12">
        <header className="enter mb-8" style={{ ["--i" as string]: 0 }}>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {greeting}
          </h1>
          <p className="mt-2 text-muted-foreground">
            One step at a time — here is where you stand.
          </p>
        </header>
        <DashboardClient userId={userId} />
        {userId && <MigrateLocalData userId={userId} />}
      </Container>
    </main>
  );
}
