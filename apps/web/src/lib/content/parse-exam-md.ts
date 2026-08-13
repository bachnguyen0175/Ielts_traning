import type {
  AnswerMatch,
  Passage,
  Question,
  QuestionGroup,
  QuestionType,
  Section,
  Test,
} from "@composed/domain";

// Parses an IELTS Reading paper written as "exam-paper markdown" — the shape a
// practice paper takes when a printed/published test is transcribed: passage
// headings, lettered paragraphs, `#### Questions n-m` blocks, option lists, and
// an answer key at the end.
//
// This is a SECOND, separate dialect from `parse-md.ts`. That one reads the
// authored `.test.md` format we design and commit; this one reads papers as
// they come. Uploaded papers are parsed in the browser and stored per-user —
// they are never committed and never deployed.

export interface Diagnostic {
  line: number;
  severity: "error" | "warning";
  message: string;
}

export interface ExamParseResult {
  test: Test | null;
  diagnostics: Diagnostic[];
}

/** Strips **bold**, *italic*, `code` and [links](url), keeping inner spacing. */
function unmark(s: string): string {
  return s
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\\/g, "")
    .trim();
}

/** As `unmark`, but also collapses whitespace runs. */
function plain(s: string): string {
  return unmark(s).replace(/\s+/g, " ").trim();
}

function slugify(s: string): string {
  return (
    plain(s)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "imported-test"
  );
}

const ROMAN = /^(?:i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii|xiii|xiv|xv)$/i;

// ── Question-type inference ──────────────────────────────────────────────────

interface TypeGuess {
  type: QuestionType;
  selectCount?: number;
  reusable?: boolean;
}

const WORD_NUMBERS: Record<string, number> = { two: 2, three: 3, four: 4 };

function guessType(instruction: string, optionCount: number): TypeGuess {
  const t = instruction.toLowerCase();
  const reusable = /more than once/.test(t);

  const choose = /choose\s+(two|three|four)\s+letters/.exec(t);
  if (choose) {
    return {
      type: "multiple_choice_multi",
      selectCount: WORD_NUMBERS[choose[1]],
      reusable,
    };
  }
  if (/correct heading/.test(t)) return { type: "matching_headings", reusable };
  if (/which paragraph contains/.test(t)) {
    return { type: "matching_information", reusable };
  }
  if (/match each statement|list of people|list of researchers/.test(t)) {
    return { type: "matching_features", reusable };
  }
  if (/true.*false.*not given/.test(t)) {
    return { type: "true_false_not_given" };
  }
  if (/yes.*no.*not given/.test(t)) return { type: "yes_no_not_given" };
  if (/complete the (table|summary|notes|flow)/.test(t)) {
    return { type: "summary_completion" };
  }
  if (/complete the sentence/.test(t)) return { type: "sentence_completion" };
  if (/choose the correct letter/.test(t)) {
    return { type: "multiple_choice_single", reusable };
  }
  if (/answer the questions|no more than|one word only/.test(t)) {
    return { type: "short_answer" };
  }
  return optionCount > 0
    ? { type: "matching_information", reusable }
    : { type: "short_answer" };
}

function matchFor(type: QuestionType): AnswerMatch {
  if (type === "true_false_not_given") {
    return { kind: "enum", options: ["TRUE", "FALSE", "NOT GIVEN"] };
  }
  if (type === "yes_no_not_given") {
    return { kind: "enum", options: ["YES", "NO", "NOT GIVEN"] };
  }
  if (type === "multiple_choice_multi") {
    return { kind: "letter-set", anyOrder: true };
  }
  if (
    type === "multiple_choice_single" ||
    type === "matching_information" ||
    type === "matching_features" ||
    type === "matching_headings"
  ) {
    return { kind: "letter" };
  }
  return { kind: "text", normalize: ["trim", "collapse-ws", "lowercase"] };
}

// ── Raw scan ─────────────────────────────────────────────────────────────────

interface RawGroup {
  line: number;
  from: number;
  to: number;
  instruction: string[];
  stems: Map<number, string>;
  options: { label: string; text: string }[];
}

