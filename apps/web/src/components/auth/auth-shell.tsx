import type { CSSProperties, ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { Wordmark } from "@/components/landing/wordmark";

function step(i: number): CSSProperties {
  return { ["--i" as string]: i };
}

const PERKS = [
  "Resume a mock on any device",
  "Band history that follows you",
  "Saved vocabulary, always in sync",
];

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

// Split-screen shell for the auth screens: an atmospheric brand panel + a slot
// for Clerk's <SignIn/> / <SignUp/> widget. Keeps the "Composed" look around
// Clerk's functional UI.
export function AuthShell({
  heading,
  children,
}: {
  heading: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="relative min-h-dvh lg:grid lg:grid-cols-[1.05fr_0.95fr]">
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
            across every device.
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

      <div className="relative flex min-h-dvh flex-col">
        <div className="border-b border-border/70 lg:hidden">
          <Container className="flex h-16 items-center">
            <Wordmark />
          </Container>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10">
          <div className="mb-6 text-center">
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
              {heading}
            </h1>
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}
