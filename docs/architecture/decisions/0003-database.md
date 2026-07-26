# ADR-0003: Database

> Status: Accepted (BE phase) — Neon Postgres + Drizzle ORM
> Date: 2026-07-25

## Context

The data model ([data-model.md](../data-model.md)) is relational: users,
attempts, responses, submissions, plus saved vocabulary. FE phase persisted
these in localStorage behind a repository seam
(`apps/web/src/lib/data/*Repository`). BE phase swaps in durable storage. The app
runs on Vercel; auth ([ADR-0002](./0002-auth-provider.md)) needs the same DB.

## Decision

**Neon Postgres** (serverless, Vercel-native) with **Drizzle ORM**.

- **Neon** — serverless Postgres, generous free tier, provisioned via the Vercel
  Marketplace integration (auto-injects the connection string env var).
- **Drizzle** — lightweight, type-safe, serverless/edge-friendly, first-class
  Neon HTTP driver. SQL migrations checked in. (Originally also chosen for its
  Auth.js adapter; auth later moved to Clerk — see [ADR-0002](./0002-auth-provider.md).)
- **Repository seam unchanged:** implement `ProfileRepository`,
  `AttemptRepository`, `VocabRepository` against Drizzle behind the existing
  interfaces — screens don't change.
- **Content snapshot:** persist the answer key / scoring server-side; snapshot
  the sat test's scoring data into the attempt so results are reproducible and
  keys never reach the client before submit (enforces the deferred fidelity
  rule).
- **Audio (Speaking):** stored in **Vercel Blob** later; DB holds URLs + metadata.

## Alternatives considered

- **Neon + Drizzle (chosen)** — serverless fit, type-safety, minimal runtime.
- **Prisma** — heavier client/engine, less edge-friendly; rejected for Drizzle.
- **Supabase Postgres** — fine, but auth went to Clerk
  ([ADR-0002](./0002-auth-provider.md)), so no need for Supabase's bundle.

## Consequences

- Migration workflow via `drizzle-kit` (SQL migrations in the repo).
- `DATABASE_URL` (Neon) required locally (`.env.local`) and on Vercel.
- Auth moved to Clerk ([ADR-0002](./0002-auth-provider.md)); the Auth.js adapter
  tables were dropped. App tables now key off Clerk's `userId` string (no local
  user/session tables).
- Implementation APIs (Drizzle, Neon driver) grounded in current docs at build
  time — memorized APIs are stale.
