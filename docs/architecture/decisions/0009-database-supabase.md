# ADR-0009: Database — Supabase Postgres (supersedes ADR-0003)

> Status: Accepted — supersedes [ADR-0003](./0003-database.md)
> Date: 2026-08-13

## Context

[ADR-0003](./0003-database.md) chose **Neon Postgres + Drizzle ORM**, and
explicitly considered and set aside Supabase — the reasoning being that auth had
moved to Clerk ([ADR-0002](./0002-auth-provider.md)), so Supabase's bundled auth
was not needed.

That choice has been reversed: **Supabase is now the provisioned database.**

The application code has not followed. It still targets Neon:

- `apps/web/package.json` depends on `@neondatabase/serverless`
- `apps/web/src/lib/db/index.ts` builds the client with
  `drizzle(neon(process.env.DATABASE_URL!))` over `drizzle-orm/neon-http`

That driver speaks Neon's HTTP endpoint, **not** the Postgres wire protocol, so
it cannot connect to Supabase at all. The app is currently mis-wired against its
own database.

> **Recorded from a stated decision, not a verified one.** There are no `.env*`
> files in `apps/web`, so the provisioning could not be confirmed from the repo.
> If Supabase was not in fact provisioned, this ADR should be withdrawn and
> ADR-0003 restored to Accepted.

## Decision

**Supabase Postgres with Drizzle ORM**, over the `postgres-js` driver.

- **Supabase** — managed Postgres. Reached over its connection pooler for
  serverless request handlers, and over a direct connection for migrations.
- **Drizzle stays.** The ORM, the schema in `apps/web/src/lib/db/schema.ts`, and
  the checked-in SQL migrations are all unchanged — only the driver beneath them
  moves. Nothing about ADR-0003's schema reasoning is superseded.
- **Repository seam unchanged.** `ProfileRepository`, `AttemptRepository`,
  `VocabRepository` keep their interfaces; screens do not change
  ([ADR-0007](./0007-client-data-sync.md)).
- **Clerk remains the auth provider** ([ADR-0002](./0002-auth-provider.md)).
  Supabase Auth is **not** adopted; app tables continue to key off Clerk's
  `userId` text column. Supabase is used purely as a Postgres host.

## Alternatives considered

- **Stay on Neon** — zero migration work, and ADR-0003's reasoning still holds
  (serverless fit, Vercel Marketplace integration auto-injecting the connection
  string). Rejected only because Supabase is what is now provisioned.
- **Supabase with its JS client instead of Drizzle** — would discard the typed
  schema and the migration history for a REST-shaped API. Rejected.
- **Supabase Auth, replacing Clerk** — would consolidate vendors, but reopens a
  settled decision and rewrites every auth touchpoint. Rejected; out of scope.

## Consequences

**The code does not work until these land.** Migration checklist:

| # | Change | File |
|---|---|---|
| 1 | Swap driver: `drizzle-orm/neon-http` → `drizzle-orm/postgres-js` | `apps/web/src/lib/db/index.ts` |
| 2 | Drop `@neondatabase/serverless`, add `postgres` | `apps/web/package.json` |
| 3 | Point migrations at the **direct** connection, not the transaction pooler | `apps/web/drizzle.config.ts` |
| 4 | Set `DATABASE_URL` / `DATABASE_URL_UNPOOLED` on Vercel by hand | Vercel env |
| 5 | Migrate existing `profile` / `attempt` / `vocab` rows, if any exist on Neon | — |

Connection-mode notes that will bite if missed:

- Serverless handlers should use the **transaction pooler**; a `postgres-js`
  client on that mode must be created with prepared statements disabled, because
  transaction pooling does not support them.
- **Migrations must not run through the transaction pooler.** Use the direct
  connection (or session mode). This is the same pooled/unpooled split ADR-0003
  already assumed, so `DATABASE_URL_UNPOOLED` keeps its meaning.

Other consequences:

- **The Vercel Marketplace integration no longer manages env vars.** Neon
  auto-injected the connection string; Supabase credentials are set manually.
  See [`deploy.md`](../../deploy.md).
- **`docs/` references to Neon are now historical.** ADR-0003 is superseded but
  retained — its schema, repository-seam, content-snapshot, and Vercel Blob
  decisions all still stand; only the vendor changed.
- **Implementation APIs (Drizzle driver, Supabase connection strings) must be
  grounded in current docs at build time** — memorized APIs are stale, and the
  pooler hostnames and ports in particular change.
- **Follow-up:** until items 1–3 ship, any DB-backed feature is blocked. This
  includes the deferred content-upload screen discussed in
  [ADR-0008](./0008-authored-content-pipeline.md).
