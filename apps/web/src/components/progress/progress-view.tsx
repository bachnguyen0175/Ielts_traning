import type { Attempt } from "@composed/domain";
import { Button } from "@/components/ui/button";
import { Card, CardBody, Eyebrow } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { BandTrendChart } from "@/components/ui/band-trend-chart";
import { ChartIcon, ArrowRightIcon } from "@/components/ui/icons";

function formatDate(ms: number): string {
  try {
    return new Date(ms).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function Stat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <Card>
      <CardBody className="p-5">
        <Eyebrow>{label}</Eyebrow>
        <p className="mt-2.5 font-serif text-3xl font-semibold leading-none tabular-nums text-foreground">
          {value}
        </p>
        {detail && (
          <p className="mt-1.5 text-sm text-muted-foreground">{detail}</p>
        )}
      </CardBody>
    </Card>
  );
}

export function ProgressView({
  attempts,
  targetBand,
}: {
  attempts: Attempt[];
  targetBand?: number;
}) {
  const sorted = [...attempts].sort((a, b) => b.startedAt - a.startedAt);
  const scored = sorted.filter((a) => a.overall != null);
  const latest = scored[0]?.overall;

  if (attempts.length === 0) {
    return (
      <EmptyState icon={<ChartIcon />} title="No mocks yet">
        <p>Sit your first mock to start tracking your progress.</p>
        <div className="mt-6 flex justify-center">
          <Button href="/mock" variant="accent" size="lg">
            Start your first mock
          </Button>
        </div>
      </EmptyState>
    );
  }

  // Oldest → newest, so the chart reads left to right in time.
  const bands = [...scored]
    .reverse()
    .map((a) => a.overall as number);
  const best = bands.length > 0 ? Math.max(...bands) : null;
  const delta =
    bands.length > 1 ? bands[bands.length - 1] - bands[0] : null;

  return (
    <div className="space-y-8">
      <div className="enter grid gap-4 sm:grid-cols-3">
        {targetBand != null && (
          <Stat
            label="Target band"
            value={targetBand.toFixed(1)}
            detail={
              latest != null
                ? latest >= targetBand
                  ? "Reached — hold it steady"
                  : `${(Math.round((targetBand - latest) * 10) / 10).toFixed(1)} to go`
                : undefined
            }
          />
        )}
        {latest != null && (
          <Stat
            label="Latest (Listening + Reading)"
            value={latest.toFixed(1)}
            detail={
              delta != null && delta !== 0
                ? `${delta > 0 ? "+" : ""}${delta.toFixed(1)} since your first`
                : undefined
            }
          />
        )}
        <Stat
          label="Mocks sat"
          value={String(attempts.length)}
          detail={
            best != null ? `Best so far · ${best.toFixed(1)}` : "None scored yet"
          }
        />
      </div>

      {bands.length > 0 && (
        <Card className="enter" style={{ ["--i" as string]: 1 }}>
          <CardBody>
            <Eyebrow>Band trend</Eyebrow>
            <div className="mt-4">
              <BandTrendChart bands={bands} target={targetBand} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {bands.length === 1
                ? "One scored mock so far — a second one gives you a direction."
                : `${bands.length} scored mocks, oldest to newest.`}
            </p>
          </CardBody>
        </Card>
      )}

      <div className="enter" style={{ ["--i" as string]: 2 }}>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Attempt history
        </h2>
        <Card className="overflow-hidden">
          <ul className="divide-y divide-border/70">
            {sorted.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground">
                    {formatDate(a.submittedAt ?? a.startedAt)}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {a.overall != null
                      ? `Band ${a.overall.toFixed(1)} · objective`
                      : "In progress"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {a.overall == null && <Badge tone="neutral">Unfinished</Badge>}
                  {a.overall != null && (
                    <Button
                      href={`/mock/results?a=${a.id}`}
                      variant="outline"
                      size="md"
                    >
                      View results
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div
        className="enter flex flex-wrap gap-3"
        style={{ ["--i" as string]: 3 }}
      >
        <Button href="/mock" variant="accent" size="lg">
          Start a new mock
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
        <Button href="/vocab" variant="outline" size="lg">
          Vocabulary
        </Button>
      </div>
    </div>
  );
}
