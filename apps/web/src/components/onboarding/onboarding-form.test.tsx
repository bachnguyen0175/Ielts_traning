import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { OnboardingForm } from "./onboarding-form";

describe("OnboardingForm", () => {
  it("renders the optional goal fields and both actions", () => {
    render(<OnboardingForm onStart={() => {}} />);
    expect(screen.getByLabelText(/target band/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/test date/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /start a mock/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /skip/i })).toBeInTheDocument();
  });

  it("starts with the captured profile", async () => {
    const onStart = vi.fn();
    render(<OnboardingForm onStart={onStart} />);
    await userEvent.selectOptions(screen.getByLabelText(/target band/i), "7.5");
    fireEvent.change(screen.getByLabelText(/test date/i), {
      target: { value: "2026-09-01" },
    });
    await userEvent.click(screen.getByRole("button", { name: /start a mock/i }));
    expect(onStart).toHaveBeenCalledWith({
      targetBand: 7.5,
      testDate: "2026-09-01",
    });
  });

  it("skips without a profile", async () => {
    const onStart = vi.fn();
    render(<OnboardingForm onStart={onStart} />);
    await userEvent.click(screen.getByRole("button", { name: /skip/i }));
    expect(onStart).toHaveBeenCalledWith(null);
  });

  it("starts with an empty profile when nothing is filled", async () => {
    const onStart = vi.fn();
    render(<OnboardingForm onStart={onStart} />);
    await userEvent.click(screen.getByRole("button", { name: /start a mock/i }));
    expect(onStart).toHaveBeenCalledWith({});
  });
});
