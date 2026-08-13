// Radial band gauge — the dashboard's focal point.
//
// A 270° arc (gap at the bottom, gauge-style) showing the latest objective band
// against the 9.0 scale, with a tick marking the user's target. `pathLength=100`
// normalises the circumference so the dash maths is a plain percentage.

const ARC = 75; // 270° of a 360° circle, expressed against pathLength=100
const MAX_BAND = 9;

function angleFor(band: number): number {
  // 135° is the start of the arc (bottom-left); it sweeps 270° clockwise.
  return 135 + (band / MAX_BAND) * 270;
}

function pointOnCircle(band: number, radius: number) {
  const rad = (angleFor(band) * Math.PI) / 180;
  return { x: 60 + radius * Math.cos(rad), y: 60 + radius * Math.sin(rad) };
}

export function BandGauge({
  band,
  target,
}: {
  band?: number;
  target?: number;
}) {
  const value = band ?? 0;
  const filled = ARC * (value / MAX_BAND);
  const tickInner = target != null ? pointOnCircle(target, 45) : null;
  const tickOuter = target != null ? pointOnCircle(target, 55) : null;

  const label =
    band != null
      ? `Latest band ${band.toFixed(1)} of 9${target != null ? `, target ${target.toFixed(1)}` : ""}`
      : "No band score yet";

  return (
    <div className="relative flex flex-col items-center">
      <svg
        viewBox="0 0 120 113"
        className="w-full max-w-[15rem]"
        role="img"
        aria-label={label}
      >
        {/* Track */}
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="8"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${ARC} 100`}
          transform="rotate(135 60 60)"
        />

        {/* Value */}
        {band != null && (
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="hsl(var(--accent))"
            strokeWidth="8"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${filled} 100`}
            transform="rotate(135 60 60)"
            className="gauge-sweep"
            style={{ ["--gauge-len" as string]: `${filled}` }}
          />
        )}

        {/* Target tick */}
        {tickInner && tickOuter && (
          <line
            x1={tickInner.x}
            y1={tickInner.y}
            x2={tickOuter.x}
            y2={tickOuter.y}
            stroke="hsl(var(--foreground))"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.75"
          />
        )}
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-5xl font-semibold leading-none text-gradient">
          {band != null ? band.toFixed(1) : "—"}
        </span>
        <span className="mt-1.5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {band != null ? "Latest band" : "No mock yet"}
        </span>
      </div>
    </div>
  );
}
