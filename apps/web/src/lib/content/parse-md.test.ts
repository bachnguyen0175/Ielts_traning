import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseMarkdown } from "./parse-md";
import { SAMPLE_MOCK } from "./sample-mock";

const FIXTURE = join(__dirname, "fixtures/sample-mock.test.md");

const errorsOf = (ds: { severity: string; message: string }[]) =>
  ds.filter((d) => d.severity === "error").map((d) => d.message);

/** A minimal valid test, used as the base for negative cases. */
function md(body: string): string {
  return `---
id: t1
title: T
---

## Reading
duration: 60m

### P1

Some prose.

${body}
`;
}

describe("round-trip against the hand-written sample mock", () => {
  const source = readFileSync(FIXTURE, "utf8");
  const result = parseMarkdown(source, { audioExists: () => true });

  it("compiles with no errors", () => {
    expect(errorsOf(result.diagnostics)).toEqual([]);
  });

  it("deep-equals SAMPLE_MOCK", () => {
    // The strongest guarantee the parser has: a real four-section test,
    // every emitted field, compared against content written by hand.
    expect(result.test).toEqual(SAMPLE_MOCK);
  });

  it("warns about the deliberately shortened durations", () => {
    const warnings = result.diagnostics.filter((d) => d.severity === "warning");
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings.every((w) => w.message.includes("differs from the authentic"))).toBe(true);
  });
});

describe("front matter", () => {
  it("requires id and title", () => {
    const { test, diagnostics } = parseMarkdown("## Reading\nduration: 60m\n");
    expect(test).toBeNull();
    expect(errorsOf(diagnostics)).toEqual(
      expect.arrayContaining([
        "front matter is missing 'id'",
        "front matter is missing 'title'",
      ])
    );
  });

  it("rejects an id that collides with an existing test", () => {
    const { diagnostics } = parseMarkdown(md("[1-1] short_answer\nWrite one word.\n1. Q = a"), {
      existingIds: ["t1"],
    });
    expect(errorsOf(diagnostics)).toContain('test id "t1" already exists');
  });

  it("defaults type to academic and carries source", () => {
    const { test } = parseMarkdown(`---
id: t1
title: T
source: Composed original
---

## Reading
duration: 60m

### P1

Prose.

[1-1] short_answer
Write one word.
1. Q = a
`);
    expect(test?.type).toBe("academic");
    expect(test?.source).toBe("Composed original");
  });
});

describe("durations and rules", () => {
  it("reads m, s and h", () => {
    const parse = (d: string) =>
      parseMarkdown(`---
id: t1
title: T
---

## Reading
duration: ${d}

### P1

Prose.

[1-1] short_answer
Write one word.
1. Q = a
`).test?.sections[0].durationSeconds;
    expect(parse("60m")).toBe(3600);
    expect(parse("1800s")).toBe(1800);
    expect(parse("1h")).toBe(3600);
  });

  it("rejects an unreadable duration", () => {
    const { diagnostics } = parseMarkdown(md("[1-1] short_answer\nQ.\n1. Q = a").replace("duration: 60m", "duration: half an hour"));
    expect(errorsOf(diagnostics)[0]).toMatch(/cannot read duration/);
  });

  it("omits rules entirely when none are declared", () => {
    const { test } = parseMarkdown(md("[1-1] short_answer\nWrite one word.\n1. Q = a"));
    expect(test?.sections[0].rules).toBeUndefined();
  });

  it("rejects an unknown rule word", () => {
    const source = md("[1-1] short_answer\nWrite one word.\n1. Q = a").replace(
      "duration: 60m",
      "duration: 60m\nrules: single-timer, rewind-allowed"
    );
    expect(errorsOf(parseMarkdown(source).diagnostics)).toContain('unknown rule "rewind-allowed"');
  });
});

describe("listening fidelity", () => {
  const listening = (extra: string) => `---
id: t1
title: T
---

## Listening
duration: 30m
${extra}

### P1

Prose.

[1-1] short_answer
Write one word.
1. Q = a
`;

  it("requires an audio file that exists", () => {
    const { diagnostics } = parseMarkdown(listening("audio: /audio/missing.wav"), {
      audioExists: () => false,
    });
    expect(errorsOf(diagnostics)).toContain('audio file "/audio/missing.wav" not found under public/');
  });

  it("errors when listening declares no audio at all", () => {
    expect(errorsOf(parseMarkdown(listening("")).diagnostics)).toContain(
      "listening section is missing 'audio:'"
    );
  });

  it("warns when play-once is not declared", () => {
    const { diagnostics } = parseMarkdown(listening("audio: /a.wav"), {
      audioExists: () => true,
    });
    expect(diagnostics.some((d) => d.severity === "warning" && d.message.includes("audio-play-once"))).toBe(true);
  });
});

