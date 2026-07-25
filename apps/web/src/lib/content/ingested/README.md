# Locally-ingested tests (gitignored data)

`index.ts` (committed) loads every `*.data.json` in this folder into
`INGESTED_TESTS`. Those `*.data.json` files are **gitignored** — they contain
Cambridge passage prose and question wording, which we ingest for **private
study only** and never commit or distribute (see [`content/README.md`](../../../../../content/README.md)).

- Generate them with the ingester: `content/ingest/` (see its README).
- On a fresh clone (no data files) `INGESTED_TESTS` is `[]`, so the app still
  builds and the sample mock is the only test.
