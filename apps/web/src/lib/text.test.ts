import { describe, it, expect } from "vitest";
import { wordCount } from "./text";

describe("wordCount", () => {
  it("counts whitespace-separated words", () => {
    expect(wordCount("hello world")).toBe(2);
    expect(wordCount("  one   two\tthree\n four ")).toBe(4);
  });
  it("is zero for empty or whitespace-only text", () => {
    expect(wordCount("")).toBe(0);
    expect(wordCount("   \n  ")).toBe(0);
  });
});
