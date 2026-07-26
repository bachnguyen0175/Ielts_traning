import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { auth, signIn, signOut } from "@/auth";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/landing/wordmark";
import { SubmitButton } from "@/components/auth/submit-button";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to save your progress across devices.",
};

export const dynamic = "force-dynamic";

function step(i: number): CSSProperties {
  return { ["--i" as string]: i };
}

const PERKS = [
  "Resume a mock on any device",
  "Band history that follows you",
  "Saved vocabulary, always in sync",
];

function MailIcon({ className }: { className?: string }) {
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  const { error } = await searchParams;
  const errorMessage = error
    ? error === "Verification"
      ? "That link has expired or was already used — request a new one below."
      : "We couldn't send your magic link. Please try again in a moment."
    : null;

  return (
    <main className="relative min-h-dvh lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      {/* ── Brand / atmosphere panel (desktop) ── */}
      <aside className="relative hidden overflow-hidden border-r border-border/70 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div aria-hidden="true" className="aurora" />
        <div aria-hidden="true" className="grain" />

        <div className="relative">
          <Wordmark />
        </div>

        <div className="relative max-w-md">
          <h2 className="font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-foreground">
            <span className="enter block" style={step(0)}>
              Your progress,
            </span>
            <span className="enter block" style={step(1)}>
              <em className="text-gradient font-semibold not-italic">
                everywhere
              </em>{" "}
              you study.
            </span>
          </h2>
          <p
            className="enter mt-5 text-lg leading-relaxed text-muted-foreground"
            style={step(2)}
          >
            Sign in and your mocks, band history, and saved vocabulary follow you
            across every device — no password, just a one-time magic link.
          </p>

          <ul className="enter mt-8 space-y-3" style={step(3)}>
            {PERKS.map((perk) => (
              <li
                key={perk}
                className="flex items-center gap-3 text-sm text-foreground"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/12 text-primary">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                {perk}
              </li>
            ))}
          </ul>
        </div>

        {/* band-score chip motif */}
        <div
          className="enter relative flex items-center gap-3 rounded-2xl border border-border bg-card/80 px-4 py-3 shadow-xl shadow-primary/10 backdrop-blur"
          style={step(4)}
        >
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <span className="font-serif text-lg font-semibold">7.5</span>
          </div>
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Your latest overall band
            </div>
            <div className="text-sm font-semibold text-foreground">
              Picks up right where you left off
            </div>
          </div>
        </div>
      </aside>

      {/* ── Form panel ── */}
      <div className="relative flex min-h-dvh flex-col">
        {/* mobile header */}
        <div className="border-b border-border/70 lg:hidden">
          <Container className="flex h-16 items-center">
            <Wordmark />
          </Container>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-sm">
            {session?.user ? (
              <div className="enter text-center" style={step(0)}>
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/12 text-primary">
                  <CheckIcon className="h-7 w-7" />
                </div>
                <h1 className="mt-5 font-serif text-2xl font-semibold tracking-tight text-foreground">
                  You&apos;re signed in
                </h1>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {session.user.email}
                </p>
                <div className="mt-7 flex flex-col gap-2.5">
                  <Button href="/progress" variant="primary" size="lg">
                    Go to your progress
                  </Button>
                  <form
                    action={async () => {
                      "use server";
                      await signOut({ redirectTo: "/" });
                    }}
                  >
                    <Button
                      type="submit"
                      variant="ghost"
                      size="md"
                      className="w-full"
                    >
                      Sign out
                    </Button>
                  </form>
                </div>
              </div>
            ) : (
              <>
                <div className="enter" style={step(0)}>
                  <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
                    Sign in to Composed
                  </h1>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Enter your email and we&apos;ll send a one-time magic link.
                    No password to remember.
                  </p>
                </div>

                {errorMessage && (
                  <div
                    role="alert"
                    aria-live="polite"
                    className="enter mt-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-[hsl(0_70%_40%)]"
                    style={step(1)}
                  >
                    {errorMessage}
                  </div>
                )}

                <form
                  action={async (formData: FormData) => {
                    "use server";
                    await signIn("resend", {
                      email: String(formData.get("email")),
                      redirectTo: "/progress",
                    });
                  }}
                  className="enter mt-8 space-y-4"
                  style={step(errorMessage ? 2 : 1)}
                >
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <MailIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        inputMode="email"
                        placeholder="you@example.com"
                        className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                      />
                    </div>
                  </div>
                  <SubmitButton pendingLabel="Sending your link…">
                    Send magic link
                  </SubmitButton>
                </form>

                <p
                  className="enter mt-6 text-center text-xs leading-relaxed text-muted-foreground"
                  style={step(errorMessage ? 3 : 2)}
                >
                  Prefer to look around first?{" "}
                  <Link
                    href="/tests"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Continue as guest
                  </Link>{" "}
                  — sign in anytime to save your progress.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
