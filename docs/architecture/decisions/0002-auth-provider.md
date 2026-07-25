# ADR-0002: Auth provider

> Status: 🔴 Proposed / open
> Date: 2026-07-25

## Context

Attempts must persist per user, so the MVP needs authentication. Options range
from a managed provider to a self-hosted library.

## Decision

**Open.** To be decided before implementing account persistence.

## Alternatives considered

- **Auth.js (NextAuth)** — self-hosted, flexible, free; more wiring.
- **Clerk** — managed, fast to integrate, Vercel Marketplace native; cost at scale.
- **Sign in with Vercel** — OAuth via Vercel accounts; audience-fit is questionable
  for general test-takers.

## Consequences

- Choice affects session handling in server components and route protection.
- Revisit once we know monetization/gating requirements.
