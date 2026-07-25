# Feature: Onboarding (`/start`)

> Status: 🟢 implemented (v1, 2026-07-25) · MVP · guest-first

## Decision (guest-vs-account fork → resolved)

**Guest-first.** No account is required to take a mock; progress persists locally
(localStorage). An optional "save to an account" flow arrives when the backend
lands. This unblocks the entire flow without auth.

## Behavior

- Two **optional** fields — **target band** and **test date** (ON-2/3) — captured
  via `ProfileRepository` (localStorage). Both skippable.
- **Start a mock** → saves any provided profile → routes to **`/tests`** (test
  library, where the user picks a test).
- **Skip for now** → routes to `/tests` without saving.
- Calm form altitude (no marketing motion). "No account needed — saved on this
  device" is stated up front.

## Implementation
- `app/start/page.tsx` (server, metadata) → `components/onboarding/onboarding-client.tsx`
  (router + repo) → `components/onboarding/onboarding-form.tsx` (presentational,
  `onStart(profile|null)` prop — testable without router mocking).
- Repos: `lib/data/{repositories,local,client}.ts` (mock/localStorage seam).

## Verification
- RTL: 4 tests (fields render, start-with-profile, skip, empty start).
- E2E: guest goal → `/tests`; skip → `/tests`; no console errors.
- Build + lint green.

## Open / deferred
- Real account creation → BE phase.
- Profile editing screen (ON-5) → later (values are re-editable by revisiting).
