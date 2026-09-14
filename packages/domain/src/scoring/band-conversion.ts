// Academic raw-/40 → IELTS band. These conversion tables are widely published
// APPROXIMATIONS — exact boundaries vary per test version. Treat as data, not
// truth; the real tables attach when scoring is productionized.

interface Threshold {
  min: number;
  band: number;
}

// Highest band first; the first row whose `min` is ≤ raw wins.
const READING_ACADEMIC: Threshold[] = [
  { min: 39, band: 9 },
  { min: 37, band: 8.5 },
  { min: 35, band: 8 },
  { min: 33, band: 7.5 },
  { min: 30, band: 7 },
  { min: 27, band: 6.5 },
  { min: 23, band: 6 },
  { min: 19, band: 5.5 },
  { min: 15, band: 5 },
  { min: 13, band: 4.5 },
  { min: 10, band: 4 },
  { min: 8, band: 3.5 },
  { min: 6, band: 3 },
  { min: 4, band: 2.5 },
  { min: 3, band: 2 },
  // Band 1 is the "non-user" floor for a paper that WAS attempted. The old
  // table bottomed out at band 2 for `min: 0`, so a candidate who got nothing
  // right — or answered nothing at all — was told they had scored 2.0.
  // Not attempting at all is band 0, which scoring.ts decides, because a raw
  // of 0 alone cannot tell the two apart.
  { min: 0, band: 1 },
];

const LISTENING: Threshold[] = [
  { min: 39, band: 9 },
  { min: 37, band: 8.5 },
  { min: 35, band: 8 },
  { min: 32, band: 7.5 },
  { min: 30, band: 7 },
  { min: 26, band: 6.5 },
  { min: 23, band: 6 },
  { min: 18, band: 5.5 },
  { min: 16, band: 5 },
  { min: 13, band: 4.5 },
  { min: 10, band: 4 },
  { min: 8, band: 3.5 },
  { min: 6, band: 3 },
  { min: 4, band: 2.5 },
  { min: 3, band: 2 },
  { min: 0, band: 1 },
];

export function rawToBand(
  skill: "listening" | "reading",
  raw: number
): number {
  const table = skill === "listening" ? LISTENING : READING_ACADEMIC;
  const row = table.find((t) => raw >= t.min);
  return row ? row.band : 0;
}

/** Overall band = average of the four skills, rounded to the nearest half band
 * (IELTS rounding: .25 → up to .5, .75 → up to the next whole). */
export function overallBand(bands: number[]): number {
  if (bands.length === 0) return 0;
  const avg = bands.reduce((a, b) => a + b, 0) / bands.length;
  return Math.round(avg * 2) / 2;
}
