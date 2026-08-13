# `content/authored/`

Markdown sources for **original or licensed** tests — the content that is
committed and deployed.

```bash
pnpm content:build content/authored/my-mock.test.md
```

Compiles to `apps/web/src/lib/content/authored/<id>.ts`, registers it in that
directory's `index.ts`, and surfaces it at `/tests`. Commit the markdown source
and both generated files.

- **Format:** [`docs/content-authoring-format.md`](../../docs/content-authoring-format.md)
- **Decision:** [ADR-0008](../../docs/architecture/decisions/0008-authored-content-pipeline.md)
- **Not this lane:** Cambridge material — gitignored, never deployed
  (see [`content/README.md`](../README.md))

Empty for now: the sample mock is still hand-written TypeScript
(`apps/web/src/lib/content/sample-mock.ts`), and whether it migrates here is an
open follow-up in ADR-0008. Its markdown equivalent lives at
`apps/web/src/lib/content/fixtures/sample-mock.test.md`, where it serves as the
parser's round-trip test.
