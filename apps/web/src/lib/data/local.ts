import type { Attempt, SectionScore, Submission, Test } from "@composed/domain";
import { SAMPLE_MOCK } from "../content/sample-mock";
import { INGESTED_TESTS } from "../content/ingested";
import { dueAt, reviewCard } from "../srs";
import type {
  AttemptRepository,
  ContentRepository,
  Profile,
  ProfileRepository,
  TestSummary,
  VocabItem,
  VocabRepository,
} from "./repositories";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** In-memory StorageLike — used by tests and as an SSR-safe fallback. */
export function memoryStorage(): StorageLike {
  const m = new Map<string, string>();
  return {
    getItem: (k) => (m.has(k) ? (m.get(k) as string) : null),
    setItem: (k, v) => {
      m.set(k, v);
    },
    removeItem: (k) => {
      m.delete(k);
    },
  };
}

const TESTS: Test[] = [SAMPLE_MOCK, ...INGESTED_TESTS];

function summarize(t: Test): TestSummary {
  const skills = t.sections.map((s) => s.skill);
  const totalQuestions = t.sections
    .flatMap((s) => s.passages ?? [])
    .flatMap((p) => p.questionGroups)
    .reduce((n, g) => n + g.questions.length, 0);
  const durationMinutes = Math.round(
    t.sections.reduce((n, s) => n + s.durationSeconds, 0) / 60
  );
  return {
    id: t.id,
    title: t.title,
    type: t.type,
    skills,
    totalQuestions,
    durationMinutes,
    source: t.source,
    access: t.access,
  };
}

export class MockContentRepository implements ContentRepository {
  listTests(): TestSummary[] {
    return TESTS.map(summarize);
  }
  getTest(id: string) {
    return TESTS.find((t) => t.id === id);
  }
}

const VOCAB_KEY = "composed.vocab";

export class LocalVocabRepository implements VocabRepository {
  constructor(
    private storage: StorageLike,
    private now: () => number = () => Date.now(),
    private genId: () => string = defaultId
  ) {}

  private readAll(): VocabItem[] {
    const raw = this.storage.getItem(VOCAB_KEY);
    return raw ? (JSON.parse(raw) as VocabItem[]) : [];
  }
  private writeAll(all: VocabItem[]): void {
    this.storage.setItem(VOCAB_KEY, JSON.stringify(all));
  }

  list(): VocabItem[] {
    return this.readAll();
  }

  add(input: { term: string; definition?: string; source?: string }): VocabItem | null {
    const term = input.term.trim();
    if (!term) return null;
    const now = this.now();
    const item: VocabItem = {
      id: this.genId(),
      term,
      definition: input.definition?.trim() || undefined,
      source: input.source,
      createdAt: now,
      box: 0,
      dueAt: dueAt(0, now),
    };
    this.writeAll([...this.readAll(), item]);
    return item;
  }

  remove(id: string): void {
    this.writeAll(this.readAll().filter((i) => i.id !== id));
  }

  review(id: string, remembered: boolean): void {
    const all = this.readAll();
    const item = all.find((i) => i.id === id);
    if (!item) return;
    Object.assign(item, reviewCard(item, remembered, this.now()));
    this.writeAll(all);
  }
}

const PROFILE_KEY = "composed.profile";

export class LocalProfileRepository implements ProfileRepository {
  constructor(private storage: StorageLike) {}
  get(): Profile | null {
    const raw = this.storage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  }
  save(profile: Profile): void {
    this.storage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }
}

const ATTEMPTS_KEY = "composed.attempts";

function defaultId(): string {
  const c = globalThis.crypto;
  if (c && "randomUUID" in c) return c.randomUUID();
  return Math.random().toString(36).slice(2);
}

export class LocalAttemptRepository implements AttemptRepository {
  constructor(
    private storage: StorageLike,
    private now: () => number = () => Date.now(),
    private genId: () => string = defaultId
  ) {}

  private readAll(): Attempt[] {
    const raw = this.storage.getItem(ATTEMPTS_KEY);
    return raw ? (JSON.parse(raw) as Attempt[]) : [];
  }
  private writeAll(all: Attempt[]): void {
    this.storage.setItem(ATTEMPTS_KEY, JSON.stringify(all));
  }
  private mutate(id: string, fn: (a: Attempt) => void): void {
    const all = this.readAll();
    const target = all.find((a) => a.id === id);
    if (!target) return;
    fn(target);
    this.writeAll(all);
  }

  create(testId: string): Attempt {
    const attempt: Attempt = {
      id: this.genId(),
      testId,
      status: "in_progress",
      startedAt: this.now(),
      sectionStartedAt: {},
      currentSectionIndex: 0,
      responses: {},
      flagged: [],
      submissions: [],
    };
    const all = this.readAll();
    all.push(attempt);
    this.writeAll(all);
    return attempt;
  }

  get(id: string): Attempt | undefined {
    return this.readAll().find((a) => a.id === id);
  }

  list(): Attempt[] {
    return this.readAll();
  }

  saveResponse(id: string, questionNumber: number, value: string): void {
    this.mutate(id, (a) => {
      a.responses[questionNumber] = value;
    });
  }

  toggleFlag(id: string, questionNumber: number): void {
    this.mutate(id, (a) => {
      a.flagged = a.flagged.includes(questionNumber)
        ? a.flagged.filter((n) => n !== questionNumber)
        : [...a.flagged, questionNumber];
    });
  }

  startSection(id: string, sectionId: string): void {
    this.mutate(id, (a) => {
      if (a.sectionStartedAt[sectionId] == null) {
        a.sectionStartedAt[sectionId] = this.now();
      }
    });
  }

  advanceSection(id: string): void {
    this.mutate(id, (a) => {
      a.currentSectionIndex += 1;
    });
  }

  saveSubmission(id: string, submission: Submission): void {
    this.mutate(id, (a) => {
      a.submissions = [
        ...a.submissions.filter((s) => s.promptId !== submission.promptId),
        submission,
      ];
    });
  }

  complete(id: string, results: SectionScore[], overall: number): void {
    this.mutate(id, (a) => {
      a.results = results;
      a.overall = overall;
      a.status = "submitted";
      a.submittedAt = this.now();
    });
  }
}
