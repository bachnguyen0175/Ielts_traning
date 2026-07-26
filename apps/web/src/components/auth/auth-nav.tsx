import Link from "next/link";
import { auth, signOut } from "@/auth";

// Server component: shows Sign in, or the user's email + Sign out. Drop into a
// page header. Guest-first — signing in just persists progress across devices.
export async function AuthNav() {
  const session = await auth();

  if (session?.user) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="hidden max-w-[12rem] truncate text-muted-foreground sm:inline">
          {session.user.email}
        </span>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            Sign out
          </button>
        </form>
      </div>
    );
  }

  return (
    <Link
      href="/signin"
      className="text-sm font-medium text-primary underline-offset-4 hover:underline"
    >
      Sign in
    </Link>
  );
}
