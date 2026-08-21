import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HighlightablePassage } from "./highlightable-passage";

describe("HighlightablePassage", () => {
  it("shows the printed paragraph label beside the paragraph it introduces", () => {
    render(
      <HighlightablePassage
        title="The return of the urban river"
        body={"A\n\nRivers were treated as drains.\n\nB\n\nRegulations changed that."}
      />
    );
    // "Which paragraph contains…" questions are unanswerable without these.
    const first = screen.getByText(/Rivers were treated as drains/).closest("p");
    expect(first).toHaveTextContent("A Rivers were treated as drains.");
    const second = screen.getByText(/Regulations changed that/).closest("p");
    expect(second).toHaveTextContent("B Regulations changed that.");
  });

  it("renders an unlabelled passage as plain paragraphs", () => {
    render(
      <HighlightablePassage title="Untitled" body={"One para.\n\nTwo para."} />
    );
    expect(screen.getByText("One para.")).toBeInTheDocument();
    expect(screen.getByText("Two para.")).toBeInTheDocument();
  });
});
