import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Pretest } from "./pretest";

function setup(onStart = vi.fn()) {
  render(
    <Pretest
      testTitle="Composed Sample — Academic Mock 1"
      durationLabel="about 40 minutes"
      onStart={onStart}
    />
  );
  return { onStart };
}

describe("Pretest readiness gate", () => {
  it("shows the test and the authentic conditions", () => {
    setup();
    expect(screen.getByText(/academic mock 1/i)).toBeInTheDocument();
    expect(screen.getByText(/plays once/i)).toBeInTheDocument();
    expect(screen.getByText(/no feedback/i)).toBeInTheDocument();
  });

  it("keeps Start disabled until audio, mic, and readiness are confirmed", async () => {
    const { onStart } = setup();
    const start = screen.getByRole("button", { name: /start the mock/i });
    expect(start).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: /i can hear it/i }));
    expect(start).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: /microphone/i }));
    expect(start).toBeDisabled();

    await userEvent.click(screen.getByLabelText(/i understand.*one sitting/i));
    expect(start).toBeEnabled();

    await userEvent.click(start);
    expect(onStart).toHaveBeenCalledOnce();
  });
});
