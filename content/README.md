# Content

Test content for the platform, structured per
[`../docs/architecture/data-model.md`](../docs/architecture/data-model.md).

## Posture: PUBLIC product (2026-07-26 pivot)

Composed is now intended as a **public product** other people sign up for
(revised from the original "private personal tool"). That makes the copyright
line **binding, not aspirational**:

> ⚠️ **Deployed content must be original or licensed. Cambridge material is
> NEVER deployed.** Cambridge IELTS content (10–21) is copyrighted and actively
> enforced; a public product cannot ship it without a licence. Keep the
> non-affiliation disclaimer regardless.

The Cambridge **ingester below stays as a local-only dev aid** — its output is
gitignored and never reaches a deployment (the same guard, now a permanent
product rule). Treat any local Cambridge ingestion as the maintainer's own
personal study use, at their responsibility — it must not feed the public build.

## `seeds/`

Reference seeds — hand-verified **structure + answer keys** (no prose). They are
the source of truth the ingester merges prose/stems onto (see
`cambridge15-academic-test1.reading.json`).

## `ingest/`

The ingester ([`ingest/README.md`](./ingest/README.md)): fetches one
`ieltstrainingonline.com` reading page, parses prose + question stems, merges
onto a seed's answer keys, and writes a playable `Test` JSON to
`apps/web/src/lib/content/ingested/<id>.reading.data.json`. Committed code holds
no prose; its output is gitignored. See
[ADR-0006](../docs/architecture/decisions/0006-content-ingestion.md).

## `apps/web/src/lib/content/`

Shippable-in-app content (typed `Test` objects) surfaced through the test
library:
- `sample-mock.ts` — original, safe-for-any-use sample (committed).
- `ingested/*.data.json` — Cambridge-derived tests, **gitignored, private use
  only** (see posture above); loaded via `ingested/index.ts`.
