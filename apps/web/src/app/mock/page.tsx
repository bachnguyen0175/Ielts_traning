import type { Metadata } from "next";
import { Suspense } from "react";
import { FocusShell } from "@/components/ui/app-shell";
import { PretestClient } from "@/components/pretest/pretest-client";

export const metadata: Metadata = {
  title: "Pre-test",
  description: "Get ready to sit your mock under real conditions.",
};

export default function MockPage() {
  return (
    <FocusShell width="content">
      <Suspense
        fallback={
          <p className="py-16 text-center text-muted-foreground">Loading…</p>
        }
      >
        <PretestClient />
      </Suspense>
    </FocusShell>
  );
}
