# Content

Test content for the platform, structured per
[`../docs/architecture/data-model.md`](../docs/architecture/data-model.md).

## Posture: PUBLIC product (2026-07-26 pivot)

Composed is now intended as a **public product** other people sign up for
(revised from the original "private personal tool"). That makes the copyright
line **binding, not aspirational**:

The Cambridge **ingester below stays as a local-only dev aid** — its output is
gitignored and never reaches a deployment (the same guard, now a permanent
product rule). Treat any local Cambridge ingestion as the maintainer's own
personal study use, at their responsibility — it must not feed the public build.

## `seeds/` — **gitignored**

Reference seeds — hand-verified **structure + answer keys** (no passage prose).
`ingest.py` merges crawled prose onto them.

Consequence: a fresh clone has no seed, so **`ingest.py` cannot run without
one**. Use `ingest_auto.py`, which is seed-free and needs a seed only for its
optional `--validate` cross-check.

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
