import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Wordmark } from "@/components/landing/wordmark";

export const metadata: Metadata = {
  title: "Check your email",
  description: "We sent you a sign-in link.",
};

function EnvelopeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export default function VerifyRequestPage() {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden">
      <div aria-hidden="true" className="aurora" />
      <div aria-hidden="true" className="grain" />

      <div className="relative border-b border-border/70">
        <Container className="flex h-16 items-center">
          <Wordmark />
        </Container>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card/80 p-8 text-center shadow-xl shadow-primary/5 backdrop-blur sm:p-10">
          <div className="enter mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/12 text-primary">
            <EnvelopeIcon className="h-8 w-8" />
          </div>
          <h1 className="enter mt-6 font-serif text-3xl font-semibold tracking-tight text-foreground">
            Check your email
          </h1>
          <p className="enter mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            We sent a one-time sign-in link to your inbox. Click it to finish
            signing in — you can close this tab.
          </p>
          <p className="enter mt-6 text-xs text-muted-foreground">
            No email after a minute? Check spam, or{" "}
            <Link
              href="/signin"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              try again
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
