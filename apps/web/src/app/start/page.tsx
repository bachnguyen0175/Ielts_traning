import type { Metadata } from "next";
import { FocusShell } from "@/components/ui/app-shell";
import { Card, CardBody } from "@/components/ui/card";
import { OnboardingClient } from "@/components/onboarding/onboarding-client";
import { LockIcon, HeadphonesIcon, ClockIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Start a mock",
  description: "Set your goal and begin an authentic IELTS Academic mock exam.",
};

const CONDITIONS = [
  {
    Icon: HeadphonesIcon,
    title: "Audio plays once",
    detail: "No pause, no rewind — exactly like the hall.",
  },
  {
    Icon: ClockIcon,
    title: "The clock is real",
    detail: "Each section runs to its official timing.",
  },
  {
    Icon: LockIcon,
    title: "No answers until the end",
    detail: "Nothing is marked until you submit the whole test.",
  },
];

export default function StartPage() {
  return (
    <FocusShell width="content">
      {/* No aurora here: unclipped, it washes the whole column and drops the
          lead copy's contrast. The raised card carries the focus instead. */}
      <div className="mx-auto flex max-w-xl flex-col justify-center py-4">
        <span
          className="enter inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground"
          style={{ ["--i" as string]: 0 }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          No account needed — saved on this device
        </span>

        <h1
          className="enter mt-6 font-serif text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl"
          style={{ ["--i" as string]: 1 }}
        >
          Let&rsquo;s set you up.
        </h1>
        <p
          className="enter mt-3 text-base leading-relaxed text-muted-foreground"
          style={{ ["--i" as string]: 2 }}
        >
          Two quick, optional questions — then straight into your mock. You can
          change both of these later.
        </p>

        {/* Staggered after the copy so the eye lands on the heading first. */}
        <Card tone="raised" className="enter mt-8" style={{ ["--i" as string]: 3 }}>
          <CardBody className="sm:p-8">
            <OnboardingClient />
          </CardBody>
        </Card>

        <div
          className="enter mt-10 border-t border-border/70 pt-6"
          style={{ ["--i" as string]: 4 }}
        >
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            What you&rsquo;re walking into
          </p>
          <ul className="mt-4 space-y-3.5">
            {CONDITIONS.map(({ Icon, title, detail }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm leading-relaxed">
                  <span className="font-medium text-foreground">{title}</span>
                  <span className="text-muted-foreground"> — {detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </FocusShell>
  );
}
