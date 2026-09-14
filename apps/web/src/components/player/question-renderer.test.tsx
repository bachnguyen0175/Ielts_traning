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
  sharedOptions: [{ label: "A" }, { label: "B" }, { label: "C" }],
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

const matching: QuestionGroup = {
  id: "g",
  range: [1, 2],
  type: "matching_features",
  instruction: "Match each statement with the correct person.",
  sharedOptions: [
    { label: "A", text: "Rivers Trust" },
    { label: "B", text: "City Council" },
  ],
  answerMatch: { kind: "letter" },
  questions: [
    { number: 1, content: "Regulation drove the recovery." },
    { number: 2, content: "Volunteers did the work." },
  ],
};

const letterSet: QuestionGroup = {
  id: "g",
  range: [5, 6],
  type: "multiple_choice_multi",
  instruction: "Choose TWO letters, A-C.",
  sharedOptions: [
    { label: "A", text: "waste treatment" },
    { label: "B", text: "road building" },
    { label: "C", text: "channel clearing" },
  ],
  answerMatch: { kind: "letter-set", anyOrder: true },
  selectCount: 2,
  acceptSet: ["A", "C"],
  questions: [
    { number: 5, acceptSetMember: true },
    { number: 6, acceptSetMember: true },
  ],
};

const table: QuestionGroup = {
  id: "g",
  range: [9, 10],
  type: "summary_completion",
  instruction: "Complete the table below.",
  answerMatch: { kind: "text" },
  table: [
    ["Stage", "Result"],
    ["Regulation of [[9]] discharge", "Water quality improved"],
    ["Clearing of the channels", "Shelter returned, and [[10]] came back"],
  ],
  questions: [
    { number: 9, content: "Regulation of ___ discharge" },
    { number: 10, content: "Shelter returned, and ___ came back" },
  ],
};

const notes: QuestionGroup = {
  id: "g",
  range: [1, 3],
  type: "summary_completion",
  instruction: "Complete the notes below.",
  answerMatch: { kind: "text" },
  notes: [
    "● the plant grips the rock with a [[1]]",
    "● the [[2]] shelters young fish",
    "● the forest grows in cold water",
  ],
  questions: [
    { number: 1, content: "● the plant grips the rock with a ___" },
    { number: 2, content: "● the ___ shelters young fish" },
    { number: 3, content: "unmatched blank" },
  ],
};

