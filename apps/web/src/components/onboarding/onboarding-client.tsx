"use client";

import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/data/repositories";
import { profileRepo } from "@/lib/data/client";
import { OnboardingForm } from "./onboarding-form";

export function OnboardingClient() {
  const router = useRouter();

  function handleStart(profile: Profile | null) {
    if (profile && (profile.targetBand != null || profile.testDate)) {
      profileRepo().save(profile);
    }
    router.push("/tests");
  }

  return <OnboardingForm onStart={handleStart} />;
}
