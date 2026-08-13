# Locally-ingested tests (gitignored data)

`index.ts` (committed) exports `INGESTED_TESTS`. Its **committed value is `[]`**,
so a fresh clone / Vercel build succeeds with only the sample mock.

The `*.data.json` files here are **gitignored** — they hold Cambridge passage
prose + question wording, ingested for **private study only**, never committed or
deployed (see [`content/README.md`](../../../../../../content/README.md) + ADR-0006).

## Restoring Cambridge tests locally

```bash
python3 content/ingest/ingest.py --volume 15 --test 1 \
  --seed content/seeds/cambridge15-academic-test1.reading.json
```

The ingester writes the gitignored `*.data.json` **and** regenerates this
`index.ts` to import it, then runs `git update-index --skip-worktree index.ts`
so the local edit is invisible to git. → Cambridge is playable locally; git and
any deployment stay clean.

> Requires `index.ts` to be committed (as `[]`) first, so skip-worktree can
> protect the local edit. If you ever need to commit a real change to `index.ts`,
> undo with `git update-index --no-skip-worktree index.ts`.
