import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { TestSummary } from "@/lib/data/repositories";
import { TestCatalog } from "./test-catalog";

// The catalog fetches the shared library through a server action, which cannot
// be imported for real under vitest (it pulls `server-only` and the Neon
// client). The store it hydrates is pure and is exercised on its own.
vi.mock("@/lib/data/published-tests-loader", () => ({
  loadPublishedTests: () => Promise.resolve(),
}));
import { importedTests } from "@/lib/data/imported-tests";

const tests: TestSummary[] = [
  {
    id: "sample-academic-1",
    title: "Composed Sample — Academic Mock 1",
    type: "academic",
    skills: ["listening", "reading", "writing", "speaking"],
    totalQuestions: 12,
    durationMinutes: 40,
    source: "Composed original",
  },
  {
    id: "cam15-reading",
    title: "Cambridge 15 — Reading Test 1",
    type: "academic",
    skills: ["reading"],
    totalQuestions: 40,
    durationMinutes: 60,
    source: "Cambridge IELTS 15",
  },
];

describe("TestCatalog", () => {
  it("renders each test with a start link to the pre-test", () => {
    importedTests.reset(); // storage was written directly, not via save()

    render(<TestCatalog tests={tests} />);
    const start = screen.getByRole("link", {
      name: /start cambridge 15 — reading test 1/i,
    });
    expect(start).toHaveAttribute("href", "/mock?test=cam15-reading");
  });

  it("shows where each test came from", () => {
    importedTests.reset(); // storage was written directly, not via save()

    render(<TestCatalog tests={tests} />);
    expect(screen.getByText(/cambridge ielts 15/i)).toBeInTheDocument();
  });

  it("shows an empty state when there are no tests", () => {
    render(<TestCatalog tests={[]} />);
    expect(screen.getByText(/no tests available/i)).toBeInTheDocument();
  });
});

describe("TestCatalog — imported tests", () => {
  it("appends tests imported in this browser to the server-rendered list", () => {
    window.localStorage.setItem(
      "composed:imported-tests",
      JSON.stringify([
        {
          id: "imported-paper-1",
          title: "Imported Reading Paper",
          type: "academic",
          source: "Imported",
          sections: [
            {
              id: "s-reading",
              skill: "reading",
              order: 1,
              durationSeconds: 3600,
              passages: [
                {
                  id: "r-p1",
                  order: 1,
                  title: "P1",
                  questionGroups: [
                    {
                      id: "g1",
                      range: [1, 1],
                      type: "short_answer",
                      instruction: "Answer.",
                      answerMatch: { kind: "text" },
                      questions: [{ number: 1, accept: ["a"] }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ])
    );

    importedTests.reset(); // storage was written directly, not via save()

    render(<TestCatalog tests={tests} />);

    // Built-ins still render, and the imported one joins them.
    expect(screen.getByText("Composed Sample — Academic Mock 1")).toBeTruthy();
    expect(screen.getByText("Imported Reading Paper")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: /start imported reading paper/i })
    ).toHaveAttribute("href", "/mock?test=imported-paper-1");
  });
});
