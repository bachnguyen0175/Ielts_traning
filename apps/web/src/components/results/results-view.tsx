import type { SectionScore } from "@composed/domain";
import { Button } from "@/components/ui/button";

const SKILL_LABEL: Record<string, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

function BandBadge({ band }: { band: number }) {
  return (
    <div className="grid h-14 w-14 place-items-center rounded-xl bg-primary text-primary-foreground">
      <span className="font-serif text-xl font-semibold">{band.toFixed(1)}</span>
    </div>
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
    <div className="space-y-10">
      <div className="rounded-3xl border border-border bg-card p-8 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Objective score · Listening + Reading
        </p>
        <p className="mt-3 font-serif text-6xl font-semibold text-foreground">
          {overall.toFixed(1)}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Indicative band, scaled to a full-length test.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {results.map((r) => (
          <div
            key={r.sectionId}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5"
          >
            {r.band != null && <BandBadge band={r.band} />}
            <div>
              <p className="font-serif text-lg font-semibold text-foreground">
                {SKILL_LABEL[r.skill]}
              </p>
              <p className="text-sm text-muted-foreground">
                {r.raw} / {r.max} correct
              </p>
            </div>
          </div>
        ))}

        {pending.map((skill) => (
          <div
            key={skill}
            className="flex items-center gap-4 rounded-2xl border border-dashed border-border bg-card/50 p-5"
          >
            <div className="grid h-14 w-14 place-items-center rounded-xl bg-muted text-muted-foreground">
              <span className="text-xs font-medium">—</span>
            </div>
            <div>
              <p className="font-serif text-lg font-semibold text-foreground">
                {SKILL_LABEL[skill]}
              </p>
              <p className="text-sm text-muted-foreground">
                Captured — pending review
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button href={`/mock/review?a=${attemptId}`} variant="accent" size="lg">
          Review answers
        </Button>
        <Button href="/progress" variant="outline" size="lg">
          Your progress
        </Button>
      </div>
    </div>
  );
}