interface RawPassage {
  line: number;
  number: number;
  title: string;
  paragraphs: string[];
  groups: RawGroup[];
}

const PASSAGE_RE = /^reading passage\s+(\d+)/i;
const QUESTIONS_RE = /^questions?\s+(\d+)\s*[-–—]\s*(\d+)/i;
const ANSWER_HEAD_RE = /answer/i;

export function parseExamMarkdown(source: string): ExamParseResult {
  const lines = source.split(/\r?\n/);
  const diagnostics: Diagnostic[] = [];
  const error = (line: number, message: string) =>
    diagnostics.push({ line, severity: "error", message });
  const warn = (line: number, message: string) =>
    diagnostics.push({ line, severity: "warning", message });

  let title = "";
  const passages: RawPassage[] = [];
  const answers = new Map<number, string>();

  let passage: RawPassage | null = null;
  let group: RawGroup | null = null;
  let inAnswerKey = false;
  let awaitingTitle = false;

  for (let i = 0; i < lines.length; i += 1) {
    const line = i + 1;
    const raw = lines[i];
    const text = plain(raw);
    if (text === "" || /^-{3,}$/.test(text)) continue;

    const heading = /^(#{1,6})\s+(.*)$/.exec(raw.trim());
    const headingText = heading ? plain(heading[2]) : "";

    // ── Answer key ──
    if (heading && ANSWER_HEAD_RE.test(headingText) && /answer/i.test(headingText)) {
      // "Answer Cam 12 Reading Test 02" opens the key; "View Answers with
      // Explanations" is a trailing link, harmless either way.
      inAnswerKey = true;
      group = null;
      continue;
    }
    if (inAnswerKey) {
      const a = /^(\d+)[.)]\s*(.+)$/.exec(text);
      if (a) {
        const n = Number(a[1]);
        if (answers.has(n)) warn(line, `answer ${n} appears more than once`);
        answers.set(n, a[2].trim());
      }
      continue;
    }

    // ── Structure ──
    if (heading) {
      const p = PASSAGE_RE.exec(headingText);
      if (p) {
        group = null;
        passage = {
          line,
          number: Number(p[1]),
          title: "",
          paragraphs: [],
          groups: [],
        };
        passages.push(passage);
        awaitingTitle = true;
        continue;
      }

      const q = QUESTIONS_RE.exec(headingText);
      if (q && passage) {
        group = {
          line,
          from: Number(q[1]),
          to: Number(q[2]),
          instruction: [],
          stems: new Map(),
          options: [],
        };
        passage.groups.push(group);
        awaitingTitle = false;
        continue;
      }

      if (awaitingTitle && passage && headingText !== "") {
        passage.title = headingText;
        awaitingTitle = false;
        continue;
      }
      if (title === "" && headingText !== "") title = headingText;
      continue;
    }

    // ── Body lines ──
    if (group) {
      // "**A**     Kanayo F. Nwanze"  /  "**i**   Different accounts".
      // Matched on spacing-preserved text: the wide gap is what marks an
      // option line apart from prose that merely starts with a capital.
      const opt = /^([A-Z]|[ivxIVX]+)\s{2,}(.+)$/.exec(unmark(raw));
      if (opt && (opt[1].length === 1 || ROMAN.test(opt[1]))) {
        group.options.push({ label: opt[1], text: opt[2].trim() });
        continue;
      }
      // "**1**   a reference to characteristics..."
      const stem = /^(\d+)\s+(.+)$/.exec(text);
      if (stem) {
        const n = Number(stem[1]);
        if (n >= group.from && n <= group.to) {
          group.stems.set(n, stem[2].trim());
          continue;
        }
      }
      // Bare option list header ("List of People") or instruction prose.
      if (!/^list of/i.test(text)) group.instruction.push(text);
      continue;
    }

    if (passage) {
      // A lone letter is a paragraph label; keep prose only.
      if (/^[A-Z]$/.test(text)) continue;
      if (/^you should spend/i.test(text)) continue;
      if (/^advertisements?$/i.test(text)) continue;
      passage.paragraphs.push(text);
      continue;
    }
  }

  // ── Build ──
  if (passages.length === 0) {
    error(1, "no 'READING PASSAGE n' headings found — is this a Reading paper?");
    return { test: null, diagnostics };
  }
  if (answers.size === 0) {
    error(1, "no answer key found — expected a section listing '1. A', '2. B', …");
    return { test: null, diagnostics };
  }

  const built: Passage[] = passages.map((rp, index) => {
    const passageId = `r-p${rp.number || index + 1}`;
    if (rp.title === "") warn(rp.line, `passage ${rp.number} has no title heading`);
    if (rp.paragraphs.length === 0) {
      warn(rp.line, `passage ${rp.number} has no body text`);
    }

    const groups: QuestionGroup[] = rp.groups.map((rg, gi) => {
      const instruction = rg.instruction.join(" ").trim();
      const guess = guessType(
        `${instruction} ${rg.options.map((o) => o.text).join(" ")}`,
        rg.options.length
      );
      let sharedOptions = rg.options.map((o) => o.label);
      // Paragraph-matching groups rarely print a list; they state the span in
      // prose ("Reading Passage 1 has nine paragraphs, A-I"). Expand it.
      if (sharedOptions.length === 0) {
        const span = /\bparagraphs?,?\s+([A-Z])\s*[-–—]\s*([A-Z])\b/.exec(instruction);
        if (span) {
          const from = span[1].charCodeAt(0);
          const to = span[2].charCodeAt(0);
          if (to > from && to - from < 26) {
            sharedOptions = Array.from({ length: to - from + 1 }, (_, k) =>
              String.fromCharCode(from + k)
            );
          }
        }
      }
      const width = rg.to - rg.from + 1;
      const isLetterSet = guess.type === "multiple_choice_multi";

      const questions: Question[] = [];
      const acceptSet: string[] = [];
      for (let n = rg.from; n <= rg.to; n += 1) {
        const answer = answers.get(n);
        if (answer === undefined) {
          error(rg.line, `question ${n} has no answer in the key`);
        }
        if (isLetterSet) {
          if (answer) acceptSet.push(answer.toUpperCase());
          questions.push({ number: n, acceptSetMember: true });
        } else {
          const q: Question = { number: n };
          const stem = rg.stems.get(n);
          if (stem) q.content = stem;
          if (answer) q.accept = [answer];
          questions.push(q);
        }
      }

      const group: QuestionGroup = {
        id: `${passageId}-g${gi + 1}`,
        range: [rg.from, rg.to],
        type: guess.type,
        instruction: instruction || `Questions ${rg.from}-${rg.to}`,
        ...(sharedOptions.length > 0 ? { sharedOptions } : {}),
        ...(guess.reusable ? { optionsReusable: true } : {}),
        answerMatch: matchFor(guess.type),
        questions,
        ...(isLetterSet ? { selectCount: guess.selectCount ?? width } : {}),
        ...(isLetterSet ? { acceptSet } : {}),
      };
      return group;
    });

    const passageOut: Passage = {
      id: passageId,
      order: index + 1,
      title: rp.title || `Reading Passage ${rp.number || index + 1}`,
      questionGroups: groups,
    };
    const body = rp.paragraphs.join("\n\n");
    if (body !== "") passageOut.body = body;
    return passageOut;
  });

  const numbers = built
    .flatMap((p) => p.questionGroups)
    .flatMap((g) => g.questions.map((q) => q.number))
    .sort((a, b) => a - b);
  const unusedAnswers = [...answers.keys()].filter((n) => !numbers.includes(n));
  if (unusedAnswers.length > 0) {
    warn(1, `${unusedAnswers.length} answer(s) in the key have no question: ${unusedAnswers.slice(0, 8).join(", ")}`);
  }

  const section: Section = {
    id: "s-reading",
    skill: "reading",
    order: 1,
    durationSeconds: 3600,
    rules: { singleTimer: true, autoAdvanceOnExpiry: true },
    passages: built,
  };

  if (diagnostics.some((d) => d.severity === "error")) {
    return { test: null, diagnostics };
  }

  return {
    test: {
      id: slugify(title),
      title: title || "Imported reading paper",
      type: "academic",
      sections: [section],
      source: "Imported",
      access: "private",
    },
    diagnostics,
  };
}
