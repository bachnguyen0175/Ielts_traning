import type { SectionScore } from "@composed/domain";
import { Button } from "@/components/ui/button";
import { Card, CardBody, Eyebrow } from "@/components/ui/card";
import { BandGauge } from "@/components/ui/band-gauge";
import { cx } from "@/lib/cx";
import { isFullLength } from "@/lib/scoring";
import {
  HeadphonesIcon,
  BookIcon,
  PenIcon,
  MicIcon,
  ArrowRightIcon,
} from "@/components/ui/icons";

const SKILLS = {
  listening: { label: "Listening", Icon: HeadphonesIcon },
  reading: { label: "Reading", Icon: BookIcon },
  writing: { label: "Writing", Icon: PenIcon },
  speaking: { label: "Speaking", Icon: MicIcon },
} as const;

function ScoredSkill({ result }: { result: SectionScore }) {
  const skill = SKILLS[result.skill as keyof typeof SKILLS];
  const Icon = skill?.Icon;
  const pct = result.max > 0 ? (result.raw / result.max) * 100 : 0;

  return (
    <Card>
      <CardBody className="p-5">
        <div className="flex items-center gap-4">
          {result.band != null && (
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <span className="font-serif text-xl font-semibold tabular-nums">
                {result.band.toFixed(1)}
              </span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 font-serif text-lg font-semibold tracking-tight text-foreground">
              {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
              {skill?.label ?? result.skill}
            </p>
            <p className="mt-0.5 text-sm tabular-nums text-muted-foreground">
              {result.raw} / {result.max} correct
            </p>
          </div>
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${pct}%` }}
          />
        </div>
      </CardBody>
    </Card>
  );
}

function PendingSkill({ skill }: { skill: "writing" | "speaking" }) {
  const { label, Icon } = SKILLS[skill];
  return (
    <Card tone="quiet" className="border-dashed">
      <CardBody className="flex items-center gap-4 p-5">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-muted text-muted-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="font-serif text-lg font-semibold tracking-tight text-foreground">
            {label}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Captured — pending review
          </p>
        </div>
      </CardBody>
    </Card>
  );
}

export function ResultsView({
  overall,
  results,
  attemptId,
}: {
  overall: number;
  results: SectionScore[];
  attemptId: string;
}) {
  const scoredSkills = new Set(results.map((r) => r.skill));
  const pending = (["writing", "speaking"] as const).filter(
    (s) => !scoredSkills.has(s)
  );

  return (
    <div className="space-y-8">
      <Card
        tone="raised"
        className={cx("enter relative isolate overflow-hidden text-center")}
      >
        <div className="aurora opacity-30" aria-hidden="true" />
        <div className="grain" aria-hidden="true" />
        <CardBody className="px-6 py-10 sm:py-12">
          <Eyebrow>Objective score · Listening + Reading</Eyebrow>
          <div className="mx-auto mt-6 max-w-[15rem]">
            <BandGauge band={overall} caption="Indicative band" />
          </div>
          <p className="mx-auto mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {/* Only say it was scaled when it was. A full 40-question paper
                converts straight off the table; calling that "scaled" makes a
                real score look like an estimate. */}
            {results.every(isFullLength)
              ? "Converted from your raw score."
              : "Scaled to a full-length test."}{" "}
            Writing and Speaking are captured for your own review — they are not
            scored yet.
          </p>
        </CardBody>
      </Card>

      <div
        className="enter grid gap-4 sm:grid-cols-2"
        style={{ ["--i" as string]: 1 }}
      >
        {results.map((r) => (
          <ScoredSkill key={r.sectionId} result={r} />
        ))}
        {pending.map((skill) => (
          <PendingSkill key={skill} skill={skill} />
        ))}
      </div>

      <div
        className="enter flex flex-col gap-3 sm:flex-row"
        style={{ ["--i" as string]: 2 }}
      >
        <Button href={`/mock/review?a=${attemptId}`} variant="accent" size="lg">
          Review answers
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
        <Button href="/progress" variant="outline" size="lg">
          Your progress
        </Button>
      </div>
    </div>
  );
}
