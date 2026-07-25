import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import type { VocabItem } from "@/lib/data/repositories";
import { FlashcardDeck } from "./flashcard-deck";

function item(over: Partial<VocabItem>): VocabItem {
  return {
    id: "1", term: "mitigate", definition: "make less severe",
    createdAt: 0, box: 0, dueAt: 0, ...over,
  };
}

const two = [
  item({ id: "1", term: "mitigate", definition: "make less severe" }),
  item({ id: "2", term: "husk", definition: "outer shell" }),
];

describe("FlashcardDeck", () => {
  it("shows the first term but hides its definition until revealed", async () => {
    render(<FlashcardDeck items={two} onGrade={() => {}} />);
    expect(screen.getByText("mitigate")).toBeInTheDocument();
    expect(screen.queryByText("make less severe")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /show|reveal/i }));
    expect(screen.getByText("make less severe")).toBeInTheDocument();
  });

  it("grades the card and advances to the next term", async () => {
    const onGrade = vi.fn();
    render(<FlashcardDeck items={two} onGrade={onGrade} />);
    await userEvent.click(screen.getByRole("button", { name: /show|reveal/i }));
    await userEvent.click(screen.getByRole("button", { name: /got it/i }));

    expect(onGrade).toHaveBeenCalledWith(two[0], true);
    expect(screen.getByText("husk")).toBeInTheDocument();
  });

  it("records 'review again' as not remembered", async () => {
    const onGrade = vi.fn();
    render(<FlashcardDeck items={two} onGrade={onGrade} />);
    await userEvent.click(screen.getByRole("button", { name: /show|reveal/i }));
    await userEvent.click(screen.getByRole("button", { name: /review again/i }));
    expect(onGrade).toHaveBeenCalledWith(two[0], false);
  });

  it("shows a completion summary after the last card", async () => {
    render(<FlashcardDeck items={[two[0]]} onGrade={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: /show|reveal/i }));
    await userEvent.click(screen.getByRole("button", { name: /got it/i }));
    expect(screen.getByText(/session complete/i)).toBeInTheDocument();
    expect(screen.getByText(/reviewed 1 card/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /study again/i })).toBeInTheDocument();
  });
});
