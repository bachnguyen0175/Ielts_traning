import type { Attempt } from "@composed/domain";
import { Button } from "@/components/ui/button";
import { nextAction } from "./next-action";
import { BandGauge } from "@/components/ui/band-gauge";
import { TrendSparkline } from "./trend-sparkline";

function daysUntil(iso: string): number | null {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return Math.round((then - startOfToday.getTime()) / 86_400_000);
}

// ── Icons (SVG, never emoji — see ui-ux-pro-max pre-delivery checklist) ──────

const ICON = "h-5 w-5 shrink-0";

function ChartIcon() {
  return (
    <svg className={ICON} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 3v18h18" />
      <path d="m7 14 3.5-4 3 2.5L20 7" />
    </svg>
  );
}

function CardsIcon() {
  return (
    <svg className={ICON} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="6" width="13" height="14" rx="2" />
      <path d="M8 3h10a3 3 0 0 1 3 3v10" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className={ICON} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

// ── Pieces ───────────────────────────────────────────────────────────────────

function Stat({
  label,
  value,
  detail,
  children,
}: {
  label: string;
  value: string;
  detail?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-border bg-card/70 p-5 backdrop-blur-sm transition-colors duration-200 hover:border-foreground/20">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-3">
        <p className="font-serif text-3xl font-semibold leading-none text-foreground">
          {value}
        </p>
        {detail && (
          <p className="mt-1.5 text-sm text-muted-foreground">{detail}</p>
        )}
        {children}
      </div>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  label,
  detail,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  detail: string;
  badge?: number;
}) {
  return (
    <a
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-border bg-card/70 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted text-foreground/80 transition-colors duration-200 group-hover:bg-accent/15 group-hover:text-accent-foreground dark:group-hover:text-accent">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="font-medium text-foreground">{label}</span>
          {badge != null && badge > 0 && (
            <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">
              {badge}
            </span>
          )}
        </span>
        <span className="mt-0.5 block truncate text-sm text-muted-foreground">
          {detail}
        </span>
      </span>
      <span className="text-muted-foreground">
        <ArrowIcon />
      </span>
    </a>
  );
}

// ── View ─────────────────────────────────────────────────────────────────────

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

  const scored = [...attempts]
    .filter((a) => a.overall != null)
    .sort((a, b) => a.startedAt - b.startedAt);
  const bands = scored.map((a) => a.overall as number);
  const latest = bands.at(-1);
  const first = bands[0];
  const delta = latest != null && first != null ? latest - first : null;
  const days = testDate ? daysUntil(testDate) : null;

  const toTarget =
    latest != null && targetBand != null
      ? Math.round((targetBand - latest) * 10) / 10
      : null;

  return (
    <div className="space-y-6">
      {/* ── Primary next action ── */}
      <section
        className="enter relative isolate overflow-hidden rounded-3xl border border-border bg-card/80 p-8 backdrop-blur-sm sm:p-10"
        style={{ ["--i" as string]: 0 }}
      >
        <div className="aurora opacity-40" aria-hidden="true" />
        <div className="grain" aria-hidden="true" />
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Next step
        </p>
        <h2 className="mt-3 max-w-xl font-serif text-2xl font-semibold leading-snug tracking-tight text-foreground sm:text-3xl">
          {action.hint}
        </h2>
        <div className="mt-6">
          <Button href={action.href} variant="accent" size="lg">
            {action.label}
          </Button>
        </div>
      </section>

      {/* ── Snapshot ── */}
      <section
        className="enter grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]"
        style={{ ["--i" as string]: 1 }}
      >
        <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-card/70 p-8 backdrop-blur-sm">
          <BandGauge band={latest} target={targetBand} />
          <p className="mt-5 text-center text-sm text-muted-foreground">
            {latest == null ? (
              <>Listening &amp; Reading are scored automatically after a sitting.</>
            ) : toTarget != null && toTarget > 0 ? (
              <>
                <span className="font-medium text-foreground">
                  {toTarget.toFixed(1)} band
                </span>{" "}
                to your {targetBand?.toFixed(1)} target
              </>
            ) : toTarget != null ? (
              <span className="font-medium text-foreground">
                Target reached — hold it steady
              </span>
            ) : (
              <>Set a target band in your account to track the gap</>
            )}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Stat
            label="Mocks sat"
            value={String(scored.length)}
            detail={
              scored.length === 0
                ? "Your first one sets the baseline"
                : delta != null && delta !== 0
                  ? `${delta > 0 ? "+" : ""}${delta.toFixed(1)} since your first`
                  : "Baseline set"
            }
          />

          <Stat
            label="Until your test"
            value={
              days == null
                ? "—"
                : days < 0
                  ? "Passed"
                  : days === 0
                    ? "Today"
                    : String(days)
            }
            detail={
              days == null
                ? "Add your test date to see a countdown"
                : days < 0
                  ? "Update your date in account"
                  : days === 0
                    ? "Good luck — you have prepared for this"
                    : days === 1
                      ? "day to go"
                      : "days to go"
            }
          />

          <Stat
            label="Target band"
            value={targetBand != null ? targetBand.toFixed(1) : "—"}
            detail={
              targetBand != null
                ? "Marked on the dial"
                : "Set one to measure progress against"
            }
          />

          {/* Trend earns its own tile — cramped under a number it read as a glitch. */}
          <div className="flex flex-col justify-between rounded-2xl border border-border bg-card/70 p-5 backdrop-blur-sm transition-colors duration-200 hover:border-foreground/20">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Band trend
            </p>
            {bands.length > 1 ? (
              <div className="mt-3">
                <TrendSparkline bands={bands} />
                <p className="mt-2 text-sm text-muted-foreground">
                  {bands[0].toFixed(1)} → {latest?.toFixed(1)} over {bands.length} mocks
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Two sittings reveal a trend.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Shortcuts ── */}
      <section
        className="enter grid gap-4 sm:grid-cols-3"
        style={{ ["--i" as string]: 2 }}
      >
        <QuickLink
          href="/progress"
          icon={<ChartIcon />}
          label="Progress"
          detail={
            scored.length > 0 ? `${scored.length} sittings recorded` : "Attempt history"
          }
        />
        <QuickLink
          href="/vocab"
          icon={<CardsIcon />}
          label="Vocabulary"
          detail={vocabDue > 0 ? "Cards ready to review" : "Saved words and flashcards"}
          badge={vocabDue}
        />
        <QuickLink
          href="/account"
          icon={<UserIcon />}
          label="Account"
          detail="Target band and test date"
        />
      </section>
    </div>
  );
}
