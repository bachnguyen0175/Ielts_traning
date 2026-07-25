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

export interface ContentRepository {
  listTests(): TestSummary[];
  getTest(id: string): Test | undefined;
}

export interface ProfileRepository {
  get(): Profile | null;
  save(profile: Profile): void;
}

export interface AttemptRepository {
  create(testId: string): Attempt;
  get(id: string): Attempt | undefined;
  list(): Attempt[];
  saveResponse(id: string, questionNumber: number, value: string): void;
  toggleFlag(id: string, questionNumber: number): void;
  startSection(id: string, sectionId: string): void;
  advanceSection(id: string): void;
  saveSubmission(id: string, submission: Submission): void;
  complete(id: string, results: SectionScore[], overall: number): void;
}