const ownOptions: QuestionGroup = {
  id: "g",
  range: [1, 2],
  type: "multiple_choice_single",
  instruction: "Choose the correct letter, A, B, C or D.",
  answerMatch: { kind: "letter" },
  questions: [
    {
      number: 1,
      content: "The writer mentions the city to show that",
      options: [
        { label: "A", text: "the work is invisible to most people." },
        { label: "B", text: "bakers prefer to be left alone." },
      ],
    },
    {
      number: 2,
      content: "According to the passage, the shift begins",
      options: [
        { label: "A", text: "at midday." },
        { label: "B", text: "before dawn." },
      ],
    },
  ],
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

  it("prints the option list once, then takes a letter per question", async () => {
    const onAnswer = vi.fn();
    render(
      <QuestionRenderer group={matching} responses={{}} onAnswer={onAnswer} />
    );
    // The names appear once, not once under every statement.
    expect(screen.getAllByText("Rivers Trust")).toHaveLength(1);
    expect(screen.getAllByRole("radio", { name: "B" })).toHaveLength(2);
    await userEvent.click(screen.getAllByRole("radio", { name: "B" })[0]);
    expect(onAnswer).toHaveBeenCalledWith(1, "B");
  });

  it("marks a single-use letter as already used elsewhere in the group", () => {
    render(
      <QuestionRenderer group={matching} responses={{ 1: "A" }} onAnswer={() => {}} />
    );
    // Question 2 still offers A, but says it is spent.
    expect(screen.getByRole("radio", { name: /A \(already used\)/ })).toBeInTheDocument();
  });

  it("letter-set: one choice per group, filling the answer boxes in turn", async () => {
    const onAnswer = vi.fn();
    render(
      <QuestionRenderer group={letterSet} responses={{}} onAnswer={onAnswer} />
    );
    expect(screen.getAllByRole("checkbox")).toHaveLength(3);
    expect(screen.getByText("0 of 2 selected")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("checkbox", { name: "C" }));
    expect(onAnswer).toHaveBeenCalledWith(5, "C");
  });

  it("letter-set: stops at the limit and lets a choice be taken back", async () => {
    const onAnswer = vi.fn();
    render(
      <QuestionRenderer
        group={letterSet}
        responses={{ 5: "A", 6: "C" }}
        onAnswer={onAnswer}
      />
    );
    expect(screen.getByText("2 of 2 selected")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "B" })).toBeDisabled();
    await userEvent.click(screen.getByRole("checkbox", { name: "A" }));
    expect(onAnswer).toHaveBeenCalledWith(5, "");
  });

  it("table completion: renders the table with an input at each blank", () => {
    const onAnswer = vi.fn();
    render(<QuestionRenderer group={table} responses={{}} onAnswer={onAnswer} />);
    expect(screen.getByRole("columnheader", { name: "Stage" })).toBeInTheDocument();
    expect(screen.getByText(/Regulation of/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/question 10/i), {
      target: { value: "wildlife" },
    });
    expect(onAnswer).toHaveBeenCalledWith(10, "wildlife");
    // The raw markdown never reaches the screen.
    expect(screen.queryByText(/\[\[/)).toBeNull();
    expect(screen.queryByText(/\| ---/)).toBeNull();
  });

  it("notes completion: puts an input at each blank, in the printed line", () => {
    const onAnswer = vi.fn();
    render(<QuestionRenderer group={notes} responses={{}} onAnswer={onAnswer} />);
    // The sentence around the blank survives — that is what makes it answerable.
    expect(screen.getByText(/the plant grips the rock with a/)).toBeInTheDocument();
    // A printed note with no blank is still shown.
    expect(screen.getByText(/the forest grows in cold water/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/question 1/i), {
      target: { value: "holdfast" },
    });
    expect(onAnswer).toHaveBeenCalledWith(1, "holdfast");
    // The raw markers never reach the screen.
    expect(screen.queryByText(/\[\[/)).toBeNull();
  });

  it("notes completion: falls back to a listed box for a blank the parse missed", () => {
    render(<QuestionRenderer group={notes} responses={{}} onAnswer={() => {}} />);
    expect(screen.getByLabelText(/question 3/i)).toBeInTheDocument();
  });

  it("multiple choice: each question shows its own choices, with their text", () => {
    const onAnswer = vi.fn();
    render(
      <QuestionRenderer group={ownOptions} responses={{}} onAnswer={onAnswer} />,
    );
    // Pooled into one shared list, every question showed all four.
    expect(screen.getAllByRole("radio")).toHaveLength(4);
    // Without a key above, the choice has to carry its own words.
    expect(screen.getByText("at midday.")).toBeInTheDocument();
    expect(
      screen.getByText("the work is invisible to most people."),
    ).toBeInTheDocument();
  });

  it("multiple choice: a neighbour's answer does not use up a letter", () => {
    render(
      <QuestionRenderer
        group={ownOptions}
        responses={{ 1: "A" }}
        onAnswer={() => {}}
      />,
    );
    // Each question has its own A-D, so nothing here is "already used".
    expect(screen.queryByLabelText(/already used/i)).toBeNull();
  });

  it("shows nothing selected while a question is unanswered", () => {
    render(<QuestionRenderer group={mcq} responses={{}} onAnswer={() => {}} />);
    for (const label of ["A", "B", "C"]) {
      expect(screen.getByRole("radio", { name: label })).not.toBeChecked();
    }
  });

  it("reflects an existing response as selected/filled", () => {
    render(
      <QuestionRenderer group={mcq} responses={{ 1: "A" }} onAnswer={() => {}} />
    );
    expect(screen.getByRole("radio", { name: "A" })).toBeChecked();
  });
});
