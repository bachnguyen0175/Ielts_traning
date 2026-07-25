import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { SAMPLE_MOCK } from "@/lib/content/sample-mock";
import { Player } from "./player";

function baseProps(overrides: Record<string, unknown> = {}) {
  return {
    test: SAMPLE_MOCK,
    sectionIndex: 0,
    sectionStartedAt: 0,
    responses: {},
    flagged: [],
    submissions: {},
    onAnswer: vi.fn(),
    onToggleFlag: vi.fn(),
    onSubmission: vi.fn(),
    onAdvance: vi.fn(),
    onFinish: vi.fn(),
    now: () => 0,
    ...overrides,
  } as const;
}

describe("Player", () => {
  it("shows section progress and the remaining time", () => {
    render(<Player {...baseProps()} />);
    expect(screen.getByText(/section 1 of 4/i)).toBeInTheDocument();
    // listening section is 360s → 06:00 at t=0
    expect(screen.getByText("06:00")).toBeInTheDocument();
  });

  it("advances when not on the last section", async () => {
    const props = baseProps();
    render(<Player {...props} />);
    await userEvent.click(
      screen.getByRole("button", { name: /next section/i })
    );
    expect(props.onAdvance).toHaveBeenCalledOnce();
    expect(props.onFinish).not.toHaveBeenCalled();
  });

  it("finishes on the last section", async () => {
    const props = baseProps({ sectionIndex: 3 });
    render(<Player {...props} />);
    await userEvent.click(screen.getByRole("button", { name: /finish mock/i }));
    expect(props.onFinish).toHaveBeenCalledOnce();
  });

  it("toggles a flag from the question nav", async () => {
    const props = baseProps();
    render(<Player {...props} />);
    await userEvent.click(screen.getByRole("button", { name: /^question 1$/i }));
    expect(props.onToggleFlag).toHaveBeenCalledWith(1);
  });

  it("does not reveal correctness while sitting", () => {
    render(<Player {...baseProps()} />);
    expect(screen.getByText(/no feedback until you finish/i)).toBeInTheDocument();
  });
});
