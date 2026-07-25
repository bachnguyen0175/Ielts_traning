import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { ListeningAudio } from "./listening-audio";

describe("ListeningAudio (play-once)", () => {
  it("plays once and cannot be replayed", async () => {
    render(<ListeningAudio src="/audio/x.wav" />);
    await userEvent.click(screen.getByRole("button", { name: /play audio/i }));

    const playing = screen.getByRole("button", { name: /playing/i });
    expect(playing).toBeDisabled();

    fireEvent.ended(screen.getByTestId("listening-audio"));
    expect(
      screen.getByRole("button", { name: /audio finished/i })
    ).toBeDisabled();
  });
});
