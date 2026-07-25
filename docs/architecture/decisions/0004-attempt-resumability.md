# ADR-0004: Attempt resumability

> Status: Accepted (mock/FE phase) — "resume with elapsed-time enforcement"
> Date: 2026-07-25

## Context

Real IELTS sittings cannot be paused or resumed. But browsers crash, tabs close,
and networks drop during a 2h45m session. Strict authenticity conflicts with not
punishing users for technical failures.

## Decision

**Resume with elapsed-time enforcement.** On reconnect the section timer is
recomputed from the persisted `startedAt` (the clock keeps running as if it never
stopped) — preserving timing pressure while surviving crashes.

**Implemented (FE/mock phase):** the timer is anchored to `startedAt` persisted
per section in the `AttemptRepository`; `@composed/domain` timing math derives
remaining time, and answers autosave on every change. A reload resumes mid-mock
with the clock still running (verified by E2E). In the BE phase the *server*
becomes the timing authority using the same anchoring.

## Alternatives considered

- **No resume (max fidelity)** — a dropped session is a failed attempt. Authentic
  but harsh; risks user churn.
- **Resume with elapsed-time enforcement** — allow reconnection, but the timer
  keeps counting as if the clock never stopped. Preserves timing pressure while
  surviving crashes. (Leaning here.)
- **Free pause/resume** — most forgiving, least authentic. Rejected — breaks the
  core thesis.

## Consequences

- Server must be the timing authority (elapsed time anchored to `startedAt`), not
  a client countdown.
- Autosave cadence for answers must be frequent enough to survive a crash.
