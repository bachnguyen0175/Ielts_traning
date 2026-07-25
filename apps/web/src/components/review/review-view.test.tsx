import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SAMPLE_MOCK } from "@/lib/content/sample-mock";
import { ReviewView } from "./review-view";

function renderReview(responses = {}) {
  render(
    <ReviewView
      test={SAMPLE_MOCK}
      responses={responses}
      submissions={{ "w-t1": "My essay draft." }}
      audioUrls={{}}
    />
  );
}

describe("ReviewView", () => {
  it("marks answers correct/incorrect", () => {
    renderReview({ 7: "TRUE", 8: "nope" });
    expect(screen.getAllByLabelText("correct").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByLabelText("incorrect").length).toBeGreaterThanOrEqual(1);
  });

  it("reveals the correct answer for wrong responses", () => {
    renderReview({ 8: "nope" });
    // q8 correct answer is FALSE
    expect(screen.getAllByText(/FALSE/).length).toBeGreaterThanOrEqual(1);
  });

  it("shows the user's essay and the writing criteria", () => {
    renderReview();
    expect(screen.getByText("My essay draft.")).toBeInTheDocument();
    // criteria repeat per prompt (2 writing tasks)
    expect(
      screen.getAllByText(/coherence & cohesion/i).length
    ).toBeGreaterThanOrEqual(1);
  });

  it("shows the speaking criteria", () => {
    renderReview();
    expect(
      screen.getAllByText(/pronunciation/i).length
    ).toBeGreaterThanOrEqual(1);
  });
});
