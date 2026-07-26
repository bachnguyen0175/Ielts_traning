import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { Container } from "@/components/ui/container";
import { Wordmark } from "@/components/landing/wordmark";
import { AccountControl } from "@/components/auth/account-control";
import { MigrateLocalData } from "@/components/auth/migrate-local-data";
import { AccountClient } from "@/components/account/account-client";

export const metadata: Metadata = {
  title: "Account",
  description: "Manage your target band and test date.",
};

export default async function AccountPage() {
  const { userId } = await auth();
  return (
    <main className="flex min-h-dvh flex-col">
      <div className="border-b border-border/70">
        <Container className="flex h-16 items-center justify-between">
          <Wordmark />
          <AccountControl />
        </Container>
      </div>
      <Container className="w-full max-w-md flex-1 py-12">
        <h1 className="mb-8 font-serif text-3xl font-semibold tracking-tight text-foreground">
          Account
        </h1>
        <AccountClient userId={userId} />
        {userId && <MigrateLocalData userId={userId} />}
      </Container>
    </main>
  );
}
