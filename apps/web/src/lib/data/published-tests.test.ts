import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Test } from "@composed/domain";
import { publishedTests } from "./published-tests";

const paper = (id: string): Test => ({
  id,
  title: id,
  type: "academic",
  sections: [],
});

describe("publishedTests store", () => {
  beforeEach(() => {
    publishedTests.hydrate([]);
  });

  it("returns the same array reference between changes", () => {
    // useSyncExternalStore loops forever if the snapshot is a fresh array.
    expect(publishedTests.list()).toBe(publishedTests.list());
  });

  it("is not ready until a load has resolved", () => {
    // Only the loader flips this; "none published" and "not fetched yet" are
    // the same empty list without it.
    expect(typeof publishedTests.ready()).toBe("boolean");
  });

  it("tells subscribers when the library arrives", () => {
    const seen = vi.fn();
    const unsubscribe = publishedTests.subscribe(seen);
    publishedTests.hydrate([paper("a"), paper("b")]);
    expect(seen).toHaveBeenCalled();
    expect(publishedTests.list().map((t) => t.id)).toEqual(["a", "b"]);
    unsubscribe();
    publishedTests.hydrate([paper("c")]);
    expect(seen).toHaveBeenCalledTimes(1);
  });

  it("empties when the last published test is taken down", () => {
    publishedTests.hydrate([paper("a")]);
    expect(publishedTests.list()).toHaveLength(1);
    // An empty fetch means an empty library, not "nothing to do" — leaving the
    // old list up would keep an unpublished paper on screen until a reload.
    publishedTests.hydrate([]);
    expect(publishedTests.list()).toEqual([]);
  });

  it("keeps what it has when the fetch fails, but stops waiting", () => {
    publishedTests.hydrate([paper("a")]);
    publishedTests.failed();
    // A dropped connection is not evidence that the library is empty.
    expect(publishedTests.list()).toHaveLength(1);
    expect(publishedTests.ready()).toBe(true);
  });
});
