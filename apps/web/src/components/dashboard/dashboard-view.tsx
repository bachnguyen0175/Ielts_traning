import type { Attempt } from "@composed/domain";
import { Button } from "@/components/ui/button";
import { nextAction } from "./next-action";

function daysUntil(iso: string): number | null {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return Math.round((then - startOfToday.getTime()) / 86_400_000);
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-serif text-4xl font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}

export function DashboardView({
  attempts,
  targetBand,
  testDate,
  vocabDue,
}: {
  attempts: Attempt[];
  targetBand?: number;
  testDate?: string;
  vocabDue: number;
}) {
  const action = nextAction(attempts);
  const latest = [...attempts]
    .filter((a) => a.overall != null)
    .sort((a, b) => b.startedAt - a.startedAt)[0]?.overall;
  const days = testDate ? daysUntil(testDate) : null;

  return (
    <div className="space-y-8">
      {/* Primary next action */}
      <div className="rounded-3xl border border-border bg-card p-8">
        <p className="text-sm text-muted-foreground">{action.hint}</p>
        <div className="mt-4">
          <Button href={action.href} variant="accent" size="lg">
            {action.label}
          </Button>
        </div>
      </div>

      {/* Snapshot */}
      <div className="grid gap-4 sm:grid-cols-3">
        {targetBand != null && (
          <StatCard label="Target band" value={targetBand.toFixed(1)} />
        )}
        {latest != null && (
          <StatCard label="Latest (L + R)" value={latest.toFixed(1)} />
        )}
        {days != null && days >= 0 && (
          <StatCard
            label="Until your test"
            value={days === 0 ? "Today" : `${days} ${days === 1 ? "day" : "days"}`}
          />
        )}
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-3">
        <Button href="/progress" variant="outline" size="lg">
          View progress
        </Button>
        <Button href="/vocab" variant="outline" size="lg">
          {vocabDue > 0 ? `Study vocabulary (${vocabDue} due)` : "Vocabulary"}
        </Button>
        <Button href="/account" variant="outline" size="lg">
          Account
        </Button>
      </div>
    </div>
  );
}
