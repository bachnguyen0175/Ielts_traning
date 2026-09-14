import type { Test } from "@composed/domain";

// Tests an admin published for everyone. The counterpart to
// `imported-tests.ts`: that one holds what THIS browser imported and never
// leaves it; this one holds the shared library, fetched from the database.
//
// This module is deliberately pure — it holds the cache and nothing else, and
// imports no server code. `local.ts` reads it, and `local.ts` is reached from
// server components too; if the store pulled in the server action, it would
// drag the Neon client into every importer of the data seam. Fetching lives in
// `published-tests-loader.ts`, which only client components import.
//
// Exposed as an external store so components read it with useSyncExternalStore,
// so `list` MUST return a stable reference between changes or it loops.

const EMPTY: Test[] = [];

let cache: Test[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

export const publishedTests = {
  /** Stable snapshot — safe as a useSyncExternalStore getSnapshot. */
  list: () => cache,
  /** SSR snapshot: a server render has not fetched these. */
  serverList: () => EMPTY,
  /**
   * Whether a load has finished. Without it, "none published" and "not loaded
   * yet" are the same empty list, and a screen looking a published test up by
   * id would call it missing before it could arrive.
   */
  ready: () => loaded,
  /** Called by the loader once the fetch resolves — or fails, hence no data. */
  hydrate(tests?: Test[]): void {
    if (tests && tests.length > 0) cache = tests;
    loaded = true;
    for (const l of listeners) l();
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
