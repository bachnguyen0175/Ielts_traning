import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

describe("test harness", () => {
  it("renders and matches jest-dom matchers", () => {
    render(<button type="button">Start mock</button>);
    expect(
      screen.getByRole("button", { name: /start mock/i })
    ).toBeInTheDocument();
  });
});
