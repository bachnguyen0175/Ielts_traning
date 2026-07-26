import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to save your progress across devices.",
};

export default function SignInPage() {
  return (
    <AuthShell heading="Sign in to Composed">
      <SignIn
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/dashboard"
        appearance={{ elements: { headerTitle: "hidden", headerSubtitle: "hidden" } }}
      />
    </AuthShell>
  );
}
