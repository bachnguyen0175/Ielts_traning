# Content

Test content for the platform, structured per
[`../docs/architecture/data-model.md`](../docs/architecture/data-model.md).

## Posture: PRIVATE study tool (2026-07-25)

Composed is a **private, personal** IELTS practice tool — **not** publicly
distributed. On that basis, ingesting official **Cambridge IELTS** content
(Cambridge 10–21) for the user's own practice is acceptable.

> ⚠️ **Never publish or distribute Cambridge content.** Cambridge IELTS material
> is copyrighted and actively enforced. If this product is ever made public,
> all Cambridge-derived content must be removed and replaced with original or
> licensed material. Keep the non-affiliation disclaimer regardless.

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
