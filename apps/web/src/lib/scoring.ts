import type { SectionScore, Test } from "@composed/domain";
import { scoreSection, rawToBand, overallBand } from "@composed/domain";

/** True when the section is a full-length paper and needs no projection. */
export function isFullLength(score: SectionScore): boolean {
  return score.max === 40;
}

/**
 * Objective scoring for Listening & Reading. A section shorter than a real
 * 40-question paper has its band derived from the % correct projected onto the
 * /40 scale — an "indicative band". A full-length section projects onto itself,
 * so its band is the real conversion.
 */
export function scoreObjectiveSections(
  test: Test,
  responses: Record<number, string>
): SectionScore[] {
  return test.sections
    .filter((s) => s.skill === "listening" || s.skill === "reading")
    .map((s) => {
      const sc = scoreSection(s, responses);
      // A raw of 0 cannot tell "attempted and got none right" (band 1) from
      // "did not attempt" (band 0), and IELTS scores those differently. Only
      // the responses know.
      const attempted = sc.marks.some((m) => {
        const r = responses[m.number];
        return r != null && r.trim() !== "";
      });
      if (!attempted) return { ...sc, band: 0 };
      const projected = sc.max > 0 ? Math.round((sc.raw / sc.max) * 40) : 0;
      const band = rawToBand(s.skill as "listening" | "reading", projected);
      return { ...sc, band };
    });
}

export function computeObjectiveResults(
  test: Test,
  responses: Record<number, string>
): { results: SectionScore[]; overall: number } {
  const results = scoreObjectiveSections(test, responses);
  const overall = overallBand(
    results.map((r) => r.band).filter((b): b is number => b != null)
  );
  return { results, overall };
}
