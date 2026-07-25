import {
  LocalAttemptRepository,
  LocalProfileRepository,
  MockContentRepository,
  memoryStorage,
  type StorageLike,
} from "./local";

/** localStorage in the browser; in-memory fallback for SSR/tests. */
function storage(): StorageLike {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  return memoryStorage();
}

export const contentRepo = new MockContentRepository();
export const profileRepo = () => new LocalProfileRepository(storage());
export const attemptRepo = () => new LocalAttemptRepository(storage());
