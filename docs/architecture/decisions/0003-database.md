# ADR-0003: Database

> Status: 🔴 Proposed / open
> Date: 2026-07-25

## Context

The data model ([data-model.md](../data-model.md)) is relational: users,
attempts, tests, sections, questions, responses, submissions. We need durable
storage plus blob storage for audio.

## Decision

**Deferred to implementation, pending finalized feature scope** (2026-07-25).
The schema is validated against a real Reading test, but the full feature set
isn't settled — and storage requirements (relational depth, blob needs,
analytics) depend on it. We choose the database once scope is locked rather than
pick for requirements we haven't defined. Leaning relational (Postgres); blob
storage likely Vercel Blob.

## Alternatives considered

- **Postgres (e.g. Neon on Vercel Marketplace)** — fits the relational model,
  serverless-friendly.
- **Other managed SQL / ORM combos** — evaluate DX (Prisma/Drizzle) alongside.

## Consequences

- ORM choice affects migration workflow and type-safety.
- Audio blobs stored separately; DB holds URLs + metadata.
- Decide whether to snapshot test-version content into attempts (recommended).
