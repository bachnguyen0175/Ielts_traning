import Link from "next/link";

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={["group inline-flex items-center gap-2", className]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="relative grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground">
        <span className="absolute h-1.5 w-1.5 rounded-full bg-accent" />
      </span>
      <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
        Composed
      </span>
    </Link>
  );
}
