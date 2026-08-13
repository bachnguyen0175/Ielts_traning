# Deployment

> Status: 🟢 v1 — Vercel, public, **sample content only**. Cambridge content is
> never deployed (copyright — see [`content/README.md`](../content/README.md),
> [mock-data-registry](./mock-data-registry.md)).

## What deploys

The public site serves **only original content** — the sample mock (all four
skills) + Vocabulary/Flashcards. The Cambridge `*.data.json` files are gitignored
**and** `ingested/index.ts` defaults to `[]`, so ingested content **cannot** reach
a deployment. This is intentional and non-negotiable while the app is public.

## Deploy from GitHub (the safe path)

Deploy from the **Git integration**, not a local `vercel --prod`. Git builds the
*committed* rep. A local CLI deploy could upload gitignored files from disk — don't.

1. **vercel.com → Add New… → Project**.
2. **Import** `bachnguyen0175/Ielts_traning`.
3. Framework auto-detects **Next.js**. In the import screen set
   **Root Directory = `apps/web`** (see below).
4. **Environment variables** (BE phase — required for the app to run):
   - `DATABASE_URL` (+ `DATABASE_URL_UNPOOLED`) — auto-injected by the Neon
     Marketplace integration.
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`,
     `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
     — Clerk keys (⚠️ Clerk verifies the secret on every request; an invalid one
     500s every page). Set via `vercel env add … production` piped from
     `.env.local`.
5. **Deploy.** Pushes to `main` then auto-deploy.

## Config

- **Root Directory = `apps/web` is a Project Setting, NOT `vercel.json`.** Vercel
  rejects `rootDirectory` in `vercel.json` (`Invalid request: should NOT have
  additional property rootDirectory`). Set it in the import screen, or later at
  **Settings → Build & Deployment → Root Directory**. There is no `vercel.json`
  in this repo — none is needed.
- pnpm workspace + Next.js are auto-detected; install runs from the repo root so
  the `@composed/domain` workspace package resolves. Keep the install command at
  the default `pnpm install`.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Module not found: *.data.json` | Stale checkout with the old loader — ensure `ingested/index.ts` is the committed `[]` default. |
| `@composed/domain` not found at install | Unset any custom Install Command; let Vercel run default `pnpm install` from the repo root. |
| Build can't find the app | Set **Settings → Build & Deployment → Root Directory = `apps/web`**. |

## Pre-deploy gate

Confirm a clean checkout builds without ingested content (mirrors Vercel):

```bash
pnpm test && pnpm lint && pnpm build   # with no *.data.json present → sample-only
```

## Going public with real content (future)

A public **product** cannot use Cambridge content without a licence. Replace it
with original or licensed passages, or licence from Cambridge, before relying on
ingested content in production. Optionally gate the whole app with Vercel
**Deployment Protection** (password) while it's pre-launch.
