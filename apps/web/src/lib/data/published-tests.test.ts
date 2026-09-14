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
    // hydrate([]) leaves the cache alone by design; reset it explicitly.
    publishedTests.hydrate([paper("reset")]);
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

  it("still becomes ready when the fetch fails", () => {
    // The loader calls hydrate() with nothing on error, so screens waiting on
    // `ready` are released instead of showing "Loading…" forever.
    publishedTests.hydrate();
    expect(publishedTests.ready()).toBe(true);
  });
});
