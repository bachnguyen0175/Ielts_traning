import { describe, it, expect } from "vitest";
import { LocalVocabRepository, memoryStorage } from "./local";

function makeRepo() {
  let n = 0;
  let t = 1000;
  return new LocalVocabRepository(
    memoryStorage(),
    () => (t += 1000), // deterministic clock
    () => `id${++n}`
  );
}

describe("LocalVocabRepository", () => {
  it("starts empty", () => {
    expect(makeRepo().list()).toEqual([]);
  });

  it("adds a word with a Leitner box and due date", () => {
    const repo = makeRepo();
    const item = repo.add({ term: "mitigate", definition: "to make less severe" });
    expect(item.term).toBe("mitigate");
    expect(item.box).toBe(0);
    expect(item.id).toBe("id1");
    expect(repo.list()).toHaveLength(1);
  });

  it("trims the term and ignores empty adds", () => {
    const repo = makeRepo();
    expect(repo.add({ term: "  " })).toBeNull();
    expect(repo.add({ term: "  spice  " })?.term).toBe("spice");
    expect(repo.list()).toHaveLength(1);
  });

  it("promotes the box when reviewed as remembered", () => {
    const repo = makeRepo();
    const item = repo.add({ term: "husk" })!;
    repo.review(item.id, true);
    expect(repo.list()[0].box).toBe(1);
    repo.review(item.id, false);
    expect(repo.list()[0].box).toBe(0);
  });

  it("removes a word", () => {
    const repo = makeRepo();
    const item = repo.add({ term: "aril" })!;
    repo.remove(item.id);
    expect(repo.list()).toEqual([]);
  });

  it("persists across repository instances sharing storage", () => {
    const storage = memoryStorage();
    const a = new LocalVocabRepository(storage);
    a.add({ term: "nutmeg" });
    const b = new LocalVocabRepository(storage);
    expect(b.list().map((i) => i.term)).toContain("nutmeg");
  });
});
