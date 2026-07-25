# System Design

> Status: 🟡 draft

## Repository layout

pnpm-workspace monorepo — the app lives in `apps/web`; shared code goes in
`packages/` when needed. See [ADR-0005](./decisions/0005-repo-structure.md).

## Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | **Next.js (App Router)** | Full-stack React; server components + route handlers |
| Hosting | **Vercel** | Preview deployments, edge network |
| AI | **Vercel AI SDK** | Provisioned now; used for scoring in **P2+**, not MVP |
| Auth | 🔴 TBD | See [ADR-0002](./decisions/0002-auth-provider.md) |
| Database | 🔴 TBD | Needs relational modeling — see [ADR-0003](./decisions/0003-database.md) |
| Blob storage | 🔴 TBD | Speaking audio + Listening/passage assets — likely Vercel Blob |

## High-level components

```
┌─────────────────────────────────────────────┐
│                  Client (Next.js)            │
│  ┌───────────────┐  ┌──────────────────────┐ │
│  │ Test Player   │  │ Timing Engine        │ │
│  │ (per-section  │◄─┤ (section timers,     │ │
│  │  UIs)         │  │  play-once, advance) │ │
│  └───────┬───────┘  └──────────────────────┘ │
│          │ answers / submissions              │
└──────────┼──────────────────────────────────┘
           ▼
┌─────────────────────────────────────────────┐
│          Server (Route Handlers / RSC)       │
│  ┌──────────┐ ┌───────────┐ ┌─────────────┐  │
│  │ Attempt  │ │ Auto-     │ │ Submission  │  │
│  │ service  │ │ scorer    │ │ capture     │  │
│  │          │ │ (L/R key) │ │ (W text,    │  │
│  │          │ │           │ │  S audio)   │  │
│  └────┬─────┘ └─────┬─────┘ └──────┬──────┘  │
└───────┼─────────────┼──────────────┼─────────┘
        ▼             ▼              ▼
   ┌─────────┐  ┌──────────┐   ┌──────────┐
   │   DB    │  │ Band     │   │  Blob    │
   │(attempts│  │ conversion│  │ storage  │
   │ answers)│  │ tables    │  │ (audio)  │
   └─────────┘  └──────────┘   └──────────┘

   (P2+) AI SDK ──► Writing/Speaking band scoring
```

## Key flows

**Sitting a mock**
1. User starts an attempt → server creates an `Attempt`, loads the `Test`.
2. Client runs each section under the timing engine; answers autosave.
3. On section expiry/submit → answers persisted; client advances (no return).
4. Writing text and Speaking audio uploaded to blob + linked to the attempt.
5. On completion → L/R auto-scored from the answer key; results screen renders.

**Scoring (P2+)**
- Writing submissions dispatched to an AI scorer that returns a band per
  criterion with evidence; stored against the submission.

## Critical design constraints

- **Anti-cheat / fidelity:** the timing authority and answer key must live
  server-side. The client cannot be trusted to enforce play-once or reveal
  correct answers. (Client enforces UX; server enforces truth.)
- **Audio integrity:** Listening assets streamed such that they can't be trivially
  re-fetched to "replay"; play-once is a UX rule but the *experience* should
  discourage circumvention.
- **Resumability vs. authenticity:** 🔴 open — do we allow resuming an
  interrupted mock (real tests don't)? See [ADR-0004](./decisions/0004-attempt-resumability.md).

## Non-functional

- Latency matters most for audio start and answer autosave.
- Data retention/privacy for audio recordings needs a policy (🔴 TBD).
