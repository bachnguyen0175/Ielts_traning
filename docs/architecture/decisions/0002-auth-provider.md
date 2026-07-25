# ADR-0002: Auth provider

> Status: Accepted (BE phase) — Auth.js (NextAuth v5) + magic-link email (Resend)
> Date: 2026-07-25 (revised 2026-07-26)

## Context

FE phase is live (guest-first, localStorage). Progress must now persist per user
across devices, which needs authentication. Next.js App Router on Vercel,
solo-maintained, private now but heading public. Google OAuth was the initial
pick but the maintainer has **no access to Google Cloud Console**, so we chose an
email-based method instead.

## Decision

**Auth.js (NextAuth v5)** with **magic-link email sign-in via the Resend
provider**. Sessions persist in Neon Postgres via the **Auth.js Drizzle adapter**
(database session strategy; see [ADR-0003](./0003-database.md)).

- **Passwordless:** enter email → one-time link → signed in. No passwords to
  store, reset, or rate-limit — less code and less security surface than
  credentials.
- **Guest-first preserved:** anonymous play still works; sign-in is optional and
  unlocks cross-device persistence. On first sign-in, migrate the guest's
  localStorage progress into their account (best-effort, one-time).
- Email delivery via Resend (`AUTH_RESEND_KEY`). Test sender
  `onboarding@resend.dev` needs no domain (delivers only to the account owner);
  swap for a verified-domain sender before real users.

## Alternatives considered

- **Magic link + Resend (chosen)** — passwordless, secure, minimal code, keeps
  the DB-session design; needs one easy Resend account (free, no domain to test).
- **Google OAuth** — first choice, but **no Google Cloud Console access**. Dropped.
- **Email + password (Credentials)** — zero external accounts, but we'd own
  hashing/reset/rate-limiting, and it forces JWT sessions (drops DB sessions).
  Rejected: more code, more security burden.
- **GitHub OAuth** — trivial to create, but dev-centric; weak fit for students.
- **Sign in with Vercel** — end users won't have Vercel accounts. Rejected.

## Consequences

- Secrets: `AUTH_SECRET` (generated) + `AUTH_RESEND_KEY` (from Resend) in
  `.env.local` and on Vercel. No Google credentials needed.
- Uses the `verificationToken` + `session` adapter tables already migrated.
- **Next.js 16** uses `proxy.ts` (not `middleware.ts`) for session keep-alive —
  add later if needed.
- More sign-in methods can be added later without re-architecting.
- Implementation APIs (NextAuth v5, Resend provider, Drizzle adapter) grounded in
  current docs at build time — memorized APIs are stale.
