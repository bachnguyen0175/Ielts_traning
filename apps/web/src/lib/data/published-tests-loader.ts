"use client";

import { pullPublishedTests } from "@/lib/actions/db-actions";
import { publishedTests } from "./published-tests";

// The fetching half of `published-tests.ts`, kept apart so the store itself
// stays free of server imports. Only client components import this.

let inFlight: Promise<void> | null = null;

/** Fetches the shared library once per page load. Safe to call repeatedly. */
export function loadPublishedTests(): Promise<void> {
  if (publishedTests.ready()) return Promise.resolve();
  inFlight ??= pullPublishedTests()
    .then((tests) => publishedTests.hydrate(tests))
    // Signed out or offline: the built-in and imported tests still work, and
    // `ready` still flips so nothing waits on a load that will not come.
    .catch(() => publishedTests.failed())
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}
