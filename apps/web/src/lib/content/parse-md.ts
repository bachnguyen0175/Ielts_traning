import type {
  AnswerMatch,
  Passage,
  Prompt,
  Question,
  QuestionGroup,
  QuestionType,
  Section,
  Skill,
  Test,
} from "@composed/domain";

// Parses the authored-content markdown dialect into a domain `Test`.
// Format reference: docs/content-authoring-format.md. Decision: ADR-0008.
//
// Pure — no filesystem, no process. The two environment-dependent validations
// (does the audio asset exist; does the id collide) are injected via
// ParseOptions so the CLI can supply them and tests can fake them.

export interface Diagnostic {
  line: number;
  severity: "error" | "warning";
  message: string;
}

export interface ParseOptions {
  /** True if a public asset path such as "/audio/x.wav" exists. */
  audioExists?: (src: string) => boolean;
  /** Ids already taken by other tests. */
  existingIds?: readonly string[];
}

export interface ParseResult {
  /** null when any diagnostic is an error. */
  test: Test | null;
  diagnostics: Diagnostic[];
}

const QUESTION_TYPES = new Set<string>([
  "sentence_completion",
  "summary_completion",
  "true_false_not_given",
  "yes_no_not_given",
  "matching_information",
  "matching_features",
  "matching_headings",
  "multiple_choice_single",
  "multiple_choice_multi",
  "short_answer",
]);

const LETTER_TYPES = new Set<string>([
  "multiple_choice_single",
  "matching_information",
  "matching_features",
  "matching_headings",
]);

const SKILLS = new Set<string>(["listening", "reading", "writing", "speaking"]);

const SECTION_KEYS = new Set(["duration", "audio", "rules", "id"]);
const PASSAGE_KEYS = new Set(["id"]);
const PROMPT_KEYS = new Set(["words", "image", "prep", "speak", "id"]);
const GROUP_KEYS = new Set([
  "options",
  "reusable",
  "select",
  "answers",
  "match",
  "id",
]);

const RULE_WORDS: Record<string, keyof NonNullable<Section["rules"]>> = {
  "audio-play-once": "audioPlayOnce",
  "single-timer": "singleTimer",
  "auto-advance": "autoAdvanceOnExpiry",
};

/** Authentic timings, for the soft duration warning. */
const AUTHENTIC_SECONDS: Record<Skill, number> = {
  listening: 1800,
  reading: 3600,
  writing: 3600,
  speaking: 840,
};

const ENUM_OPTIONS: Record<string, string[]> = {
  true_false_not_given: ["TRUE", "FALSE", "NOT GIVEN"],
  yes_no_not_given: ["YES", "NO", "NOT GIVEN"],
};

// ── Raw shapes (line-tagged, pre-validation) ─────────────────────────────────

interface Attr {
  value: string;
  line: number;
}

interface RawQuestion {
  line: number;
  number: number;
  content: string;
  answer: string | null;
}

interface RawGroup {
  line: number;
  range: [number, number];
  type: string;
  attrs: Map<string, Attr>;
  instruction: string[];
  questions: RawQuestion[];
}

/** Serves both passages (L/R) and prompts (W/S) — the skill decides. */
interface RawBlock {
  line: number;
  heading: string;
  attrs: Map<string, Attr>;
  prose: string[][];
  groups: RawGroup[];
}

interface RawSection {
  line: number;
  skill: string;
  attrs: Map<string, Attr>;
  blocks: RawBlock[];
}

// ── Tokenizer ────────────────────────────────────────────────────────────────

/** Joins wrapped lines within a paragraph, and paragraphs with a blank line. */
function joinProse(paragraphs: string[][]): string {
  return paragraphs
    .filter((p) => p.length > 0)
    .map((p) => p.join(" ").trim())
    .join("\n\n");
}

function splitAnswer(text: string): { content: string; answer: string | null } {
  // Spaced " = " is the separator; the LAST one wins so stems may contain "=".
  const i = text.lastIndexOf(" = ");
  if (i >= 0) {
    return { content: text.slice(0, i).trim(), answer: text.slice(i + 3).trim() };
  }
  if (text.startsWith("= ")) return { content: "", answer: text.slice(2).trim() };
  return { content: text.trim(), answer: null };
}

