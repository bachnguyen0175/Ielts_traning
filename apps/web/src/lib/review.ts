import type { Section } from "@composed/domain";
import { scoreSection } from "@composed/domain";

export interface QuestionReview {
  number: number;
  your: string;
  answer: string;
  correct: boolean;
}

/** Per-question review (post-test): the user's answer vs the correct answer. */
export function reviewSection(
  section: Section,
  responses: Record<number, string>
): QuestionReview[] {
  const byNumber = new Map(
    scoreSection(section, responses).marks.map((m) => [m.number, m.correct])
  );
  const reviews: QuestionReview[] = [];
  for (const group of section.passages ?? []) {
    for (const g of group.questionGroups) {
      for (const q of g.questions) {
        const answer =
          g.answerMatch.kind === "letter-set"
            ? (g.acceptSet ?? []).join(" / ")
            : (q.accept ?? []).join(" / ");
        reviews.push({
          number: q.number,
          your: responses[q.number] ?? "",
          answer,
          correct: byNumber.get(q.number) ?? false,
        });
      }
    }
  }
  return reviews;
}
