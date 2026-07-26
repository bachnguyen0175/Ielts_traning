# ADR-0007: Client data persistence & real-time sync

> Status: Accepted (BE phase 3)
> Date: 2026-07-26

## Context

FE screens read/write through **synchronous localStorage** repositories
(`apps/web/src/lib/data`). BE phase 3 adds real persistence (Neon, per user) via
[ADR-0002](./0002-auth-provider.md)/[ADR-0003](./0003-database.md). The DB is
server-side (async); the player's autosave fires on every answer/flag. The
maintainer chose **full real-time sync** (resume a half-finished mock on another
device), not just save-point sync.

## Decision

**Keep localStorage as the instant local store; mirror to Neon via server
actions.** Guests stay entirely local; signed-in users sync.

- **Server actions** (`lib/actions/db-actions.ts`) are the only client→DB path.
  `userId` always comes from `auth()` server-side; every repo query is scoped by
  it (a client cannot act as another user). Repos live in `lib/db/repos.ts`
  (`server-only`).
- **Session id:** a `session` callback surfaces `user.id` (database-session
  strategy omits it by default); actions return null/false for guests so callers
  fall back to localStorage.
- **Vocab / progress:** an async store/branch routes guest→localStorage vs
  signed-in→actions behind the same shape.
- **Attempts (hot path):** the player keeps writing localStorage instantly. A
  **debounced write-through** (~1.5s, immediate flush on section boundary/finish)
  mirrors the attempt to Neon; on load a signed-in user **hydrates** localStorage
  from the DB copy (cross-device resume). Last-write-wins on the whole attempt
  doc.
- **Guest→account migration:** first signed-in load imports localStorage
  (profile/attempts/vocab) into the DB, once, per-user flag, idempotent.

## Alternatives considered

- **Save-point sync only** — simpler, but no mid-mock cross-device resume.
  Rejected per the maintainer's choice.
- **Fully async repository interfaces everywhere** — cleanest single-source, but
  reworks every screen's data calls and makes the player network-chatty. Rejected.
- **Continuous per-keystroke server writes** — no local buffer; network per
  answer, fragile offline. Rejected in favour of debounced write-through.

## Consequences

- The player's instant-autosave UX is unchanged; sync is additive.
- Last-write-wins can lose an unsynced edit on another device within the debounce
  window (seconds) — acceptable; no per-field merge.
- **Still deferred:** server-side scoring/answer-keys (fidelity rule — scoring is
  still client-side); profile edits while already signed in still write local
  (migration covers the initial import).
