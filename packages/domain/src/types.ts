// Core IELTS domain types — see docs/architecture/data-model.md.
// Framework-free and pure; shared by the app and its tests.

export type Skill = "listening" | "reading" | "writing" | "speaking";

export type QuestionType =
  | "sentence_completion"
  | "summary_completion"
  | "true_false_not_given"
  | "yes_no_not_given"
  | "matching_information"
  | "matching_features"
  | "matching_headings"
  | "multiple_choice_single"
  | "multiple_choice_multi"
  | "short_answer";

/** How a group's answers are matched by the objective scorer. */
export type AnswerMatch =
  | {
      kind: "text";
      caseSensitive?: boolean;
      /** ordered normalizers, e.g. ["trim","collapse-ws","lowercase"] */
      normalize?: NormalizeStep[];
    }
  | { kind: "enum"; options: string[] }
  | { kind: "letter" }
  | { kind: "letter-set"; anyOrder: boolean };

export type NormalizeStep = "trim" | "collapse-ws" | "lowercase";

export interface Question {
  number: number;
  /** stem/statement shown to the candidate (optional in seed fixtures) */
  content?: string;
  /** accepted values for single-answer types (alternates allowed) */
  accept?: string[];
  /** marks this question as a slot of a letter-set group */
  acceptSetMember?: boolean;
}

export interface QuestionGroup {
  id: string;
  range: [number, number];
  type: QuestionType;
  instruction: string;
  sharedOptions?: string[];
  optionsReusable?: boolean;
  answerMatch: AnswerMatch;
  questions: Question[];
  /** letter-set: how many to choose */
  selectCount?: number;
  /** letter-set: the accepted set of letters (order-independent) */
  acceptSet?: string[];
}

export interface Passage {
  id: string;
  order: number;
  title: string;
  /** prose or audio reference; may be a placeholder in reference seeds */
  body?: string;
  bodyRef?: string;
  questionGroups: QuestionGroup[];
}

export interface Prompt {
  id: string;
  taskType: string;
  instruction: string;
  /** writing: target words; speaking: prep/speak seconds */
  targetWords?: number;
  prepSeconds?: number;
  speakSeconds?: number;
  imageAlt?: string;
}

export interface Section {
  id: string;
  skill: Skill;
  order: number;
  durationSeconds: number;
  rules?: {
    singleTimer?: boolean;
    autoAdvanceOnExpiry?: boolean;
    audioPlayOnce?: boolean;
  };
  /** listening/reading */
  passages?: Passage[];
  /** writing/speaking */
  prompts?: Prompt[];
  /** listening audio asset */
  audioSrc?: string;
}

export interface Test {
  id: string;
  title: string;
  type: "academic" | "general";
  sections: Section[];
  /** e.g. "Cambridge IELTS 15" or "Composed original" */
  source?: string;
  /** private = derived from copyrighted material; never publicly distribute */
  access?: "public" | "private";
}

// ── Attempt-side ────────────────────────────────────────────────────────────

export type ResponseMap = Record<number, string>;

export interface QuestionMark {
  number: number;
  correct: boolean;
}

export interface SectionScore {
  sectionId: string;
  skill: Skill;
  /** raw marks earned */
  raw: number;
  /** maximum marks available */
  max: number;
  /** converted IELTS band (L/R only) */
  band?: number;
  marks: QuestionMark[];
}

export interface Submission {
  promptId: string;
  kind: "writing_text" | "speaking_audio";
  textContent?: string;
  audioUrl?: string;
  durationSeconds?: number;
}

export type AttemptStatus = "in_progress" | "submitted" | "scored";

export interface Attempt {
  id: string;
  testId: string;
  status: AttemptStatus;
  /** epoch ms — overall start */
  startedAt: number;
  /** sectionId → epoch ms when that section's timer started */
  sectionStartedAt: Record<string, number>;
  currentSectionIndex: number;
  responses: ResponseMap;
  flagged: number[];
  submissions: Submission[];
  results?: SectionScore[];
  overall?: number;
  submittedAt?: number;
}