interface Tokenized {
  front: Map<string, Attr>;
  sections: RawSection[];
  diagnostics: Diagnostic[];
}

function tokenize(source: string): Tokenized {
  const lines = source.split(/\r?\n/);
  const diagnostics: Diagnostic[] = [];
  const front = new Map<string, Attr>();
  const sections: RawSection[] = [];

  let section: RawSection | null = null;
  let block: RawBlock | null = null;
  let group: RawGroup | null = null;
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0 && block && !group) block.prose.push(paragraph);
    else if (paragraph.length > 0 && group) group.instruction.push(...paragraph);
    paragraph = [];
  };

  // Front matter
  let i = 0;
  if (lines[0]?.trim() === "---") {
    i = 1;
    while (i < lines.length && lines[i].trim() !== "---") {
      const m = /^([a-zA-Z]+):\s*(.*)$/.exec(lines[i].trim());
      if (m) front.set(m[1], { value: m[2].trim(), line: i + 1 });
      i += 1;
    }
    i += 1;
  }

  let inComment = false;
  for (; i < lines.length; i += 1) {
    const raw = lines[i];
    const line = i + 1;
    const text = raw.trim();

    // HTML comments are editorial notes, never content.
    if (inComment) {
      if (text.includes("-->")) inComment = false;
      continue;
    }
    if (text.startsWith("<!--")) {
      flushParagraph();
      if (!text.includes("-->")) inComment = true;
      continue;
    }

    if (text === "") {
      flushParagraph();
      continue;
    }

    if (text.startsWith("### ")) {
      flushParagraph();
      group = null;
      block = {
        line,
        heading: text.slice(4).trim(),
        attrs: new Map(),
        prose: [],
        groups: [],
      };
      if (!section) {
        diagnostics.push({
          line,
          severity: "error",
          message: "passage or prompt appears before any '## <Skill>' section",
        });
      } else {
        section.blocks.push(block);
      }
      continue;
    }

    if (text.startsWith("## ")) {
      flushParagraph();
      group = null;
      block = null;
      section = {
        line,
        skill: text.slice(3).trim().toLowerCase(),
        attrs: new Map(),
        blocks: [],
      };
      sections.push(section);
      continue;
    }

    const groupHeader = /^\[(\d+)\s*-\s*(\d+)\]\s+(\S+)$/.exec(text);
    if (groupHeader) {
      flushParagraph();
      group = {
        line,
        range: [Number(groupHeader[1]), Number(groupHeader[2])],
        type: groupHeader[3],
        attrs: new Map(),
        instruction: [],
        questions: [],
      };
      if (!block) {
        diagnostics.push({
          line,
          severity: "error",
          message: "question group appears before any '### <Title>' passage",
        });
      } else {
        block.groups.push(group);
      }
      continue;
    }

    const question = /^(\d+)\.\s*(.*)$/.exec(text);
    if (question && group) {
      flushParagraph();
      group.questions.push({
        line,
        number: Number(question[1]),
        ...splitAnswer(question[2]),
      });
      continue;
    }

    const attr = /^([a-zA-Z]+):\s*(.*)$/.exec(text);
    if (attr) {
      const key = attr[1];
      const target = group
        ? { attrs: group.attrs, keys: GROUP_KEYS }
        : block
          ? {
              attrs: block.attrs,
              // A block is a prompt or a passage; accept either key set and let
              // the build phase reject keys that don't fit the skill.
              keys: new Set([...PASSAGE_KEYS, ...PROMPT_KEYS]),
            }
          : section
            ? { attrs: section.attrs, keys: SECTION_KEYS }
            : null;
      if (target && target.keys.has(key)) {
        target.attrs.set(key, { value: attr[2].trim(), line });
        continue;
      }
      // Not a known key — falls through and is treated as prose, so an
      // instruction like "Choose TWO letters: A-E." survives intact.
    }

    paragraph.push(text);
  }
  flushParagraph();

  return { front, sections, diagnostics };
}

// ── Build ────────────────────────────────────────────────────────────────────

