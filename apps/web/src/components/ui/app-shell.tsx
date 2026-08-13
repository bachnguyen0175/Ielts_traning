import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { Wordmark } from "@/components/landing/wordmark";
import { AppNav } from "@/components/ui/app-nav";
import { cx } from "@/lib/cx";

// Two shells, not one shell with a `showNav` switch. Which chrome a screen gets
// is a fact about the screen, so it is encoded in the component you pick rather
// than a boolean you pass (vercel-composition-patterns:
// architecture-avoid-boolean-props, patterns-explicit-variants).

const WIDTHS = {
  narrow: "max-w-md",
  form: "max-w-2xl",
  content: "max-w-3xl",
  wide: "max-w-5xl",
} as const;

export type ShellWidth = keyof typeof WIDTHS;

/** Screens you navigate *between*: dashboard, tests, progress, vocabulary, account. */
export function AppShell({
  width = "content",
  children,
}: {
  width?: ShellWidth;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <AppNav />
      {/* Bottom nav is fixed on mobile — reserve the space it covers. */}
      <main className="flex-1 pb-24 md:pb-0">
        {/* The measure goes on an inner element, never on Container: Container
            already sets max-w-6xl, and two competing max-w utilities resolve by
            stylesheet order, not by which one you passed. */}
        <Container>
          <div className={cx("mx-auto w-full py-10 sm:py-12", WIDTHS[width])}>
            {children}
          </div>
        </Container>
      </main>
    </div>
  );
}

/**
 * Screens you move *through*: onboarding, the pre-test briefing, the sitting.
 * Nav is withheld on purpose — wandering off mid-flow loses your place, and in
 * the exam it would break the sitting.
 */
export function FocusShell({
  width = "form",
  children,
}: {
  width?: ShellWidth;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="border-b border-border/70">
        <Container className="flex h-16 items-center">
          <Wordmark />
        </Container>
      </div>
      <main className="flex flex-1 flex-col">
        <Container className="flex flex-1 flex-col">
          <div
            className={cx("mx-auto w-full flex-1 py-10 sm:py-12", WIDTHS[width])}
          >
            {children}
          </div>
        </Container>
      </main>
    </div>
  );
}

/**
 * Screen title block. Children are the actions that sit beside the title —
 * passed as elements rather than an `actions` render prop
 * (vercel-composition-patterns: patterns-children-over-render-props).
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="enter mb-8" style={{ ["--i" as string]: 0 }}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && (
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {eyebrow}
            </p>
          )}
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
        </div>
        {children && <div className="flex items-center gap-3">{children}</div>}
      </div>
      {lead && (
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
          {lead}
        </p>
      )}
    </header>
  );
}
