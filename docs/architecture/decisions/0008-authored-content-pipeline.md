# ADR-0008: Authored content pipeline (markdown → committed `Test`)

> Status: Accepted (spec) — parser not yet implemented
> Date: 2026-08-13

## Context

The 2026-07-26 pivot to a **public product** (decision #5 in
[`docs/README.md`](../../README.md)) means deployed content must be original or
licensed. That leaves a gap:

- the Cambridge ingester (`content/ingest/`) covers **Cambridge** content — scraped,
  written to a gitignored `ingested/` directory, never committed, never
  deployed. It is a local-only dev aid and cannot serve real users.
- The only deployable test today is `apps/web/src/lib/content/sample-mock.ts` —
  **8 KB of hand-written TypeScript**, a single test, produced by hand.

Hand-authoring `Test` objects does not scale past one test. The type
(`packages/domain/src/types.ts`) demands bookkeeping a human gets wrong:
sequential question numbers across four sections, `range` tuples that must match
their question counts, per-group `answerMatch` objects, `selectCount` /
`acceptSet` / `acceptSetMember` for letter-set groups, and unique ids at four
nesting levels. A single mistyped number produces a test that compiles and mis-scores.

Content authors — including future non-TypeScript contributors — need a source
format that reads like a test, not like a data structure. That format also has
to stay reviewable in pull requests, since it carries answer keys.

## Decision

**Author tests in markdown; compile them to committed TypeScript.**

```
content/authored/<name>.test.md        source of truth, committed
        │  pnpm content:build
        ▼  apps/web/src/lib/content/parse-md.ts   (validates, then emits)
apps/web/src/lib/content/authored/<id>.ts     generated, committed
        ▼  authored/index.ts → AUTHORED_TESTS
apps/web/src/lib/data/local.ts → TESTS → MockContentRepository → /tests
```

- **Markdown dialect** — headings map to sections and passages, `[n-m] type`
  opens a question group, `n. stem = answer` writes a question. Fully specified
  in [`content-authoring-format.md`](../../content-authoring-format.md).
- **`answerMatch` is inferred from the question type**, not authored. Ten types,
  four match kinds, one lookup table. Overridable per group.
- **Validation gates the build.** Seventeen rules (contiguous numbering, answers
  present, letters within declared options, audio file exists, id collisions).
  Errors block emission; warnings do not, so drafts still compile.
- **Output is committed.** The generated `.ts` is checked in so the app builds
  with no parser dependency — Vercel runs `next build`, nothing else.
- **Delivery is a CLI**, `pnpm content:build <file>`. No upload UI, no database.
- **Two lanes, one seam.** The authored lane reuses the exact registry seam
  the ingester built for Cambridge, so screens are unchanged:

  | Lane | ADR | Source | Output | Git | Deployed |
  |---|---|---|---|---|---|
  | Cambridge | [`content/ingest/`](../../../content/ingest/README.md) | scraped HTML | `content/ingested/` | ignored | **never** |
  | Authored | 0008 | your markdown | `content/authored/` | **committed** | yes |

  Both produce the same `Test` type and both land in `TESTS`. The copyright
  posture is enforced by *which directory* a test compiles into.

## Alternatives considered

- **Hand-written TypeScript (status quo)** — no new machinery, full type safety
  at authoring time. Rejected: doesn't scale, and the type system cannot catch
  the errors that actually happen (a wrong answer letter, a duplicated question
  number, a `range` that disagrees with its questions).
- **JSON or YAML authoring** — no parser to write; JSON Schema could validate.
  Rejected: passage prose in JSON is unreadable and undiffable, and the author
  still hand-maintains every id, range, and `answerMatch`. This is what the
  Cambridge seed does, and it is unpleasant to edit.
- **Upload screen backed by the database** — nicest authoring UX, and content
  becomes editable in production without a deploy. **Deferred, not rejected.**
  It requires a `test` table, an admin-only route, an authorisation rule for who
  may upload, and — the real cost — turning `MockContentRepository.listTests()`
  and `.getTest()` from synchronous array lookups into async DB reads, which
  ripples through `/mock`, `/mock/run`, `/mock/results`, and `/mock/review`.
  None of that is needed to publish a test. The markdown parser this ADR
  introduces is the same parser such a screen would need, so building it first
  costs nothing later.
- **A CMS (Sanity, Contentful)** — solves authoring and hosting. Rejected: an
  external dependency and a recurring cost for content that changes rarely, plus
  answer keys would leave the repo.

## Consequences

- **Content becomes reviewable.** A new test arrives as a readable markdown diff
  in a pull request, answer keys included.
- **Generated files must never be hand-edited.** Each emitted `.ts` carries a
  header saying so; edits are lost on the next build. The markdown is the source
  of truth.
- **A new test surface.** The parser needs unit tests of its own. The strongest
  check available: re-express `sample-mock.ts` as markdown, compile it, and
  assert the result deep-equals the hand-written original.
- **The markdown dialect is now a compatibility surface.** Changing it breaks
  existing `.test.md` files. Additive changes only, or recompile every test.
- **`MockContentRepository` stays synchronous**, so no screen changes — the whole
  point of choosing the CLI over the upload screen.
- **Fidelity rules are unaffected.** Answer keys still ship to the client during
  the FE phase; this pipeline changes where content comes from, not when keys
  are revealed. The server-side-keys rule remains outstanding for the BE phase
  ([`docs/README.md`](../../README.md), fidelity rules).
- **Follow-ups:**
  1. Implement `parse-md.ts` + tests, `scripts/build-content.ts`,
     `authored/index.ts`; wire `AUTHORED_TESTS` into `local.ts`.
  2. Decide whether `sample-mock.ts` is migrated to markdown or left as the
     hand-written fixture the E2E suite depends on.
  3. Revisit the upload screen once there is a reason to edit content without a
     deploy.