function parseDuration(value: string): number | null {
  const m = /^(\d+)(s|m|h)$/.exec(value);
  if (!m) return null;
  const n = Number(m[1]);
  return m[2] === "s" ? n : m[2] === "m" ? n * 60 : n * 3600;
}

function inferMatch(type: QuestionType): AnswerMatch {
  if (ENUM_OPTIONS[type]) return { kind: "enum", options: ENUM_OPTIONS[type] };
  if (type === "multiple_choice_multi") {
    return { kind: "letter-set", anyOrder: true };
  }
  if (LETTER_TYPES.has(type)) return { kind: "letter" };
  return { kind: "text", normalize: ["trim", "collapse-ws", "lowercase"] };
}

export function parseMarkdown(
  source: string,
  options: ParseOptions = {}
): ParseResult {
  const { front, sections: rawSections, diagnostics } = tokenize(source);

  const error = (line: number, message: string) =>
    diagnostics.push({ line, severity: "error", message });
  const warn = (line: number, message: string) =>
    diagnostics.push({ line, severity: "warning", message });

  const id = front.get("id");
  const title = front.get("title");
  if (!id?.value) error(1, "front matter is missing 'id'");
  if (!title?.value) error(1, "front matter is missing 'title'");
  if (id?.value && options.existingIds?.includes(id.value)) {
    error(id.line, `test id "${id.value}" already exists`);
  }
  if (rawSections.length === 0) error(1, "no '## <Skill>' sections found");

  const seenNumbers = new Map<number, number>();
  const sections: Section[] = [];

  rawSections.forEach((rs, sectionIndex) => {
    if (!SKILLS.has(rs.skill)) {
      error(rs.line, `unknown section "${rs.skill}" (expected Listening, Reading, Writing or Speaking)`);
      return;
    }
    const skill = rs.skill as Skill;

    const durationAttr = rs.attrs.get("duration");
    const durationSeconds = durationAttr
      ? parseDuration(durationAttr.value)
      : null;
    if (!durationAttr) {
      error(rs.line, `${skill} section is missing 'duration:'`);
    } else if (durationSeconds === null) {
      error(durationAttr.line, `cannot read duration "${durationAttr.value}" (expected e.g. 30m, 1800s, 1h)`);
    } else if (durationSeconds <= 0) {
      error(durationAttr.line, "duration must be greater than zero");
    } else if (durationSeconds !== AUTHENTIC_SECONDS[skill]) {
      warn(durationAttr.line, `${skill} duration ${durationAttr.value} differs from the authentic ${AUTHENTIC_SECONDS[skill] / 60}m`);
    }

    const rules: NonNullable<Section["rules"]> = {};
    const rulesAttr = rs.attrs.get("rules");
    for (const word of rulesAttr?.value.split(",").map((s) => s.trim()) ?? []) {
      if (word === "") continue;
      const key = RULE_WORDS[word];
      if (!key) error(rulesAttr!.line, `unknown rule "${word}"`);
      else rules[key] = true;
    }

    const audio = rs.attrs.get("audio");
    if (skill === "listening") {
      if (!audio) error(rs.line, "listening section is missing 'audio:'");
      else if (options.audioExists && !options.audioExists(audio.value)) {
        error(audio.line, `audio file "${audio.value}" not found under public/`);
      }
      if (!rules.audioPlayOnce) {
        warn(rs.line, "listening section does not declare 'audio-play-once' — the play-once fidelity rule is not enforced");
      }
    }

    const wantsPassages = skill === "listening" || skill === "reading";
    if (rs.blocks.length === 0) {
      error(rs.line, `${skill} section has no '### <Title>' ${wantsPassages ? "passages" : "prompts"}`);
    }

    const sectionId = rs.attrs.get("id")?.value ?? `s-${skill}`;
    const section: Section = {
      id: sectionId,
      skill,
      order: sectionIndex + 1,
      durationSeconds: durationSeconds ?? 0,
    };
    if (Object.keys(rules).length > 0) section.rules = rules;
    if (audio) section.audioSrc = audio.value;

    if (wantsPassages) {
      section.passages = rs.blocks.map((rb, passageIndex) =>
        buildPassage(rb, skill, passageIndex, { error, warn }, seenNumbers)
      );
      // Contiguity is a per-section property, so check it once here.
      const numbers = section.passages
        .flatMap((p) => p.questionGroups)
        .flatMap((g) => g.questions.map((q) => q.number))
        .sort((a, b) => a - b);
      for (let n = 1; n < numbers.length; n += 1) {
        if (numbers[n] !== numbers[n - 1] + 1) {
          error(rs.line, `${skill} question numbers jump from ${numbers[n - 1]} to ${numbers[n]}`);
          break;
        }
      }
    } else {
      section.prompts = rs.blocks.map((rb) => buildPrompt(rb, skill, error));
    }

    sections.push(section);
  });

  const failed = diagnostics.some((d) => d.severity === "error");
  if (failed || !id?.value || !title?.value) {
    return { test: null, diagnostics };
  }

  const test: Test = {
    id: id.value,
    title: title.value,
    type: front.get("type")?.value === "general" ? "general" : "academic",
    sections,
  };
  const source_ = front.get("source")?.value;
  if (source_) test.source = source_;

  return { test, diagnostics };
}

