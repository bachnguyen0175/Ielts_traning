import type { Test } from "@composed/domain";

// Tests a user imported in their own browser. They live ONLY in localStorage:
// never uploaded, never committed, never deployed. That keeps content the user
// supplies — which may be copyrighted material they own a copy of — entirely on
// their machine, and is why importing is client-side rather than a server
// action writing to the database.

const KEY = "composed:imported-tests";

function read(): Test[] {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as Test[]) : [];
  } catch {
    return [];
  }
}

function write(tests: Test[]): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  window.localStorage.setItem(KEY, JSON.stringify(tests));
}

export const importedTests = {
  list: read,
  /** Adds or replaces by id. Returns the resulting list. */
  save(test: Test): Test[] {
    const next = [...read().filter((t) => t.id !== test.id), test];
    write(next);
    return next;
  },
  remove(id: string): Test[] {
    const next = read().filter((t) => t.id !== id);
    write(next);
    return next;
  },
};
