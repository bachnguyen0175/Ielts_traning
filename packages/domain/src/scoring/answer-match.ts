import type {
  AnswerMatch,
  NormalizeStep,
  Question,
  QuestionGroup,
  QuestionMark,
  ResponseMap,
  Section,
  SectionScore,
} from "../types";

const DEFAULT_TEXT_NORMALIZE: NormalizeStep[] = [
  "trim",
  "collapse-ws",
  "lowercase",
];

function applyNormalize(value: string, steps: NormalizeStep[]): string {
  let s = value;
  for (const step of steps) {
    if (step === "trim") s = s.trim();
    else if (step === "collapse-ws") s = s.replace(/\s+/g, " ");
    else if (step === "lowercase") s = s.toLowerCase();
  }
  return s;
}

function normalizeText(
  value: string,
  match: Extract<AnswerMatch, { kind: "text" }>
): string {
  let steps = match.normalize ?? DEFAULT_TEXT_NORMALIZE;
  if (match.caseSensitive) steps = steps.filter((s) => s !== "lowercase");
  return applyNormalize(value, steps);
}

/** Case-insensitive, trimmed equality (enum/letter). */
function looseEqual(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

function matchesSingle(
  match: AnswerMatch,
  response: string,
  question: Question
): boolean {
  const accept = question.accept ?? [];
  switch (match.kind) {
    case "text":
      return accept.some(
        (a) => normalizeText(a, match) === normalizeText(response, match)
      );
    case "enum":
    case "letter":
      return accept.some((a) => looseEqual(a, response));
    case "letter-set":
      return false; // scored at the group level
  }
}

interface GroupScore {
  marks: QuestionMark[];
  raw: number;
  max: number;
}

function scoreLetterSet(
  group: QuestionGroup,
  responses: ResponseMap
): GroupScore {
  const accept = new Set(
    (group.acceptSet ?? []).map((l) => l.trim().toUpperCase())
  );
  const seen = new Set<string>();
  let raw = 0;
  const marks = group.questions.map((q) => {
    const letter = responses[q.number]?.trim().toUpperCase();
    let correct = false;
    if (letter && accept.has(letter) && !seen.has(letter)) {
      correct = true;
      seen.add(letter);
      raw += 1;
    }
    return { number: q.number, correct };
  });
  const max = group.selectCount ?? group.questions.length;
  return { marks, raw, max };
}

export function scoreQuestionGroup(
  group: QuestionGroup,
  responses: ResponseMap
): GroupScore {
  if (group.answerMatch.kind === "letter-set") {
    return scoreLetterSet(group, responses);
  }
  const marks = group.questions.map((q) => {
    const response = responses[q.number];
    const correct =
      response != null && response !== ""
        ? matchesSingle(group.answerMatch, response, q)
        : false;
    return { number: q.number, correct };
  });
  return {
    marks,
    raw: marks.filter((m) => m.correct).length,
    max: group.questions.length,
  };
}

function groupsOf(section: Section): QuestionGroup[] {
  return (section.passages ?? []).flatMap((p) => p.questionGroups);
}

export function scoreSection(
  section: Section,
  responses: ResponseMap
): SectionScore {
  let raw = 0;
  let max = 0;
  const marks: QuestionMark[] = [];
  for (const group of groupsOf(section)) {
    const g = scoreQuestionGroup(group, responses);
    raw += g.raw;
    max += g.max;
    marks.push(...g.marks);
  }
  return { sectionId: section.id, skill: section.skill, raw, max, marks };
}
