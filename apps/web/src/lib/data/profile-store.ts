import type { Profile } from "./repositories";
import { profileRepo } from "./client";
import { pullProfile, pushProfile } from "../actions/db-actions";

// One async profile interface for the UI. Guests → localStorage; signed-in →
// Neon via server actions. Closes the ADR-0007 gap where signed-in profile
// edits used to write only localStorage.
export interface ProfileStore {
  get(): Promise<Profile | null>;
  save(p: Profile): Promise<void>;
}

export function profileStore(userId: string | null): ProfileStore {
  if (!userId) {
    const repo = profileRepo(); // localStorage (sync, wrapped as async)
    return {
      get: async () => repo.get(),
      save: async (p) => repo.save(p),
    };
  }
  return {
    get: () => pullProfile(),
    save: async (p) => {
      await pushProfile(p);
    },
  };
}
