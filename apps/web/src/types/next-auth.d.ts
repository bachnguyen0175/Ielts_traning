import type { DefaultSession } from "next-auth";

// Expose `id` on the session user (populated by the session callback in auth.ts).
declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"];
  }
}
