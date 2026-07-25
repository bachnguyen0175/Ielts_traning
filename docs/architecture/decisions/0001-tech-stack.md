# ADR-0001: Next.js + Vercel + Vercel AI SDK

> Status: Accepted
> Date: 2026-07-25

## Context

Greenfield IELTS practice app. We need a full-stack web framework, a hosting
target with easy preview deployments, and an AI capability path for later
Writing/Speaking scoring. The development environment is already provisioned for
Vercel.

## Decision

- **Next.js (App Router)** as the full-stack framework.
- **Vercel** for hosting and preview deployments.
- **Vercel AI SDK** as the AI integration layer — provisioned now, but used
  starting in **Phase 2** (Writing scoring), not in the MVP.

## Alternatives considered

- **Separate SPA + standalone API** — more moving parts, no clear benefit at this
  scale; rejected for MVP.
- **Defer all AI choices** — but keeping the SDK in the stack now avoids rework
  when scoring lands.

## Consequences

- Server components / route handlers host the authoritative timing + answer-key
  logic (must not leak to the client).
- AI SDK provider/model choices are deferred to a Phase-2 ADR.
- Blob storage (audio) and database remain open decisions
  ([0003](./0003-database.md)); Vercel Blob is a natural default for audio.
