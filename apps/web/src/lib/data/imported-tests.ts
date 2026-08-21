import type { Option, Test } from "@composed/domain";

// Tests a user imported in their own browser. They live ONLY in localStorage:
// never uploaded, never committed, never deployed. That keeps content the user
// supplies — which may be material they own a copy of — entirely on their
// machine, and is why importing is client-side rather than a server action
// writing to the database.
//
// Exposed as an external store (`subscribe` + `list`) so components can read it
// with useSyncExternalStore. `list` therefore MUST return a stable reference
// between changes, hence the cache — a fresh array each call would loop.

const KEY = "composed:imported-tests";
const EMPTY: Test[] = [];

let cache: Test[] | null = null;
const listeners = new Set<() => void>();

/**
 * Upgrades tests stored before ADR-0011, whose `sharedOptions` is a list of
 * bare letters rather than `{ label, text? }`. Read as `Option[]`, every option
 * has an undefined label, and the player draws it as an empty chip that looks
 * permanently selected.
 *
 * This repairs the shape only. The option text, completion tables and paragraph
 * labels that those imports never captured are not recoverable here — the file
 * has to be imported again for those.
 */
export function upgradeStored(tests: Test[]): Test[] {
  for (const test of tests) {
    for (const section of test.sections ?? []) {
      for (const passage of section.passages ?? []) {
        for (const group of passage.questionGroups ?? []) {
          const options: unknown = group.sharedOptions;
          if (!Array.isArray(options)) continue;
          group.sharedOptions = options.map((opt) =>
            typeof opt === "string" ? { label: opt } : (opt as Option)
          );
        }
      }
    }
  }
  return tests;
}

function load(): Test[] {
  if (typeof window === "undefined" || !window.localStorage) return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? upgradeStored(parsed as Test[]) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function snapshot(): Test[] {
  if (cache === null) cache = load();
  return cache;
}

function commit(next: Test[]): Test[] {
  cache = next;
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  }
  for (const l of listeners) l();
  return next;
}

export const importedTests = {
  /** Stable snapshot — safe as a useSyncExternalStore getSnapshot. */
  list: snapshot,
  /** SSR snapshot: the server can never see localStorage. */
  serverList: () => EMPTY,
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    // Another tab importing a test should update this one too.
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) {
        cache = null;
        listener();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },
  /**
   * Drops the cached snapshot so the next read hits localStorage again.
   * Same-tab writes go through save/remove and other tabs fire a storage
   * event, so this is only needed when storage is written directly.
   */
  reset(): void {
    cache = null;
    for (const l of listeners) l();
  },
  /** Adds or replaces by id. */
  save(test: Test): Test[] {
    return commit([...snapshot().filter((t) => t.id !== test.id), test]);
  },
  remove(id: string): Test[] {
    return commit(snapshot().filter((t) => t.id !== id));
  },
};
