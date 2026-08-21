import { describe, expect, it } from "vitest";
import { parseExamMarkdown } from "./parse-exam-md";

// Fixture is ORIGINAL text in the shape a transcribed reading paper takes.
// Deliberately not a real published paper: the parser must be tested without
// committing anyone's copyrighted prose.
const PAPER = `# Composed Practice — Reading Test 9

**Source:** [example](https://example.com/paper)

---

### **READING PASSAGE 1**

You should spend about 20 minutes on **Questions 1-8**.

## **The return of the urban river**

**A**

Rivers running through industrial cities were treated as drains for most of the
twentieth century.

**B**

Tighter regulations forced factories to treat waste, and volunteers cleared the
channels.

**C**

Recovery remains fragile, and a single pollution incident undoes years of work.

#### **Questions 1-2**

Reading Passage 1 has three paragraphs, **A-C**.

Which paragraph contains the following information?

**1**   a description of how the decline began

**2**   a warning about how easily progress is lost

#### **Questions 3-4**

Look at the following statements and the list of people below.
Match each statement with the correct person, **A-B**.

**NB**  *You may use any letter more than once.*

**3**   Regulation drove the recovery.

**4**   Volunteers did the visible work.

**List of People**

**A**     Rivers Trust
**B**     City Council

#### **Questions 5-6**

Choose **TWO** letters, **A-D**.

Which **TWO** measures are mentioned?

**A**     waste treatment

**B**     road building

**C**     channel clearing

**D**     fish farming

#### **Questions 7-8**

Do the following statements agree with the information given in Reading Passage 1?

**TRUE**               if the statement agrees

**FALSE**              if the statement contradicts

**NOT** **GIVEN** if there is no information

**7**   Factories once discharged waste into rivers.

**8**   Otters have returned to every city river

in the country.

#### **Questions 9-11**

Complete the table below.

Choose **NO MORE THAN TWO WORDS** from the passage for each answer.

Advertisements

|  |  |
| --- | --- |
| **Stage** | **Result** |
| Regulation of **9**……………… discharge | Water quality improved |
| Clearing of the **10**……………… by volunteers | Shelter returned, and **11**……………… came back |

###

#### **Questions 12-13**

Complete the sentences below.

Choose **ONE WORD ONLY** from the passage for each answer.

**12** The channels were cleared by …………………………….

**13** Recovery is undone by a single ……………………………. incident.

## **Answer Composed Practice Reading Test 9**

##### Passage 1

1. A

2. C

3. B

4. A

5. A

6. C

7. TRUE

8. NOT GIVEN

9. waste

10. channels

11. wildlife

12. volunteers

13. pollution
`;

const errorsOf = (ds: { severity: string; message: string }[]) =>
  ds.filter((d) => d.severity === "error").map((d) => d.message);

