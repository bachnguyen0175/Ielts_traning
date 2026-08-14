# Architecture Decision Records (ADRs)

One file per significant, hard-to-reverse decision. An ADR captures the
**context**, the **decision**, and the **consequences** — so future us
remembers *why*, not just *what*.

## Format

Use [`0000-template.md`](./0000-template.md). Number sequentially. Never delete
an ADR — supersede it with a new one and mark the old as `Superseded`.

## Index

| # | Decision | Status |
|---|----------|--------|
| [0001](./0001-tech-stack.md) | Next.js + Vercel + AI SDK | Accepted |
| [0002](./0002-auth-provider.md) | Auth — Clerk (was Auth.js/Resend) | Accepted |
| [0003](./0003-database.md) | Database — Neon Postgres + Drizzle ORM | Accepted |
| [0004](./0004-attempt-resumability.md) | Attempt resumability | Accepted (resume w/ elapsed-time) |
| [0005](./0005-repo-structure.md) | Repo structure — pnpm-workspace monorepo (`apps/web`) | Accepted |
| [0007](./0007-client-data-sync.md) | Client persistence & real-time sync (localStorage + server-action write-through) | Accepted |
| [0008](./0008-authored-content-pipeline.md) | Authored content pipeline (markdown → committed `Test`) | Accepted (spec) |
| [0009](./0009-database-supabase.md) | Database — Supabase Postgres | **Withdrawn** (recorded in error; 0003 stands) |
| [0010](./0010-app-shell-and-ui-foundation.md) | App shell (`AppShell` / `FocusShell`) + UI primitives | Accepted |