type Report = {
  error: (line: number, message: string) => void;
  warn: (line: number, message: string) => void;
};

function buildPassage(
  rb: RawBlock,
  skill: Skill,
  index: number,
  { error, warn }: Report,
  seenNumbers: Map<number, number>
): Passage {
  const passageId =
    rb.attrs.get("id")?.value ?? `${skill === "listening" ? "l" : "r"}-p${index + 1}`;
  const body = joinProse(rb.prose);
  if (skill === "reading" && body === "") {
    warn(rb.line, `reading passage "${rb.heading}" has no body text`);
  }

  const passage: Passage = {
    id: passageId,
    order: index + 1,
    title: rb.heading,
    questionGroups: rb.groups.map((rg, groupIndex) =>
      buildGroup(rg, passageId, groupIndex, { error, warn }, seenNumbers)
    ),
  };
  if (body !== "") passage.body = body;
  return passage;
}

function buildGroup(
  rg: RawGroup,
  passageId: string,
  index: number,
  { error }: Report,
  seenNumbers: Map<number, number>
): QuestionGroup {
  if (!QUESTION_TYPES.has(rg.type)) {
    error(rg.line, `unknown question type "${rg.type}"`);
  }
  const type = rg.type as QuestionType;
  const [from, to] = rg.range;
  const width = to - from + 1;

  const options = rg.attrs
    .get("options")
    ?.value.split("|")
    .map((s) => s.trim())
    .filter((s) => s !== "");
  if (LETTER_TYPES.has(type) && !options) {
    error(rg.line, `${type} needs an 'options:' line`);
  }

  const isLetterSet = type === "multiple_choice_multi";
  const answersAttr = rg.attrs.get("answers");
  const selectAttr = rg.attrs.get("select");
  const acceptSet = answersAttr?.value
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "");
  const selectCount = selectAttr ? Number(selectAttr.value) : undefined;

  const questions: Question[] = [];
  if (isLetterSet) {
    if (!options) error(rg.line, "multiple_choice_multi needs an 'options:' line");
    if (!acceptSet) error(rg.line, "multiple_choice_multi needs an 'answers:' line");
    if (selectCount === undefined) {
      error(rg.line, "multiple_choice_multi needs a 'select:' line");
    } else if (selectCount !== width || selectCount !== (acceptSet?.length ?? -1)) {
      error(rg.line, `select: ${selectCount} must equal the range width (${width}) and the answers count (${acceptSet?.length ?? 0})`);
    }
    for (const letter of acceptSet ?? []) {
      if (options && !options.includes(letter)) {
        error(answersAttr!.line, `answer "${letter}" is not in options ${options.join(" | ")}`);
      }
    }
    if (rg.questions.length > 0) {
      error(rg.questions[0].line, "multiple_choice_multi takes no numbered question lines — use 'select:' and 'answers:'");
    }
    for (let n = from; n <= to; n += 1) {
      questions.push({ number: n, acceptSetMember: true });
      recordNumber(n, rg.line, error, seenNumbers);
    }
  } else {
    if (rg.questions.length !== width) {
      error(rg.line, `group [${from}-${to}] declares ${width} question(s) but has ${rg.questions.length}`);
    }
    for (const rq of rg.questions) {
      if (rq.number < from || rq.number > to) {
        error(rq.line, `question ${rq.number} is outside the group range [${from}-${to}]`);
      }
      recordNumber(rq.number, rq.line, error, seenNumbers);
      if (rq.answer === null) {
        error(rq.line, `question ${rq.number} has no answer (expected "... = answer")`);
      }
      const accept = rq.answer
        ? rq.answer.split(" / ").map((s) => s.trim()).filter((s) => s !== "")
        : [];
      for (const value of accept) {
        if (LETTER_TYPES.has(type) && options && !options.includes(value)) {
          error(rq.line, `answer "${value}" is not in options ${options.join(" | ")}`);
        }
        const enumOptions = ENUM_OPTIONS[type];
        if (enumOptions && !enumOptions.includes(value)) {
          error(rq.line, `answer "${value}" must be exactly one of ${enumOptions.join(", ")}`);
        }
      }
      const question: Question = { number: rq.number };
      if (rq.content !== "") question.content = rq.content;
      if (accept.length > 0) question.accept = accept;
      questions.push(question);
    }
  }

  const group: QuestionGroup = {
    id: rg.attrs.get("id")?.value ?? `${passageId}-g${index + 1}`,
    range: [from, to],
    type,
    instruction: rg.instruction.join(" ").trim(),
    ...(options ? { sharedOptions: options } : {}),
    ...(rg.attrs.get("reusable")?.value === "yes"
      ? { optionsReusable: true }
      : {}),
    answerMatch: readMatchOverride(rg, error) ?? inferMatch(type),
    questions,
    ...(selectCount !== undefined ? { selectCount } : {}),
    ...(acceptSet ? { acceptSet } : {}),
  };
  if (group.instruction === "") {
    error(rg.line, `group [${from}-${to}] has no instruction line`);
  }
  return group;
}

