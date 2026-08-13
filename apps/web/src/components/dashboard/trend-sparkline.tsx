// Band trend across scored attempts. Deliberately unlabelled and axis-free:
// it answers "am I moving up?" at a glance, and /progress carries the detail.

export function TrendSparkline({ bands }: { bands: number[] }) {
  if (bands.length < 2) return null;

  const w = 120;
  const h = 44;
  const min = Math.min(...bands);
  const max = Math.max(...bands);
  const span = max - min || 1;

  const points = bands.map((b, i) => ({
    x: (i / (bands.length - 1)) * w,
    // Pad by 4px top and bottom so end caps are never clipped.
    y: h - 6 - ((b - min) / span) * (h - 14),
  }));

  const line = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;
  const last = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-12 w-full"
      role="img"
      aria-label={`Band trend across ${bands.length} mocks, from ${bands[0].toFixed(1)} to ${bands[bands.length - 1].toFixed(1)}`}
    >
      <polygon points={area} fill="hsl(var(--accent) / 0.16)" />
      <polyline
        points={line}
        fill="none"
        stroke="hsl(var(--accent))"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last.x} cy={last.y} r="2.75" fill="hsl(var(--accent))" />
    </svg>
  );
}
