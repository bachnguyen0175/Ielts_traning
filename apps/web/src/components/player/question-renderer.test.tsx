import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import type { QuestionGroup } from "@composed/domain";
import { QuestionRenderer } from "./question-renderer";

const mcq: QuestionGroup = {
  id: "g",
  range: [1, 1],
  type: "multiple_choice_single",
  instruction: "Choose A, B or C.",
  sharedOptions: ["A", "B", "C"],
  answerMatch: { kind: "letter" },
  questions: [{ number: 1, content: "The class runs on" }],
};

const text: QuestionGroup = {
  id: "g",
  range: [4, 4],
  type: "sentence_completion",
  instruction: "ONE WORD ONLY",
  answerMatch: { kind: "text" },
  questions: [{ number: 4, content: "Meet by the ___." }],
};

const tfng: QuestionGroup = {
  id: "g",
  range: [7, 7],
  type: "true_false_not_given",
  instruction: "TRUE/FALSE/NOT GIVEN",
  answerMatch: { kind: "enum", options: ["TRUE", "FALSE", "NOT GIVEN"] },
  questions: [{ number: 7, content: "Some rivers could not support fish." }],
};

describe("QuestionRenderer", () => {
  it("MCQ: selecting an option answers with the letter", async () => {
    const onAnswer = vi.fn();
    render(<QuestionRenderer group={mcq} responses={{}} onAnswer={onAnswer} />);
    await userEvent.click(screen.getByRole("radio", { name: "B" }));
    expect(onAnswer).toHaveBeenCalledWith(1, "B");
  });

  it("text: typing answers with the value", () => {
    const onAnswer = vi.fn();
    render(<QuestionRenderer group={text} responses={{}} onAnswer={onAnswer} />);
    fireEvent.change(screen.getByLabelText(/question 4/i), {
      target: { value: "entrance" },
    });
    expect(onAnswer).toHaveBeenCalledWith(4, "entrance");
  });

  it("TFNG: selecting FALSE answers with the option", async () => {
    const onAnswer = vi.fn();
    render(<QuestionRenderer group={tfng} responses={{}} onAnswer={onAnswer} />);
    await userEvent.click(screen.getByRole("radio", { name: /^false$/i }));
    expect(onAnswer).toHaveBeenCalledWith(7, "FALSE");
  });

  it("reflects an existing response as selected/filled", () => {
    render(
      <QuestionRenderer group={mcq} responses={{ 1: "A" }} onAnswer={() => {}} />
    );
    expect(screen.getByRole("radio", { name: "A" })).toBeChecked();
  });
});
