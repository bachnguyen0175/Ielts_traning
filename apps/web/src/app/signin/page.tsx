import type { Metadata } from "next";
import { auth, signIn, signOut } from "@/auth";
import { Container } from "@/components/ui/container";
import { Wordmark } from "@/components/landing/wordmark";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to save your progress across devices.",
};

// Reads the session (cookies) → render dynamically.
export const dynamic = "force-dynamic";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  const { error } = await searchParams;
  const errorMessage = error
    ? error === "Verification"
      ? "That link has expired or was already used — request a new one below."
      : "We couldn't send your magic link. Please try again in a moment."
    : null;

  return (
    <main className="flex min-h-dvh flex-col">
      <div className="border-b border-border/70">
        <Container className="flex h-16 items-center">
          <Wordmark />
        </Container>
      </div>
      <Container className="w-full max-w-md flex-1 py-16">
        {session?.user ? (
          <div className="space-y-4 text-center">
            <h1 className="font-serif text-2xl font-semibold text-foreground">
              You&apos;re signed in
            </h1>
            <p className="text-sm text-muted-foreground">
              {session.user.email}
            </p>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button type="submit" variant="outline">
                Sign out
              </Button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            {errorMessage && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-[hsl(0_70%_40%)]"
              >
                {errorMessage}
              </div>
            )}
            <div className="space-y-2 text-center">
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
                Sign in to Composed
              </h1>
              <p className="text-sm text-muted-foreground">
                Save your progress across devices. We&apos;ll email you a magic
                link — no password needed.
              </p>
            </div>
            <form
              action={async (formData: FormData) => {
                "use server";
                await signIn("resend", {
                  email: String(formData.get("email")),
                  redirectTo: "/progress",
                });
              }}
              className="space-y-3"
            >
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                aria-label="Email address"
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <Button type="submit" variant="primary" className="w-full">
                Send magic link
              </Button>
            </form>
            <p className="text-center text-xs text-muted-foreground">
              You can keep practising as a guest — signing in just saves your
              progress.
            </p>
          </div>
        )}
      </Container>
    </main>
  );
}
