import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/lib/cx";

// Surface primitives. Deliberately plain composition rather than a context —
// nothing here is shared state, so a provider would be ceremony (see
// .claude/skills/vercel-composition-patterns/rules/architecture-compound-components.md,
// which reserves context for genuinely shared state).

const TONES = {
  /** Default surface: sits on the page background. */
  plain: "border-border bg-card/70",
  /** Draws the eye — for the one thing that matters most on a screen. */
  raised: "border-border bg-card/90 shadow-lg shadow-primary/5",
  /** Recedes — for supporting detail and inert states. */
  quiet: "border-border/70 bg-muted/30",
  /** Something needs attention but nothing is broken. */
  notice: "border-accent/30 bg-accent/[0.07]",
} as const;

export type CardTone = keyof typeof TONES;

export function Card({
  tone = "plain",
  className,
  style,
  children,
}: {
  tone?: CardTone;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div
      style={style}
      className={cx(
        "rounded-2xl border backdrop-blur-sm",
        TONES[tone],
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Card that is itself the link. Separate component rather than an `href` prop
 * on Card so the hover/press affordances only exist where they are true.
 */
export function CardLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className={cx(
        "group block cursor-pointer rounded-2xl border border-border bg-card/70 backdrop-blur-sm",
        "transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-lg",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      {children}
    </a>
  );
}

export function CardBody({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cx("p-5 sm:p-6", className)}>{children}</div>;
}

export function CardHeader({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cx("border-b border-border/70 px-5 py-4 sm:px-6", className)}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <h3
      className={cx(
        "font-serif text-lg font-semibold tracking-tight text-foreground",
        className,
      )}
    >
      {children}
    </h3>
  );
}

/** Small uppercase label — the "eyebrow" above a heading or stat. */
export function Eyebrow({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <p
      className={cx(
        "text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
}
