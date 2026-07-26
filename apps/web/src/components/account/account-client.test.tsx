import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/actions/db-actions", () => ({
  pullProfile: vi.fn(),
  pushProfile: vi.fn(),
}));

import { AccountClient } from "./account-client";
import { pushProfile } from "@/lib/actions/db-actions";

describe("AccountClient (guest)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("loads the saved profile into the fields", async () => {
    localStorage.setItem(
      "composed.profile",
      JSON.stringify({ targetBand: 7.5, testDate: "2026-09-01" })
    );
    render(<AccountClient userId={null} />);

    expect(await screen.findByLabelText(/target band/i)).toHaveValue("7.5");
    expect(screen.getByLabelText(/test date/i)).toHaveValue("2026-09-01");
  });

  it("saves edits to localStorage and confirms", async () => {
    const user = userEvent.setup();
    render(<AccountClient userId={null} />);

    await screen.findByLabelText(/target band/i);
    await user.selectOptions(screen.getByLabelText(/target band/i), "8");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    expect(await screen.findByRole("status")).toHaveTextContent(/saved/i);
    expect(JSON.parse(localStorage.getItem("composed.profile")!)).toEqual({
      targetBand: 8,
    });
    expect(pushProfile).not.toHaveBeenCalled();
  });
});

describe("AccountClient (signed-in)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("saves through the server action, not localStorage", async () => {
    const user = userEvent.setup();
    const { pullProfile } = await import("@/lib/actions/db-actions");
    vi.mocked(pullProfile).mockResolvedValue(null);
    vi.mocked(pushProfile).mockResolvedValue(true);

    render(<AccountClient userId="user_1" />);
    await screen.findByLabelText(/target band/i);
    await user.selectOptions(screen.getByLabelText(/target band/i), "6.5");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() =>
      expect(pushProfile).toHaveBeenCalledWith({ targetBand: 6.5 })
    );
    expect(localStorage.getItem("composed.profile")).toBeNull();
  });
});
