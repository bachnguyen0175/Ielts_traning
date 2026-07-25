import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import type { SectionScore } from "@composed/domain";
import { ResultsView } from "./results-view";

const results: SectionScore[] = [
  { sectionId: "s-listening", skill: "listening", raw: 5, max: 6, band: 8, marks: [] },
  { sectionId: "s-reading", skill: "reading", raw: 6, max: 6, band: 9, marks: [] },
];

describe("ResultsView", () => {
  it("shows the overall indicative band", () => {
    render(<ResultsView overall={8.5} results={results} attemptId="a1" />);
    expect(screen.getByText("8.5")).toBeInTheDocument();
  });

  it("shows a band and score for each objective skill", () => {
    render(<ResultsView overall={8.5} results={results} attemptId="a1" />);
    expect(screen.getByText("Listening")).toBeInTheDocument();
    expect(screen.getByText("8.0")).toBeInTheDocument();
    expect(screen.getByText("5 / 6 correct")).toBeInTheDocument();
    expect(screen.getByText("9.0")).toBeInTheDocument();
  });

  it("marks Writing and Speaking as pending review", () => {
    render(<ResultsView overall={8.5} results={results} attemptId="a1" />);
    const pending = screen.getAllByText(/pending review/i);
    expect(pending).toHaveLength(2);
    expect(screen.getByText("Writing")).toBeInTheDocument();
    expect(screen.getByText("Speaking")).toBeInTheDocument();
  });

  it("links to review for the attempt", () => {
    render(<ResultsView overall={8.5} results={results} attemptId="a1" />);
    const link = screen.getByRole("link", { name: /review answers/i });
    expect(link).toHaveAttribute("href", "/mock/review?a=a1");
  });
});
