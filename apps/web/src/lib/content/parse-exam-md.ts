import type {
  AnswerMatch,
  Option,
  Passage,
  Question,
  QuestionGroup,
  QuestionType,
  Section,
  Test,
} from "@composed/domain";

// Parses an IELTS Reading paper written as "exam-paper markdown" — the shape a
// practice paper takes when a printed/published test is transcribed: passage
// headings, lettered paragraphs, `#### Questions n-m` (or `n and m`) blocks,
// option lists, and an answer key at the end.
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

/** A printed dotted leader, i.e. the blank a candidate writes into. */
const LEADER = /\s*(?:[….]{3,}|_{3,})\s*/g;

/** A numbered blank inside a table cell: "27……………" */
const CELL_BLANK = /(\d{1,2})\s*(?:[….]{3,}|_{3,})/g;

/** A printed list marker: the notes body prints one bullet per line. */
const BULLET = /^[●•·-]\s/;

/** The same test for one line. Separate because `.test` on a /g regex is
 *  stateful, so sharing CELL_BLANK would skip every other line. */
const HAS_BLANK = new RegExp(CELL_BLANK.source);

/** Rewrites printed blanks as the app's `[[n]]` marker. */
function withBlankTokens(s: string): string {
  return s.replace(CELL_BLANK, (_, n) => `[[${n}]]`);
}

/** Replaces printed leaders with the app's blank marker. */
function withBlanks(s: string): string {
  return s.replace(LEADER, " ___ ").replace(/\s+/g, " ").replace(/\s+([.,;:?!])/g, "$1").trim();
}

/** Page furniture that carries no exam content. */
function isFurniture(text: string): boolean {
  return /^#+$/.test(text) || /^advertisements?$/i.test(text) || /^\*+$/.test(text);
}

/** Splits a markdown table row into cells; null when the line is not a row, or
 *  is a separator/spacer row carrying no text. */