describe("question numbering", () => {
  it("rejects a duplicate number", () => {
    const { diagnostics } = parseMarkdown(
      md("[1-2] short_answer\nWrite one word.\n1. A = a\n1. B = b")
    );
    expect(errorsOf(diagnostics).some((m) => m.includes("already used"))).toBe(true);
  });

  it("rejects a number outside the group range", () => {
    const { diagnostics } = parseMarkdown(
      md("[1-2] short_answer\nWrite one word.\n1. A = a\n5. B = b")
    );
    expect(errorsOf(diagnostics)).toContain("question 5 is outside the group range [1-2]");
  });

  it("rejects a range that disagrees with the question count", () => {
    const { diagnostics } = parseMarkdown(
      md("[1-3] short_answer\nWrite one word.\n1. A = a\n2. B = b")
    );
    expect(errorsOf(diagnostics)).toContain("group [1-3] declares 3 question(s) but has 2");
  });

  it("rejects a gap in a section's numbering", () => {
    const { diagnostics } = parseMarkdown(
      md("[1-1] short_answer\nWrite one word.\n1. A = a\n\n[5-5] short_answer\nWrite one word.\n5. B = b")
    );
    expect(errorsOf(diagnostics).some((m) => m.includes("jump from 1 to 5"))).toBe(true);
  });
});

describe("answers", () => {
  it("rejects a question with no answer", () => {
    const { diagnostics } = parseMarkdown(md("[1-1] short_answer\nWrite one word.\n1. A stem with no answer"));
    expect(errorsOf(diagnostics)).toContain('question 1 has no answer (expected "... = answer")');
  });

  it("splits alternates on ' / '", () => {
    const { test } = parseMarkdown(md("[1-1] short_answer\nWrite one word.\n1. Q = gravel beds / gravel"));
    expect(test?.sections[0].passages?.[0].questionGroups[0].questions[0].accept).toEqual([
      "gravel beds",
      "gravel",
    ]);
  });

  it("splits on the LAST ' = ' so stems may contain one", () => {
    const { test } = parseMarkdown(md("[1-1] short_answer\nWrite one word.\n1. Given a = b, solve for b = 4"));
    const q = test?.sections[0].passages?.[0].questionGroups[0].questions[0];
    expect(q?.content).toBe("Given a = b, solve for b");
    expect(q?.accept).toEqual(["4"]);
  });

  it("rejects a letter answer that is not among the options", () => {
    const { diagnostics } = parseMarkdown(
      md("[1-1] multiple_choice_single\nChoose one.\noptions: A | B | C\n1. Q = F")
    );
    expect(errorsOf(diagnostics)).toContain('answer "F" is not in options A | B | C');
  });

  it("rejects a misspelled enum answer", () => {
    const { diagnostics } = parseMarkdown(
      md("[1-1] true_false_not_given\nAgree?\n1. Q = Not Given")
    );
    expect(errorsOf(diagnostics)).toContain('answer "Not Given" must be exactly one of TRUE, FALSE, NOT GIVEN');
  });
});

describe("inferred answerMatch", () => {
  const matchFor = (type: string, extra = "") => {
    const answer = type.includes("not_given") ? "TRUE" : type.includes("matching") || type.includes("choice_single") ? "A" : "a";
    const { test } = parseMarkdown(
      md(`[1-1] ${type}\nInstruction.\n${extra}1. Q = ${answer}`)
    );
    return test?.sections[0].passages?.[0].questionGroups[0].answerMatch;
  };

  it("text types normalize but do not set caseSensitive", () => {
    expect(matchFor("sentence_completion")).toEqual({
      kind: "text",
      normalize: ["trim", "collapse-ws", "lowercase"],
    });
  });

  it("true_false_not_given becomes an enum", () => {
    expect(matchFor("true_false_not_given")).toEqual({
      kind: "enum",
      options: ["TRUE", "FALSE", "NOT GIVEN"],
    });
  });

  it("matching types become letter", () => {
    expect(matchFor("matching_headings", "options: A | B\n")).toEqual({ kind: "letter" });
  });

  it("honours a case-sensitive override", () => {
    const { test } = parseMarkdown(
      md("[1-1] short_answer\nWrite one word.\nmatch: text case-sensitive\n1. Q = Sarah")
    );
    expect(test?.sections[0].passages?.[0].questionGroups[0].answerMatch).toEqual({
      kind: "text",
      caseSensitive: true,
      normalize: ["trim", "collapse-ws", "lowercase"],
    });
  });

  it("rejects an unsupported override", () => {
    const { diagnostics } = parseMarkdown(
      md("[1-1] short_answer\nWrite one word.\nmatch: fuzzy\n1. Q = a")
    );
    expect(errorsOf(diagnostics).some((m) => m.includes("unsupported match override"))).toBe(true);
  });
});

