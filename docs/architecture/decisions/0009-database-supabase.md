# ADR-0009: Database — Supabase Postgres ~~(supersedes ADR-0003)~~

> Status: **WITHDRAWN — recorded in error (2026-08-13).**
> [ADR-0003](./0003-database.md) stands: **Neon Postgres + Drizzle ORM**.
> Date: 2026-08-13

## What happened

This ADR was written on the strength of a statement that Supabase had been
provisioned. It was never verified — the repo has no `.env*` files, and the
original text said so explicitly, adding that it "should be withdrawn and
ADR-0003 restored to Accepted" if the premise turned out to be wrong.

It was wrong. Checking the deployment settled it:

```
$ vercel env ls          # project ielts-traning-web-nhgz, 25 variables
NEON_PROJECT_ID          Production, Preview, Development    19d ago
NEON_AUTH_BASE_URL       Production, Preview, Development    19d ago
VITE_NEON_AUTH_URL       Production, Preview, Development    19d ago
DATABASE_URL             Production, Preview, Development    19d ago
DATABASE_URL_UNPOOLED    Production, Preview, Development    19d ago
```

Three Neon-specific variables, **zero** Supabase variables, and the
`DATABASE_URL` / `DATABASE_URL_UNPOOLED` pair that ADR-0003 described the Neon
Vercel Marketplace integration auto-injecting. The database is Neon and has
been for nineteen days.

## Consequences

- **Reverted:** commit `5dad3ab` swapped `drizzle-orm/neon-http` for
  `postgres-js`. Reverted in full — driver, dependency, and config comment.
- **ADR-0003 restored to Accepted.** Its choice of the Neon HTTP driver is
  correct and deliberate: stateless, no TCP connection per invocation, which is
  the right fit for serverless handlers. `postgres-js` would have worked against
  Neon over the wire protocol, so this was never an outage — but it was a
  regression against the reasoning ADR-0003 recorded.
- **Retained, not deleted**, per the rule in [`README.md`](./README.md): an ADR
  trail that shows a decision made on bad information and then corrected is
  worth more than one that quietly erases it.

## For next time

Verify the premise before recording a decision that supersedes an accepted one.
The check costs one command:

```
vercel env ls
```

Variable *names* are enough to identify a vendor, so nothing secret has to be
pulled or pasted to answer the question.

## If Supabase is ever genuinely adopted

Supersede ADR-0003 with a **new** ADR (0010+), not this one. The migration work
it described was accurate as far as it went — `postgres-js` driver,
`prepare: false` for the transaction pooler, migrations on the direct
connection, manual Vercel env vars — and can be lifted from this file's history.
