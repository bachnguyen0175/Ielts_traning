"use client";

import Link from "next/link";
import { useAuth, UserButton } from "@clerk/nextjs";

// Auth-aware account control (Clerk v7), client-side so static pages (landing,
// /tests) stay prerendered — it hydrates and reads auth from ClerkProvider.
// Signed out → "Sign in" link; signed in → UserButton (avatar + sign out).
export function AccountControl() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <div aria-hidden="true" className="h-7 w-16" />;
  }

  return isSignedIn ? (
    <UserButton />
  ) : (
    <Link
      href="/sign-in"
      className="text-sm font-medium text-primary underline-offset-4 hover:underline"
    >
      Sign in
    </Link>
  );
}
