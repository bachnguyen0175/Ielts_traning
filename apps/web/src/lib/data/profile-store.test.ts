import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the server-action boundary so this unit test doesn't pull server-only
// modules (Clerk auth / Drizzle repos).
vi.mock("../actions/db-actions", () => ({
  pullProfile: vi.fn(),
  pushProfile: vi.fn(),
}));

import { profileStore } from "./profile-store";
import { pullProfile, pushProfile } from "../actions/db-actions";

describe("profileStore", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("routes guest reads/writes to localStorage", async () => {
    const store = profileStore(null);
    expect(await store.get()).toBeNull();
    await store.save({ targetBand: 7, testDate: "2026-09-01" });
    expect(await store.get()).toEqual({ targetBand: 7, testDate: "2026-09-01" });
    expect(pushProfile).not.toHaveBeenCalled();
  });

  it("routes signed-in reads/writes to server actions", async () => {
    vi.mocked(pushProfile).mockResolvedValue(true);
    vi.mocked(pullProfile).mockResolvedValue({ targetBand: 8 });
    const store = profileStore("user_1");

    await store.save({ targetBand: 8 });
    expect(pushProfile).toHaveBeenCalledWith({ targetBand: 8 });

    expect(await store.get()).toEqual({ targetBand: 8 });
    // guest storage untouched
    expect(localStorage.getItem("composed.profile")).toBeNull();
  });
});
