import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Wordmark } from "@/components/landing/wordmark";
import { OnboardingClient } from "@/components/onboarding/onboarding-client";

export const metadata: Metadata = {
  title: "Start a mock",
  description: "Set your goal and begin an authentic IELTS Academic mock exam.",
};

export default function StartPage() {
  return (
    <main className="flex min-h-dvh flex-col">
      <div className="border-b border-border/70">
        <Container className="flex h-16 items-center">
          <Wordmark />
        </Container>
      </div>

      <Container className="flex flex-1 flex-col items-center justify-center py-16">
        <div className="w-full max-w-md">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            No account needed — saved on this device
          </span>
          <h1 className="mt-6 font-serif text-4xl font-semibold leading-tight tracking-tight text-foreground">
            Let&rsquo;s set you up.
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Two quick, optional questions — then straight into your mock. You can
            change these anytime.
          </p>

          <div className="mt-8">
            <OnboardingClient />
          </div>
        </div>
      </Container>
    </main>
  );
}
