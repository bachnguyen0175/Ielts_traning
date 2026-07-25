# IELTS Training

An IELTS Academic practice platform built around **authentic test-day
conditions** — strict timing, play-once audio, and the computer-delivered
interface — so candidates rehearse the pressure of the real exam, not just the
content.

## Status

Early stage — establishing documentation before implementation.

## MVP

One authentic Academic **full mock exam** (Listening · Reading · Writing ·
Speaking) in a single sitting:

- **Listening & Reading** — auto-scored objectively from an answer key.
- **Writing & Speaking** — submissions captured (typed essays, recorded audio)
  for later review. AI band-scoring is a later phase.

## Tech stack

Next.js (App Router) · Vercel · Vercel AI SDK (used for scoring in a later phase).

## Repository layout

pnpm-workspace monorepo ([ADR-0005](./docs/architecture/decisions/0005-repo-structure.md)):

```
apps/web/      # the Next.js app
packages/      # shared code (added when needed)
content/       # seed test content
docs/          # product + architecture docs
```

Run from the repo root (scripts delegate to `apps/web`):

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm test       # unit (Vitest)
pnpm test:e2e   # end-to-end (Playwright)
pnpm build
```

> **Deploying to Vercel:** set the project **Root Directory** to `apps/web`.

## Documentation

See [`docs/`](./docs/README.md) for vision, scope, IELTS domain model,
architecture, ADRs, and per-skill feature specs. Start with
[`docs/README.md`](./docs/README.md).

## Contributing

Agent/coding conventions live in [`CLAUDE.md`](./CLAUDE.md).
