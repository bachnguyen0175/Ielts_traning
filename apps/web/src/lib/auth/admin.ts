import "server-only";
import { auth } from "@clerk/nextjs/server";

// Who may publish content for everyone else to see.
//
// Clerk user ids, comma-separated, in ADMIN_USER_IDS. Ids rather than emails:
// an id is stable, is what every other table already keys off, and cannot be
// changed by anyone but Clerk. The list is read server-side only and never
// reaches the browser — the client is told *whether* it is an admin, never who
// the admins are.
function adminIds(): string[] {
  return (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "");
}

/** The signed-in user's id when they may publish, otherwise null. */
export async function adminUserId(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;
  return adminIds().includes(userId) ? userId : null;
}
