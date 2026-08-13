// Band trend across scored attempts, plotted on the IELTS scale.
//
// Unlike the dashboard sparkline (which answers "am I moving up?" in a glance),
// this one is readable: fixed 4–9 band axis so the slope means something
// absolute, gridlines to read a value off, and the target drawn as a line you
// are trying to cross.

const W = 600;
const H = 220;
const PAD = { top: 12, right: 16, bottom: 28, left: 30 };

/**
 * The visible band window, derived from the data rather than fixed at 4–9.
 * A fixed floor silently pins a band of 2.0 onto the "4" gridline, which reads
 * as a score the user did not get.
 */
function domainFor(values: number[]): { lo: number; hi: number } {
  let lo = Math.floor(Math.min(...values));
  let hi = Math.ceil(Math.max(...values));
  // Always show at least a 3-band window, or a single flat point sits on the
  // top and bottom edge at once.
  if (hi - lo < 3) {
    hi = Math.min(9, lo + 3);
    lo = Math.max(0, hi - 3);
  }
  return { lo: Math.max(0, lo), hi: Math.min(9, hi) };
}

function xFor(i: number, count: number): number {
  if (count <= 1) return (PAD.left + (W - PAD.right)) / 2;
  return PAD.left + (i / (count - 1)) * (W - PAD.left - PAD.right);
}

export function BandTrendChart({
  bands,
  target,
}: {
  bands: number[];
  target?: number;
}) {
  if (bands.length === 0) return null;

  const { lo, hi } = domainFor([
    ...bands,
    ...(target != null ? [target] : []),
  ]);

  function yFor(band: number): number {
    const t = (band - lo) / (hi - lo);
    return H - PAD.bottom - t * (H - PAD.top - PAD.bottom);
  }

  const points = bands.map((b, i) => ({
    x: xFor(i, bands.length),
    y: yFor(b),
    band: b,
  }));

  const line = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${PAD.left},${H - PAD.bottom} ${line} ${points[points.length - 1].x.toFixed(1)},${H - PAD.bottom}`;
  const gridBands = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

  const first = bands[0];
  const last = bands[bands.length - 1];

  return (
    // Scales uniformly by default; `preserveAspectRatio="none"` would stretch
    // the dots into ellipses and squash the axis labels.
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={
        bands.length === 1
          ? `One scored mock, band ${last.toFixed(1)}`
          : `Band trend across ${bands.length} scored mocks, from ${first.toFixed(1)} to ${last.toFixed(1)}`
      }
    >
      {gridBands.map((b) => (
        <g key={b}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={yFor(b)}
            y2={yFor(b)}
            stroke="hsl(var(--border))"
            strokeWidth="1"
          />
          <text
            x={PAD.left - 8}
            y={yFor(b) + 4}
            textAnchor="end"
            className="fill-[hsl(var(--muted-foreground))] text-[11px]"
          >
            {b}
          </text>
        </g>
      ))}

      {target != null && target >= lo && target <= hi && (
        <g>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={yFor(target)}
            y2={yFor(target)}
            stroke="hsl(var(--foreground))"
            strokeWidth="1.5"
            strokeDasharray="5 4"
            opacity="0.55"
          />
          <text
            x={W - PAD.right}
            y={yFor(target) - 7}
            textAnchor="end"
            className="fill-[hsl(var(--foreground))] text-[11px] font-medium"
            opacity="0.7"
          >
            Target
          </text>
        </g>
      )}

      {bands.length > 1 && (
        <>
          <polygon points={area} fill="hsl(var(--accent) / 0.14)" />
          <polyline
            points={line}
            fill="none"
            stroke="hsl(var(--accent))"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}

      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={i === points.length - 1 ? 5 : 3.5}
          fill="hsl(var(--accent))"
          stroke="hsl(var(--background))"
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}
