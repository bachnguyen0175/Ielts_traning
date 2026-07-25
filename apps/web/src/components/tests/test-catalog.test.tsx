import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import type { TestSummary } from "@/lib/data/repositories";
import { TestCatalog } from "./test-catalog";

const tests: TestSummary[] = [
  {
    id: "sample-academic-1",
    title: "Composed Sample — Academic Mock 1",
    type: "academic",
    skills: ["listening", "reading", "writing", "speaking"],
    totalQuestions: 12,
    durationMinutes: 40,
    source: "Composed original",
    access: "public",
  },
  {
    id: "cam15-reading",
    title: "Cambridge 15 — Reading Test 1",
    type: "academic",
    skills: ["reading"],
    totalQuestions: 40,
    durationMinutes: 60,
    source: "Cambridge IELTS 15",
    access: "private",
  },
];

describe("TestCatalog", () => {
  it("renders each test with a start link to the pre-test", () => {
    render(<TestCatalog tests={tests} />);
    const start = screen.getByRole("link", {
      name: /start cambridge 15 — reading test 1/i,
    });
    expect(start).toHaveAttribute("href", "/mock?test=cam15-reading");
  });

  it("flags private (Cambridge-derived) tests", () => {
    render(<TestCatalog tests={tests} />);
    expect(screen.getByText(/^private$/i)).toBeInTheDocument();
    expect(screen.getByText(/cambridge ielts 15/i)).toBeInTheDocument();
  });

  it("shows an empty state when there are no tests", () => {
    render(<TestCatalog tests={[]} />);
    expect(screen.getByText(/no tests available/i)).toBeInTheDocument();
  });
});