function readMatchOverride(
  rg: RawGroup,
  error: Report["error"]
): AnswerMatch | null {
  const attr = rg.attrs.get("match");
  if (!attr) return null;
  const words = attr.value.split(/\s+/);
  if (words[0] !== "text") {
    error(attr.line, `unsupported match override "${attr.value}" (only 'text' and 'text case-sensitive' are recognised)`);
    return null;
  }
  const match: AnswerMatch = {
    kind: "text",
    normalize: ["trim", "collapse-ws", "lowercase"],
  };
  if (words.includes("case-sensitive")) match.caseSensitive = true;
  return match;
}

function recordNumber(
  n: number,
  line: number,
  error: Report["error"],
  seen: Map<number, number>
) {
  const first = seen.get(n);
  if (first !== undefined) {
    error(line, `question number ${n} is already used on line ${first}`);
  } else {
    seen.set(n, line);
  }
}

function buildPrompt(
  rb: RawBlock,
  skill: Skill,
  error: Report["error"]
): Prompt {
  // "### Task 1 — task1" — the taskType follows the last dash separator.
  const parts = rb.heading.split(/\s+[—–-]\s+/);
  const taskType = parts.length > 1 ? parts[parts.length - 1].trim() : "";
  if (taskType === "") {
    error(rb.line, `prompt "${rb.heading}" is missing its task type (expected "### Task 1 — task1")`);
  }
  const instruction = joinProse(rb.prose);
  if (instruction === "") {
    error(rb.line, `prompt "${rb.heading}" has no instruction text`);
  }
  if (rb.groups.length > 0) {
    error(rb.groups[0].line, `${skill} prompts cannot contain question groups`);
  }

  const prompt: Prompt = {
    id: rb.attrs.get("id")?.value ?? `${skill === "writing" ? "w" : "sp"}-${taskType}`,
    taskType,
    instruction,
  };
  const words = rb.attrs.get("words");
  const prep = rb.attrs.get("prep");
  const speak = rb.attrs.get("speak");
  const image = rb.attrs.get("image");
  if (words) prompt.targetWords = Number(words.value);
  if (prep) prompt.prepSeconds = parseDuration(prep.value) ?? Number(prep.value);
  if (speak) prompt.speakSeconds = parseDuration(speak.value) ?? Number(speak.value);
  if (image) prompt.imageAlt = image.value;
  return prompt;
}
