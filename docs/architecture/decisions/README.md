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
| [0002](./0002-auth-provider.md) | Auth provider | 🔴 Proposed / open |
| [0003](./0003-database.md) | Database choice | 🔴 Proposed / open |
| [0004](./0004-attempt-resumability.md) | Attempt resumability | Accepted (resume w/ elapsed-time) |
| [0005](./0005-repo-structure.md) | Repo structure — pnpm-workspace monorepo (`apps/web`) | Accepted |
| [0006](./0006-content-ingestion.md) | Cambridge content ingestion (seed-anchored, gitignored output) | Accepted |
