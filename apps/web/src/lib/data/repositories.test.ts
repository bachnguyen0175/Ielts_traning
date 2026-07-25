import { describe, it, expect } from "vitest";
import {
  MockContentRepository,
  LocalProfileRepository,
  LocalAttemptRepository,
  memoryStorage,
} from "./local";
import { SAMPLE_MOCK } from "../content/sample-mock";

describe("MockContentRepository", () => {
  const repo = new MockContentRepository();
  it("returns the sample test by id", () => {
    expect(repo.getTest(SAMPLE_MOCK.id)?.title).toBe(SAMPLE_MOCK.title);
  });
  it("lists tests", () => {
    expect(repo.listTests().map((t) => t.id)).toContain(SAMPLE_MOCK.id);
  });
});

describe("LocalProfileRepository", () => {
  it("returns null before anything is saved", () => {
    expect(new LocalProfileRepository(memoryStorage()).get()).toBeNull();
  });
  it("round-trips a saved profile", () => {
    const repo = new LocalProfileRepository(memoryStorage());
    repo.save({ targetBand: 7.5, testDate: "2026-09-01" });
    expect(repo.get()).toEqual({ targetBand: 7.5, testDate: "2026-09-01" });
  });
});

describe("LocalAttemptRepository", () => {
  function makeRepo() {
    let seq = 0;
    return new LocalAttemptRepository(
      memoryStorage(),
      () => 1000,
      () => `a${++seq}`
    );
  }

  it("creates an in-progress attempt anchored to the injected clock", () => {
    const repo = makeRepo();
    const a = repo.create(SAMPLE_MOCK.id);
    expect(a).toMatchObject({
      id: "a1",
      testId: SAMPLE_MOCK.id,
      status: "in_progress",
      startedAt: 1000,
      currentSectionIndex: 0,
      responses: {},
      flagged: [],
    });
    expect(repo.get("a1")?.id).toBe("a1");
    expect(repo.list()).toHaveLength(1);
  });

  it("saves responses", () => {
    const repo = makeRepo();
    repo.create(SAMPLE_MOCK.id);
    repo.saveResponse("a1", 1, "B");
    expect(repo.get("a1")?.responses[1]).toBe("B");
  });

  it("toggles a flag on and off", () => {
    const repo = makeRepo();
    repo.create(SAMPLE_MOCK.id);
    repo.toggleFlag("a1", 3);
    expect(repo.get("a1")?.flagged).toEqual([3]);
    repo.toggleFlag("a1", 3);
    expect(repo.get("a1")?.flagged).toEqual([]);
  });

  it("starts a section's clock once (idempotent)", () => {
    const repo = makeRepo();
    repo.create(SAMPLE_MOCK.id);
    repo.startSection("a1", "s-reading");
    repo.startSection("a1", "s-reading");
    expect(repo.get("a1")?.sectionStartedAt["s-reading"]).toBe(1000);
  });

  it("advances the section cursor", () => {
    const repo = makeRepo();
    repo.create(SAMPLE_MOCK.id);
    repo.advanceSection("a1");
    expect(repo.get("a1")?.currentSectionIndex).toBe(1);
  });

  it("stores a submission, replacing by promptId", () => {
    const repo = makeRepo();
    repo.create(SAMPLE_MOCK.id);
    repo.saveSubmission("a1", { promptId: "w-t1", kind: "writing_text", textContent: "draft" });
    repo.saveSubmission("a1", { promptId: "w-t1", kind: "writing_text", textContent: "final" });
    const subs = repo.get("a1")?.submissions ?? [];
    expect(subs).toHaveLength(1);
    expect(subs[0].textContent).toBe("final");
  });

  it("completes an attempt with results", () => {
    const repo = makeRepo();
    repo.create(SAMPLE_MOCK.id);
    repo.complete("a1", [], 7);
    const a = repo.get("a1");
    expect(a?.status).toBe("submitted");
    expect(a?.overall).toBe(7);
    expect(a?.submittedAt).toBe(1000);
  });
});
