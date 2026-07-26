import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Create an account to save your progress across devices.",
};

export default function SignUpPage() {
  return (
    <AuthShell heading="Create your account">
      <SignUp
        signInUrl="/sign-in"
        fallbackRedirectUrl="/progress"
        appearance={{ elements: { headerTitle: "hidden", headerSubtitle: "hidden" } }}
      />
    </AuthShell>
  );
}
