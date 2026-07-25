import type { SectionScore, Test } from "@composed/domain";
import { scoreSection, rawToBand, overallBand } from "@composed/domain";

/**
 * Objective scoring for Listening & Reading. Because the sample mock is shorter
 * than a real 40-question test, the band is derived from the % correct projected
 * onto the /40 scale — an "indicative band" (clearly labelled in the UI).
 */
export function scoreObjectiveSections(
  test: Test,
  responses: Record<number, string>
): SectionScore[] {
  return test.sections
    .filter((s) => s.skill === "listening" || s.skill === "reading")
    .map((s) => {
      const sc = scoreSection(s, responses);
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
