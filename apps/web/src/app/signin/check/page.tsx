import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Wordmark } from "@/components/landing/wordmark";

export const metadata: Metadata = {
  title: "Check your email",
  description: "We sent you a sign-in link.",
};

export default function VerifyRequestPage() {
  return (
    <main className="flex min-h-dvh flex-col">
      <div className="border-b border-border/70">
        <Container className="flex h-16 items-center">
          <Wordmark />
        </Container>
      </div>
      <Container className="w-full max-w-md flex-1 py-16 text-center">
        <div className="space-y-3">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground">
            We sent a sign-in link to your inbox. Click it to finish signing in —
            you can close this tab.
          </p>
          <p className="pt-2 text-xs text-muted-foreground">
            No email after a minute? Check spam, or{" "}
            <a href="/signin" className="text-primary underline-offset-4 hover:underline">
              try again
            </a>
            .
          </p>
        </div>
      </Container>
    </main>
  );
}
