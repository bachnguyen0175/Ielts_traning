import type { Attempt } from "@composed/domain";

export interface NextAction {
  label: string;
  href: string;
  hint: string;
}

/**
 * The single most useful next step for a returning user:
 * resume an in-progress mock if one exists, otherwise start a mock
 * (worded for first-timers vs. returners).
 */
export function nextAction(attempts: Attempt[]): NextAction {
  const inProgress = attempts.find((a) => a.status === "in_progress");
  if (inProgress) {
    return {
      label: "Resume your mock",
      href: `/mock/run?a=${inProgress.id}`,
      hint: "You have a mock in progress — the clock is still running.",
    };
  }
  const hasScored = attempts.some((a) => a.overall != null);
  return {
    label: hasScored ? "Start a new mock" : "Start your first mock",
    href: "/mock",
    hint: hasScored
      ? "Sit another full mock to keep your band trending up."
      : "Sit a full mock under authentic test-day conditions.",
  };
}
