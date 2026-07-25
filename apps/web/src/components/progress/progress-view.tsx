import type { Attempt } from "@composed/domain";
import { Button } from "@/components/ui/button";

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
      <div className="rounded-3xl border border-dashed border-border bg-card/50 p-10 text-center">
        <h2 className="font-serif text-2xl font-semibold text-foreground">
          No mocks yet
        </h2>
        <p className="mt-2 text-muted-foreground">
          Sit your first mock to start tracking your progress.
        </p>
        <div className="mt-6 flex justify-center">
          <Button href="/mock" variant="accent" size="lg">
            Start your first mock
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        {targetBand != null && (
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Target band</p>
            <p className="mt-1 font-serif text-4xl font-semibold text-foreground">
              {targetBand.toFixed(1)}
            </p>
          </div>
        )}
        {latest != null && (
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">
              Latest (Listening + Reading)
            </p>
            <p className="mt-1 font-serif text-4xl font-semibold text-foreground">
              {latest.toFixed(1)}
            </p>
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Attempt history
        </h2>
        <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
          {sorted.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-4 p-4"
            >
              <div>
                <p className="font-medium text-foreground">
                  {formatDate(a.submittedAt ?? a.startedAt)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {a.overall != null
                    ? `Band ${a.overall.toFixed(1)} · objective`
                    : "In progress"}
                </p>
              </div>
              {a.overall != null && (
                <Button
                  href={`/mock/results?a=${a.id}`}
                  variant="outline"
                  size="md"
                >
                  View results
                </Button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button href="/mock" variant="accent" size="lg">
          Start a new mock
        </Button>
        <Button href="/vocab" variant="outline" size="lg">
          Vocabulary
        </Button>
      </div>
    </div>
  );
}
