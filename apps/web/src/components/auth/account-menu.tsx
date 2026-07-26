"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

// Unified, auth-aware account control — works on every page (including static
// ones) because it reads the session client-side via SessionProvider. Shows
// "Sign in" when signed out, and your account + Sign out when signed in.
export function AccountMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div
        aria-hidden="true"
        className="h-5 w-20 animate-pulse rounded-full bg-muted"
      />
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2.5">
        <Link
          href="/progress"
          className="hidden max-w-[12rem] items-center gap-2 truncate rounded-full border border-border bg-card/70 px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted/60 sm:inline-flex"
        >
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
            {(session.user.email ?? "?").charAt(0).toUpperCase()}
          </span>
          <span className="truncate">{session.user.email}</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/signin"
      className="text-sm font-medium text-primary underline-offset-4 hover:underline"
    >
      Sign in
    </Link>
  );
}
