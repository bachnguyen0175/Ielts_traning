# ADR-0002: Auth provider

> Status: Accepted (BE phase) — Clerk
> Date: 2026-07-25 (revised 2026-07-26: magic-link → Clerk)

## Context

Progress must persist per user across devices. The app is Next.js App Router on
Vercel. Auth requirements evolved through the BE phase:
- Google OAuth (first pick) — dropped: no Google Cloud Console access.
- Auth.js v5 + Resend magic-link — shipped, but the email round-trip felt manual
  and one-click social still needed a cloud console.
- The maintainer chose **Clerk** for managed auth with one-click social **without
  GCP** (Clerk's dev instances ship shared social credentials), email OTP, and
  polished prebuilt UI.

## Decision

**Clerk** (`@clerk/nextjs` v7) as the auth provider.

- `clerkMiddleware()` in **`proxy.ts`** (Next 16 renamed `middleware`→`proxy`);
  `ClerkProvider` in the root layout.
- Clerk's `<SignIn/>`/`<SignUp/>` hosted inside our split-screen **AuthShell** at
  `/sign-in` + `/sign-up`; `<UserButton/>` account control via a client
  `AccountControl` (`useAuth`) so the landing / test-library stay static.
- **User id = Clerk's `userId`** (a string). Server code reads it via
  `auth()` from `@clerk/nextjs/server`; app tables key off it (no local user
  table — see [ADR-0003](./0003-database.md)). Guest-first preserved.

## Alternatives considered

- **Clerk (chosen)** — managed, one-click social without GCP, email OTP, prebuilt
  UI; trade-off: third-party vendor, MAU-based pricing (free tier generous),
  identity lives off-platform.
- **Auth.js + Resend magic-link** — shipped then replaced: passwordless but a
  manual inbox round-trip; social still needed a cloud console.
- **Google / GitHub OAuth direct** — Google blocked (no GCP); GitHub dev-centric.

## Consequences

- Secrets: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` (+ sign-in/up
  URL vars) in `.env.local` and on Vercel. No `AUTH_SECRET`/`AUTH_RESEND_KEY`.
- Clerk verifies the secret on **every** request (handshake), so an invalid key
  500s every page — keys must be correct in every environment.
- Currently **development** Clerk keys (`pk_test`/`sk_test`) — fine for now; a
  public launch needs a Clerk **production** instance (own domain).
- Auth.js and its Drizzle adapter tables were removed.
