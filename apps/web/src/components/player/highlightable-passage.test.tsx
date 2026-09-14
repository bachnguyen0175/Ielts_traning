import { fireEvent, render, screen } from "@testing-library/react";
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

  /** Selects `word` inside the rendered passage, as a candidate would. */
  function select(word: string) {
    const node = screen.getByText(/One para/).firstChild as Text;
    const start = node.data.indexOf(word);
    const range = document.createRange();
    range.setStart(node, start);
    range.setEnd(node, start + word.length);
    const sel = window.getSelection()!;
    sel.removeAllRanges();
    sel.addRange(range);
    fireEvent.mouseUp(node.parentElement!);
  }

  it("highlights a selection, and clicking the highlight takes it off again", () => {
    const { container } = render(
      <HighlightablePassage title="Untitled" body="One para." />
    );

    select("para");
    fireEvent.click(screen.getByRole("button", { name: /highlight/i }));
    const mark = container.querySelector("mark");
    expect(mark).not.toBeNull();
    expect(mark).toHaveTextContent("para");

    // A mark you cannot clear is worse than none.
    fireEvent.click(mark!);
    expect(container.querySelector("mark")).toBeNull();
    // The words come back intact, in one piece.
    expect(screen.getByText("One para.")).toBeInTheDocument();
  });

  it("lets a keyboard remove a highlight too", () => {
    const { container } = render(
      <HighlightablePassage title="Untitled" body="One para." />
    );
    select("para");
    fireEvent.click(screen.getByRole("button", { name: /highlight/i }));
    const mark = container.querySelector("mark")!;
    expect(mark).toHaveAttribute("tabindex", "0");

    fireEvent.keyDown(mark, { key: "Enter" });
    expect(container.querySelector("mark")).toBeNull();
  });
});