function tableCells(raw: string): string[] | null {
  const t = raw.trim();
  if (!t.startsWith("|")) return null;
  const cells = t
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => plain(c));
  if (cells.every((c) => c === "" || /^:?-{2,}:?$/.test(c))) return null;
  return cells;
}

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
  // Papers word the same task either way — "Which paragraph contains…" and
  // "Which section contains…" both mean: find where this information is.
  if (/which (?:paragraph|section) contains/.test(t)) {
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

/** Types whose options are printed as a list beside their letters. */
const LISTED_TYPES = new Set<QuestionType>([
  "matching_features",
  "matching_headings",
  "multiple_choice_single",
  "multiple_choice_multi",
]);

/** Types that point at a paragraph by its printed label. */
const BY_PARAGRAPH = new Set<QuestionType>([
  "matching_information",
  "matching_headings",
]);

// ── Raw scan ─────────────────────────────────────────────────────────────────

interface RawGroup {
  line: number;
  from: number;
  to: number;
  instruction: string[];
  stems: Map<number, string>;
  /** `afterStem` is the stem this option line followed, if any — a
   *  multiple-choice question prints its options directly under its stem. */
  options: { label: string; text: string; afterStem: number | null }[];
  tableRows: string[][];
  noteLines: string[];
  /** last stem seen, so a stem that wraps onto the next line can continue */
  lastStem: number | null;
}

interface RawPassage {
  line: number;
  number: number;
  title: string;
  paragraphs: string[];
  groups: RawGroup[];
}

const PASSAGE_RE = /^reading passage\s+(\d+)/i;
// "Questions 14-18", and also "Questions 23 and 24" — papers print a two-answer
// group as a conjunction rather than a range. \b keeps "23and24" out; without
// the `and` form the heading is not recognised, so the group is never opened
// and its questions land in the group above it.
const QUESTIONS_RE = /^questions?\s+(\d+)\s*(?:[-–—]|\band\b)\s*(\d+)/i;
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
          tableRows: [],
          noteLines: [],
          lastStem: null,
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
      if (isFurniture(text)) continue;
      // A table completion prints its blanks inside a markdown table. Keep the
      // rows as rows: flattened into the instruction they are unreadable.
      if (raw.trim().startsWith("|")) {
        const cells = tableCells(raw);
        if (cells) group.tableRows.push(cells);
        continue; // spacer and separator rows carry nothing, but are not prose
      }
      // "**A**     Kanayo F. Nwanze"  /  "**i**   Different accounts".
      // Matched on spacing-preserved text: the wide gap is what marks an
      // option line apart from prose that merely starts with a capital.
      const opt = /^([A-Z]|[ivxIVX]+)\s{2,}(.+)$/.exec(unmark(raw));
      if (opt && (opt[1].length === 1 || ROMAN.test(opt[1]))) {
        group.options.push({
          label: opt[1],
          text: plain(opt[2]),
          afterStem: group.lastStem,
        });
        continue;
      }
      // "**1**   a reference to characteristics..."
      const stem = /^(\d+)\s+(.+)$/.exec(text);
      if (stem) {
        const n = Number(stem[1]);
        if (n >= group.from && n <= group.to) {
          group.stems.set(n, withBlanks(stem[2]));
          group.lastStem = n;
          continue;
        }
      }
      if (/^list of/i.test(text)) continue;
      // Once stems have started, loose prose is the tail of a stem that wrapped
      // onto another line, not more instruction.
      if (group.lastStem !== null) {
        const head = group.stems.get(group.lastStem) ?? "";
        group.stems.set(group.lastStem, withBlanks(`${head} ${text}`));
        continue;
      }
      // Notes/summary completion prints its blanks inside the printed body
      // ("the 2…… surrounds the fruit"). Keep the line whole: flattened into
      // the instruction it is unreadable, and the blank loses the sentence
      // that gives it meaning.
      //
      // Below the stem branches, so these two can only claim a line that used
      // to fall through to the instruction — never one a stem would have taken.
      if (HAS_BLANK.test(text)) {
        group.noteLines.push(withBlankTokens(text));
        continue;
      }
      // A trailing note carries no blank ("the tree has yellow flowers and
      // fruit") but is still printed, so it belongs to the body.
      //
      // Only a further BULLET continues the body, never loose prose. A heading
      // this parser does not recognise — "Questions 23 and 24", which has no
      // dash — leaves us inside the previous group, so a rule that ran to the
      // end of the group would swallow the next rubric and the passage after
      // it. Loose prose keeps its old home in the instruction.
      if (group.noteLines.length > 0 && BULLET.test(text)) {
        group.noteLines.push(text);
        continue;
      }
      group.instruction.push(text);
      continue;
    }

    if (passage) {
      if (/^you should spend/i.test(text)) continue;
      if (isFurniture(text)) continue;
      // A lone letter is the paragraph's printed label. Keep it: "which
      // paragraph contains…" questions are unanswerable without it.
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

    // The printed paragraph labels, which paragraph-matching questions point at.
    const paragraphLabels = rp.paragraphs.filter((t) => /^[A-Z]$/.test(t));

    const groups: QuestionGroup[] = rp.groups.map((rg, gi) => {
      const instruction = rg.instruction.join(" ").trim();
      const guess = guessType(
        `${instruction} ${rg.options.map((o) => o.text).join(" ")}`,
        rg.options.length
      );
      // A multiple-choice question prints its OWN A-D under its stem; a
      // matching group prints one list, once, and shares it. Pooled into a
      // single bucket, a six-question group hands every question all 24
      // choices and prints A-D six times over, so split it back out.
      const ownOptions = new Map<number, Option[]>();
      if (guess.type === "multiple_choice_single") {
        for (const o of rg.options) {
          if (o.afterStem === null) continue;
          const list = ownOptions.get(o.afterStem) ?? [];
          list.push(o.text ? { label: o.label, text: o.text } : { label: o.label });
          ownOptions.set(o.afterStem, list);
        }
      }
      let sharedOptions: Option[] = ownOptions.size > 0
        ? []
        : rg.options.map((o) =>
            o.text ? { label: o.label, text: o.text } : { label: o.label }
          );
      // Paragraph-matching groups rarely print a list; they state the span in
      // prose ("Reading Passage 1 has nine paragraphs, A-I"). Expand it.
      if (sharedOptions.length === 0) {
        const span = /\bparagraphs?,?\s+([A-Z])\s*[-–—]\s*([A-Z])\b/.exec(instruction);
        if (span) {
          const from = span[1].charCodeAt(0);
          const to = span[2].charCodeAt(0);
          if (to > from && to - from < 26) {
            sharedOptions = Array.from({ length: to - from + 1 }, (_, k) => ({
              label: String.fromCharCode(from + k),
            }));
          }
        }
      }
      const width = rg.to - rg.from + 1;
      const isLetterSet = guess.type === "multiple_choice_multi";

      // Table completion: mark each numbered blank, and take the cell it sits
      // in as that question's stem.
      const table =
        rg.tableRows.length > 0
          ? rg.tableRows.map((row) => row.map(withBlankTokens))
          : null;
      const notes = rg.noteLines.length > 0 ? rg.noteLines : null;
      // The cell or line a blank sits in is that question's stem, so a review
      // screen listing questions one by one still has something to show.
      const bodyStems = new Map<number, string>();
      for (const cell of [...(table ?? []).flat(), ...(notes ?? [])]) {
        for (const m of cell.matchAll(/\[\[(\d+)\]\]/g)) {
          bodyStems.set(Number(m[1]), cell.replace(/\[\[\d+\]\]/g, "___"));
        }
      }

      const questions: Question[] = [];
      const acceptSet: string[] = [];
      const noStem: number[] = [];
      const noOptions: number[] = [];
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
          const stem = rg.stems.get(n) ?? bodyStems.get(n);
          if (stem) q.content = stem;
          else noStem.push(n);
          const own = ownOptions.get(n);
          if (own) q.options = own;
          else if (ownOptions.size > 0) noOptions.push(n);
          if (answer) q.accept = [answer];
          questions.push(q);
        }
      }

      // ── Answerability ──
      // A question a candidate cannot answer scores zero however good the
      // answer key is, so these are worth saying out loud at import time.
      if (noStem.length > 0) {
        warn(rg.line, `question ${noStem.join(", ")} has no text — the player will show a bare number`);
      }
      // Its neighbours printed their choices, so this one's were meant to be
      // there. Without them the player falls back to bare letters, which is
      // nothing a candidate can choose between.
      if (noOptions.length > 0) {
        warn(rg.line, `question ${noOptions.join(", ")} has no choices of its own — the player will show bare letters`);
      }
      if (
        LISTED_TYPES.has(guess.type) &&
        ownOptions.size === 0 &&
        sharedOptions.every((opt) => !opt.text)
      ) {
        warn(rg.line, `questions ${rg.from}-${rg.to} offer letters with nothing beside them — the printed list of options was not found`);
      }
      if (BY_PARAGRAPH.has(guess.type) && paragraphLabels.length === 0) {
        warn(rg.line, `questions ${rg.from}-${rg.to} ask about lettered paragraphs, but passage ${rp.number} has no paragraph labels`);
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
        ...(table ? { table } : {}),
        ...(notes ? { notes } : {}),
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
    },
    diagnostics,
  };
}
