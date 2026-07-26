import type {
  Attempt,
  SectionScore,
  Skill,
  Submission,
  Test,
} from "@composed/domain";

export interface TestSummary {
  id: string;
  title: string;
  type: "academic" | "general";
  skills: Skill[];
  totalQuestions: number;
  durationMinutes: number;
  source?: string;
  access?: "public" | "private";
}

/**
 * Data-seam interfaces. Screens depend ONLY on these, so the mock/localStorage
 * implementation (mock-first phase) can be swapped for a real backend later
 * without UI changes.
 */

export interface Profile {
  targetBand?: number;
  /** ISO date string */
  testDate?: string;
}

/** A saved vocabulary word for post-test flashcard study (REV-7). */
export interface VocabItem {
  id: string;
  term: string;
  definition?: string;
  /** where it was encountered, e.g. a test/passage title */
  source?: string;
  createdAt: number;
  /** Leitner box (mock mastery level) — see lib/srs.ts (placeholder) */
  box: number;
  /** mock next-review timestamp — see lib/srs.ts (placeholder) */
  dueAt: number;
}

export interface ContentRepository {
  listTests(): TestSummary[];
  getTest(id: string): Test | undefined;
}

export interface ProfileRepository {
  get(): Profile | null;
  save(profile: Profile): void;
}

export interface VocabRepository {
  list(): VocabItem[];
  /** returns the created item, or null if the term was blank */
  add(input: { term: string; definition?: string; source?: string }): VocabItem | null;
  remove(id: string): void;
  /** grade a card: promotes/resets its Leitner box (mock SRS) */
  review(id: string, remembered: boolean): void;
}

export interface AttemptRepository {
  create(testId: string): Attempt;
  get(id: string): Attempt | undefined;
  list(): Attempt[];
  /** replace/insert a whole attempt (used to hydrate from the DB on resume) */
  put(attempt: Attempt): void;
  saveResponse(id: string, questionNumber: number, value: string): void;
  toggleFlag(id: string, questionNumber: number): void;
  startSection(id: string, sectionId: string): void;
  advanceSection(id: string): void;
  saveSubmission(id: string, submission: Submission): void;
  complete(id: string, results: SectionScore[], overall: number): void;
}
