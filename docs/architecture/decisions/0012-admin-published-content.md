# ADR-0012: An admin publishes content to a shared library

- **Status:** accepted
- **Date:** 2026-09-14
- Supersedes nothing; qualifies [ADR-0007](./0007-client-data-sync.md).

## Context

Content reached a user three ways, all of them client-side: the built-in sample
mock, tests built from committed markdown, and papers the user imported into
their own browser. `/import` writes only to localStorage, which was deliberate —
imported material may be someone else's copyright, and keeping it on the user's
machine meant the product never redistributed it.

That leaves no way to offer a paper to everybody. Every user who wanted the same
test had to import the same file themselves.

## Decision

One account may publish a parsed `Test` for all signed-in users to sit.

- **Who.** `ADMIN_USER_IDS`, comma-separated Clerk user ids, read server-side
  only. Ids, not emails: an id is stable, is already what every table keys off,
  and cannot be changed by anyone but Clerk. The list never reaches the browser —
  the client is told *whether* it is an admin, never who the admins are.
- **What.** Exam markdown, parsed by the existing `parse-exam-md` and stored as
  one JSONB `Test` in `published_test`. No blob storage, so no Listening audio
  yet.
- **Where the guard is.** In the server action, from the Clerk session. Hiding
  the button is a courtesy; `publishTest` re-checks and returns false.
- **How it reaches a reader.** `published-tests.ts` is a pure external store
  mirroring `imported-tests.ts`, merged into `MockContentRepository`. It carries
  a `ready` flag because a fetched library and a missing test are the same empty
  result until the fetch lands.

## Consequences

**The data seam now has an asynchronous source.** `ContentRepository` stays
synchronous, and the store is filled before the lookup instead. Every screen
that resolves a test by id waits on `ready` first, or it will call a published
test missing on the first paint.

**Fetching is split from the store.** `published-tests.ts` imports no server
code; `published-tests-loader.ts` does. Without that split, `local.ts` — which
server components reach — pulled the server action, and through it the Neon
client, into everything that touched the data seam.

**The copyright posture changed, and this is the part to be honest about.**
Import being client-side was an architectural guarantee: the product *could not*
redistribute what a user supplied. Publishing is a deliberate hole in that
guarantee, opened on purpose. We chose no code guard on what may be published,
so the rule that deployed content is original or licensed is now kept by the
publisher, not by the design. Nothing in the code will stop a copyrighted paper
reaching every user.
