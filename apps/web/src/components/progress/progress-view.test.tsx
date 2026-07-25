import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import type { Attempt } from "@composed/domain";
import { ProgressView } from "./progress-view";

function attempt(overrides: Partial<Attempt>): Attempt {
  return {
    id: "a1",
    testId: "t",
    status: "submitted",
    startedAt: 1000,
    submittedAt: 2000,
    sectionStartedAt: {},
    currentSectionIndex: 0,
    responses: {},
    flagged: [],
    submissions: [],
    overall: 7,
    ...overrides,
  };
}

describe("ProgressView", () => {
  it("shows an empty state with a start CTA when there are no attempts", () => {
    render(<ProgressView attempts={[]} />);
    expect(screen.getByText(/no mocks yet/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /start your first mock/i })
    ).toHaveAttribute("href", "/mock");
  });

  it("shows target, latest band, and attempt history", () => {
    render(
      <ProgressView attempts={[attempt({ overall: 7 })]} targetBand={7.5} />
    );
    expect(screen.getByText("7.5")).toBeInTheDocument(); // target
    expect(screen.getByText(/band 7.0/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /start a new mock/i })
    ).toBeInTheDocument();
  });

  it("orders attempts most-recent first", () => {
    render(
      <ProgressView
        attempts={[
          attempt({ id: "old", startedAt: 1000, overall: 6 }),
          attempt({ id: "new", startedAt: 5000, overall: 8 }),
        ]}
      />
    );
    const rows = screen.getAllByRole("listitem");
    expect(rows[0]).toHaveTextContent(/band 8.0/i);
  });
});
