# ADR-0005: Repository structure — pnpm-workspace monorepo (`apps/web`)

> Status: Accepted
> Date: 2026-07-25

## Context

The Next.js app was initially scaffolded at the repo root, which cluttered a
repo that already has top-level `docs/` and `content/`. We researched 2026
best practices for structuring a Next.js project.

Findings:
- The dominant 2026 convention is a **pnpm-workspaces monorepo** with `apps/`
  (deployables) and `packages/` (shared code), optionally orchestrated by
  **Turborepo**.
- Every source cautions **against adopting monorepo machinery you don't need
  yet** ("start with 3–5 packages, not 50"; a monorepo earns its keep only with
  multiple apps or genuinely shared code).
- For a single full-stack Next.js app, the standard `app/` + `components/` +
  `lib/` structure — with Server Actions and `app/api/` as the "backend" — is
  usually sufficient; a separate FE/BE service split is often unnecessary.

## Decision

Adopt the **monorepo layout without the machinery**:

```
repo/
├── apps/
│   └── web/                 # the Next.js app (name: "web")
├── packages/                # (added when a shared package is needed)
├── content/                 # seed test content
├── docs/                    # product + architecture docs
├── package.json             # workspace root (private, delegating scripts)
└── pnpm-workspace.yaml       # packages: apps/*, packages/*
```

- **pnpm workspace** enabled now (`apps/*`, `packages/*`).
- **`packages/domain` now exists** (added 2026-07-25): IELTS types + the
  answer-matching scorer + band conversion + timing math, shared by the app and
  its tests. Consumed via `transpilePackages: ["@composed/domain"]`. Turborepo
  still deferred — pnpm `-r` filters suffice at this size.
- Root `package.json` holds delegating scripts (`pnpm dev` → `--filter web dev`).

## Alternatives considered

- **Keep app at root** — simplest, but clutters the root and doesn't scale to a
  second app/shared package. Rejected.
- **`web/` subfolder (no workspace)** — moves the app out of root but ignores the
  trending convention and gives no path to shared packages. Rejected.
- **Full monorepo now (Turborepo + empty `packages/`)** — the premature
  complexity the research warns against. Deferred until justified.

## Consequences

- **Vercel:** set the project's **Root Directory to `apps/web`** when deploying.
- Run everything from the repo root via delegating scripts, or with
  `pnpm --filter web <script>`.
- Adding a shared package later: create `packages/<name>`, add Turborepo if task
  orchestration/caching is wanted. Revisit this ADR then.

## Sources

- Code With Seb — Turborepo vs Nx in 2026: https://www.codewithseb.com/blog/monorepo-turborepo-nx-react-nextjs-guide
- Vercel — Turborepo monorepo template: https://vercel.com/templates/next.js/monorepo-turborepo
- PkgPulse — JavaScript Monorepos 2026, best practices & pitfalls: https://www.pkgpulse.com/guides/javascript-monorepos-2026-best-practices-pitfalls
- SoftwareMill — Modern Full Stack Architecture with Next.js 15+: https://softwaremill.com/modern-full-stack-application-architecture-using-next-js-15/
