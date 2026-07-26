import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "@/lib/db/schema";

// Auth.js (NextAuth v5) — magic-link email via Resend, sessions in Neon Postgres
// through the Drizzle adapter. See ADR-0002. Guest-first: sign-in is optional.
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "database" },
  callbacks: {
    // Database-session strategy doesn't expose user.id on the session by
    // default; our server actions scope every query by it, so surface it here.
    session({ session, user }) {
      if (session.user && user) session.user.id = user.id;
      return session;
    },
  },
  // Send auth errors + the "check your email" step to our own /signin page
  // instead of Auth.js's default routes (which render a bare 500 in App Router).
  pages: { error: "/signin", verifyRequest: "/signin/check" },
  providers: [
    Resend({
      // Resend picks up AUTH_RESEND_KEY automatically. `onboarding@resend.dev`
      // is Resend's test sender — no domain verification needed, but it only
      // delivers to the email on your Resend account. Swap for a verified-domain
      // sender before real users.
      from: "onboarding@resend.dev",
    }),
  ],
});