describe("letter-set groups", () => {
  const group = (body: string) => parseMarkdown(md(body));

  it("generates acceptSetMember slots and takes no question lines", () => {
    const { test, diagnostics } = group(
      "[1-2] multiple_choice_multi\nChoose TWO letters A-E.\noptions: A | B | C | D | E\nselect: 2\nanswers: C, D"
    );
    expect(errorsOf(diagnostics)).toEqual([]);
    const g = test?.sections[0].passages?.[0].questionGroups[0];
    expect(g?.answerMatch).toEqual({ kind: "letter-set", anyOrder: true });
    expect(g?.selectCount).toBe(2);
    expect(g?.acceptSet).toEqual(["C", "D"]);
    expect(g?.questions).toEqual([
      { number: 1, acceptSetMember: true },
      { number: 2, acceptSetMember: true },
    ]);
  });

  it("rejects select that disagrees with the range or the answers", () => {
    const { diagnostics } = group(
      "[1-2] multiple_choice_multi\nChoose.\noptions: A | B | C\nselect: 3\nanswers: A, B"
    );
    expect(errorsOf(diagnostics).some((m) => m.includes("must equal the range width"))).toBe(true);
  });

  it("rejects an answer letter outside the options", () => {
    const { diagnostics } = group(
      "[1-2] multiple_choice_multi\nChoose.\noptions: A | B\nselect: 2\nanswers: A, Z"
    );
    expect(errorsOf(diagnostics)).toContain('answer "Z" is not in options A | B');
  });
});

describe("structure", () => {
  it("requires letter types to declare options", () => {
    const { diagnostics } = parseMarkdown(md("[1-1] multiple_choice_single\nChoose one.\n1. Q = A"));
    expect(errorsOf(diagnostics)).toContain("multiple_choice_single needs an 'options:' line");
  });

  it("keeps a colon-bearing instruction as prose, not an attribute", () => {
    const { test } = parseMarkdown(
      md("[1-1] short_answer\nAnswer this: one word only.\n1. Q = a")
    );
    expect(test?.sections[0].passages?.[0].questionGroups[0].instruction).toBe(
      "Answer this: one word only."
    );
  });

  it("rejects an unknown skill heading", () => {
    const { diagnostics } = parseMarkdown(`---
id: t1
title: T
---

## Grammar
duration: 10m
`);
    expect(errorsOf(diagnostics).some((m) => m.includes('unknown section "grammar"'))).toBe(true);
  });

  it("warns on an empty reading passage body", () => {
    const { diagnostics } = parseMarkdown(`---
id: t1
title: T
---

## Reading
duration: 60m

### P1
[1-1] short_answer
Write one word.
1. Q = a
`);
    expect(diagnostics.some((d) => d.severity === "warning" && d.message.includes("no body text"))).toBe(true);
  });

  it("requires a prompt to declare its task type", () => {
    const { diagnostics } = parseMarkdown(`---
id: t1
title: T
---

## Writing
duration: 60m

### Task 1

Write something.
`);
    expect(errorsOf(diagnostics).some((m) => m.includes("missing its task type"))).toBe(true);
  });

  it("derives ids when none are given", () => {
    const { test } = parseMarkdown(md("[1-1] short_answer\nWrite one word.\n1. Q = a"));
    const section = test?.sections[0];
    expect(section?.id).toBe("s-reading");
    expect(section?.passages?.[0].id).toBe("r-p1");
    expect(section?.passages?.[0].questionGroups[0].id).toBe("r-p1-g1");
  });
});
