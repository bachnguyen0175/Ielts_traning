"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { contentRepo, attemptRepo } from "@/lib/data/client";
import { Pretest } from "./pretest";

const DEFAULT_TEST_ID = "sample-academic-1";

export function PretestClient() {
  const router = useRouter();
  const params = useSearchParams();
  const testId = params.get("test") ?? DEFAULT_TEST_ID;
  const test = contentRepo.getTest(testId);

  if (!test) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        That test could not be found.
      </p>
    );
  }

  const totalMin = Math.round(
    test.sections.reduce((s, x) => s + x.durationSeconds, 0) / 60
  );

  function start() {
    const attempt = attemptRepo().create(testId);
    router.push(`/mock/run?a=${attempt.id}`);
  }

  return (
    <Pretest
      testTitle={test.title}
      durationLabel={`about ${totalMin} minutes`}
      onStart={start}
    />
  );
}