describe("parseExamMarkdown", () => {
  const { test, diagnostics } = parseExamMarkdown(PAPER);

  it("parses without errors", () => {
    expect(errorsOf(diagnostics)).toEqual([]);
    expect(test).not.toBeNull();
  });

  it("builds a single timed reading section", () => {
    const s = test!.sections[0];
    expect(s.skill).toBe("reading");
    expect(s.durationSeconds).toBe(3600);
    expect(s.rules).toEqual({ singleTimer: true, autoAdvanceOnExpiry: true });
  });

  it("marks the test as imported", () => {
    expect(test!.source).toBe("Imported");
  });

  it("takes the passage title from its heading and keeps the prose", () => {
    const p = test!.sections[0].passages![0];
    expect(p.title).toBe("The return of the urban river");
    expect(p.body).toContain("treated as drains");
    // Paragraph labels stay: "which paragraph contains…" points at them.
    expect(p.body).toMatch(/^A$/m);
    expect(p.body).toMatch(/^C$/m);
  });

  it("infers every question type from the instruction wording", () => {
    const types = test!.sections[0].passages![0].questionGroups.map((g) => g.type);
    expect(types).toEqual([
      "matching_information",
      "matching_features",
      "multiple_choice_multi",
      "true_false_not_given",
      "summary_completion",
      "sentence_completion",
    ]);
  });

  it("expands a paragraph span stated in prose into options", () => {
    const g = test!.sections[0].passages![0].questionGroups[0];
    expect(g.sharedOptions).toEqual([
      { label: "A" },
      { label: "B" },
      { label: "C" },
    ]);
  });

  it("reads an explicit option list and its reusable flag", () => {
    const g = test!.sections[0].passages![0].questionGroups[1];
    expect(g.sharedOptions).toEqual([
      { label: "A", text: "Rivers Trust" },
      { label: "B", text: "City Council" },
    ]);
    expect(g.optionsReusable).toBe(true);
  });

  it("turns 'Choose TWO letters' into a letter-set group", () => {
    const g = test!.sections[0].passages![0].questionGroups[2];
    expect(g.answerMatch).toEqual({ kind: "letter-set", anyOrder: true });
    expect(g.selectCount).toBe(2);
    expect(g.acceptSet).toEqual(["A", "C"]);
    expect(g.questions).toEqual([
      { number: 5, acceptSetMember: true },
      { number: 6, acceptSetMember: true },
    ]);
  });

  it("applies the answer key to every question", () => {
    const qs = test!.sections[0]
      .passages!.flatMap((p) => p.questionGroups)
      .flatMap((g) => g.questions);
    expect(qs).toHaveLength(13);
    expect(qs.filter((q) => q.accept || q.acceptSetMember)).toHaveLength(13);
    expect(qs.find((q) => q.number === 7)?.accept).toEqual(["TRUE"]);
    expect(qs.find((q) => q.number === 8)?.accept).toEqual(["NOT GIVEN"]);
  });

  it("keeps question stems", () => {
    const q = test!.sections[0].passages![0].questionGroups[0].questions[0];
    expect(q.content).toBe("a description of how the decline began");
  });

  it("keeps the option text of a letter-set group", () => {
    const g = test!.sections[0].passages![0].questionGroups[2];
    expect(g.sharedOptions).toEqual([
      { label: "A", text: "waste treatment" },
      { label: "B", text: "road building" },
      { label: "C", text: "channel clearing" },
      { label: "D", text: "fish farming" },
    ]);
  });

  it("continues a stem that wrapped onto the next line", () => {
    const g = test!.sections[0].passages![0].questionGroups[3];
    expect(g.questions[1].content).toBe(
      "Otters have returned to every city river in the country."
    );
  });

  it("turns printed leaders into blanks", () => {
    const g = test!.sections[0].passages![0].questionGroups[5];
    expect(g.questions.map((q) => q.content)).toEqual([
      "The channels were cleared by ___",
      "Recovery is undone by a single ___ incident.",
    ]);
  });

  it("keeps a completion table as a table, with the blanks marked", () => {
    const g = test!.sections[0].passages![0].questionGroups[4];
    expect(g.table).toEqual([
      ["Stage", "Result"],
      ["Regulation of [[9]] discharge", "Water quality improved"],
      ["Clearing of the [[10]] by volunteers", "Shelter returned, and [[11]] came back"],
    ]);
    // …and each blank's cell becomes that question's stem.
    expect(g.questions[0].content).toBe("Regulation of ___ discharge");
    expect(g.questions[2].content).toBe("Shelter returned, and ___ came back");
  });

  it("keeps page furniture out of the instructions", () => {
    const instructions = test!
      .sections[0].passages![0].questionGroups.map((g) => g.instruction)
      .join(" ");
    expect(instructions).not.toMatch(/advertisement/i);
    expect(instructions).not.toContain("#");
    expect(instructions).not.toContain("|");
  });

  it("derives a slug id from the title", () => {
    expect(test!.id).toBe("composed-practice-reading-test-9");
  });
});

describe("parseExamMarkdown — answerability warnings", () => {
  const warningsOf = (ds: { severity: string; message: string }[]) =>
    ds.filter((d) => d.severity === "warning").map((d) => d.message);

  it("stays quiet on a paper a candidate can actually sit", () => {
    expect(warningsOf(parseExamMarkdown(PAPER).diagnostics)).toEqual([]);
  });

  it("warns when the printed list of options is missing", () => {
    const noList = PAPER.replace(
      "**List of People**\n\n**A**     Rivers Trust\n**B**     City Council\n",
      ""
    );
    expect(warningsOf(parseExamMarkdown(noList).diagnostics)).toContainEqual(
      expect.stringMatching(/questions 3-4 offer letters with nothing beside them/)
    );
  });

  it("warns when paragraph-matching questions have no labelled paragraphs", () => {
    const noLabels = PAPER.replace(/^\*\*[ABC]\*\*$/gm, "");
    expect(warningsOf(parseExamMarkdown(noLabels).diagnostics)).toContainEqual(
      expect.stringMatching(/questions 1-2 ask about lettered paragraphs/)
    );
  });

  it("warns when a question has no text of its own", () => {
    const noStem = PAPER.replace("**2**   a warning about how easily progress is lost\n", "");
    expect(warningsOf(parseExamMarkdown(noStem).diagnostics)).toContainEqual(
      expect.stringMatching(/question 2 has no text/)
    );
  });
});

describe("parseExamMarkdown — failure modes", () => {
  it("rejects a document with no reading passages", () => {
    const { test, diagnostics } = parseExamMarkdown("# Just a title\n\nSome prose.\n");
    expect(test).toBeNull();
    expect(errorsOf(diagnostics)[0]).toMatch(/no 'READING PASSAGE n' headings/);
  });

  it("rejects a paper with no answer key", () => {
    const noKey = PAPER.slice(0, PAPER.indexOf("## **Answer"));
    const { test, diagnostics } = parseExamMarkdown(noKey);
    expect(test).toBeNull();
    expect(errorsOf(diagnostics)[0]).toMatch(/no answer key found/);
  });

  it("reports a question the key does not cover", () => {
    const missing = PAPER.replace("7. TRUE\n\n", "");
    const { test, diagnostics } = parseExamMarkdown(missing);
    expect(test).toBeNull();
    expect(errorsOf(diagnostics)).toContain("question 7 has no answer in the key");
  });
});
