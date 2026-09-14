"use client";

import type { Option, QuestionGroup } from "@composed/domain";
import { cx } from "@/lib/cx";

function optionsFor(group: QuestionGroup): Option[] | null {
  const m = group.answerMatch;
  if (m.kind === "enum") return m.options.map((label) => ({ label }));
  if (m.kind === "letter" || m.kind === "letter-set") {
    return (
      group.sharedOptions ??
      ["A", "B", "C", "D"].map((label) => ({ label }))
    );
  }
  return null; // text input
}

interface RendererProps {
  group: QuestionGroup;
  responses: Record<number, string>;
  onAnswer: (questionNumber: number, value: string) => void;
  disabled?: boolean;
}

export function QuestionRenderer(props: RendererProps) {
  const { group } = props;
  // A table completion prints its blanks inside the table, so the table *is*
  // the question list.
  if (group.table) return <TableCompletion {...props} />;
  // Notes and summaries print their blanks inside the body text, so the body
  // *is* the question list — same as a table. Length, not presence: an empty
  // array would render a body with no lines and every question orphaned.
  if (group.notes?.length) return <NotesCompletion {...props} />;
  // "Choose TWO letters, A-E" is one choice filling several answer boxes, not
  // one choice per box.
  if (group.answerMatch.kind === "letter-set") return <LetterSet {...props} />;
  return <QuestionList {...props} numbers={group.questions.map((q) => q.number)} />;
}

// ── Shared pieces ────────────────────────────────────────────────────────────

function NumberChip({
  n,
  answered,
  className,
}: {
  n: number;
  answered: boolean;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "grid h-6 w-6 shrink-0 place-items-center rounded-md text-xs font-semibold tabular-nums transition-colors duration-200",
        answered
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground",
        className,
      )}
    >
      {n}
    </span>
  );
}

function AnswerInput({
  n,
  value,
  onAnswer,
  disabled,
  className,
  placeholder = "Type your answer",
}: {
  n: number;
  value: string;
  onAnswer: (n: number, v: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      aria-label={`Question ${n}`}
      value={value}
      disabled={disabled}
      onChange={(e) => onAnswer(n, e.target.value)}
      className={cx(
        "rounded-xl border bg-card px-3.5 py-2.5 text-foreground outline-none",
        "transition-colors duration-200 placeholder:text-muted-foreground/70",
        "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-60",
        value !== "" ? "border-primary/50" : "border-border",
        className,
      )}
      placeholder={placeholder}
    />
  );
}

function OptionButton({
  option,
  id,
  name,
  type,
  selected,
  used,
  disabled,
  onSelect,
}: {
  option: Option;
  id: string;
  name: string;
  type: "radio" | "checkbox";
  selected: boolean;
  used?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      htmlFor={id}
      className={cx(
        // 44px min touch target — options are the most-tapped control in the
        // whole app.
        "inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-4 text-sm font-medium",
        "transition-all duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background",
        option.text ? "py-2.5 text-left" : "justify-center",
        selected
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
        !selected && used && "opacity-50",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      <input
        id={id}
        type={type}
        name={name}
        value={option.label}
        checked={selected}
        disabled={disabled}
        aria-label={
          used && !selected ? `${option.label} (already used)` : option.label
        }
        onChange={onSelect}
        className="sr-only"
      />
      <span className={cx("font-semibold", option.text && "shrink-0")}>
        {option.label}
      </span>
      {option.text && (
        <span className={cx("font-normal", selected ? "" : "text-foreground")}>
          {option.text}
        </span>
      )}
    </label>
  );
}

/**
 * The group's option list, printed once. Papers print it once and then take
 * only a letter per question; repeating it under every statement buries them.
 */
function OptionKey({ options }: { options: Option[] }) {
  return (
    // Stays put while its own questions scroll past, then releases with the
    // group. On paper the list and its questions share one page; on a screen
    // they do not, and scrolling back to remember what "C" stood for is
    // friction the paper never had.
    //
    // lg:top-44 matches the passage column in section-view.tsx — the player's
    // header wraps its question navigator, so its height is not fixed and this
    // is the offset already measured for it. Below lg the header is taller
    // still relative to the viewport, so the key scrolls normally there, as
    // the passage does.
    <dl className="grid gap-x-6 gap-y-1.5 rounded-xl border border-border bg-muted/95 px-4 py-3 text-sm backdrop-blur-sm sm:grid-cols-2 lg:sticky lg:top-44 lg:z-20">
      {options.map((opt) => (
        <div key={opt.label} className="flex gap-2.5">
          <dt className="w-6 shrink-0 font-semibold text-foreground">
            {opt.label}
          </dt>
          <dd className="text-foreground">{opt.text}</dd>
        </div>
      ))}
    </dl>
  );
}

// ── One choice (or one text answer) per question ─────────────────────────────

function QuestionList({
  group,
  numbers,
  responses,
  onAnswer,
  disabled,
}: RendererProps & { numbers: number[] }) {
  const groupOptions = optionsFor(group);
  // A multiple-choice question carries its own A-D. Those are printed under
  // the stem they belong to, so there is no shared key above — and no letter
  // can be "used up" by a neighbour, because each question has its own list.
  const ownOptions = group.questions.some((q) => q.options?.length);
  const showKey = !ownOptions && (groupOptions?.some((o) => o.text) ?? false);
  // A matching group whose letters are used once each: dim the ones already
  // spent so the candidate can see what is left.
  const singleUse =
    !ownOptions &&
    group.answerMatch.kind === "letter" &&
    !group.optionsReusable;

  return (
    <div className="space-y-5">
      {showKey && <OptionKey options={groupOptions!} />}
      <ol className="space-y-6">
        {group.questions
          .filter((q) => numbers.includes(q.number))
          .map((q) => {
            const answer = responses[q.number];
            const answered = answer != null && answer !== "";

            const options = q.options?.length ? q.options : groupOptions;
            // Options stack when they carry their own text; bare letters sit
            // in a row.
            // What the BUTTON shows, not what the data holds: with a key
            // above, these render as bare letters and belong in a row.
            const lettersOnly = showKey || !options?.some((o) => o.text);

            return (
              <li key={q.number} className="space-y-3">
                <div className="flex gap-3">
                  <NumberChip n={q.number} answered={answered} className="mt-0.5" />
                  {q.content && (
                    <p className="leading-relaxed text-foreground">{q.content}</p>
                  )}
                </div>

                {options ? (
                  <fieldset
                    role="radiogroup"
                    aria-label={`Question ${q.number}`}
                    className={cx(
                      "flex gap-2 pl-9",
                      lettersOnly ? "flex-wrap" : "flex-col",
                    )}
                  >
                    {options.map((opt) => (
                      <OptionButton
                        key={opt.label}
                        // With a key above, a letter here is enough; without
                        // one, the choice has to carry its own text.
                        option={showKey ? { label: opt.label } : opt}
                        id={`q${q.number}-${opt.label}`}
                        name={`q-${q.number}`}
                        type="radio"
                        selected={answered && answer === opt.label}
                        used={
                          singleUse &&
                          group.questions.some(
                            (other) =>
                              other.number !== q.number &&
                              responses[other.number] === opt.label,
                          )
                        }
                        disabled={disabled}
                        onSelect={() => onAnswer(q.number, opt.label)}
                      />
                    ))}
                  </fieldset>
                ) : (
                  <div className="pl-9">
                    <AnswerInput
                      n={q.number}
                      value={answer ?? ""}
                      onAnswer={onAnswer}
                      disabled={disabled}
                      className="w-full max-w-sm"
                    />
                  </div>
                )}
              </li>
            );
          })}
      </ol>
    </div>
  );
}

// ── "Choose TWO letters, A-E" ────────────────────────────────────────────────

function LetterSet({ group, responses, onAnswer, disabled }: RendererProps) {
  const options = optionsFor(group) ?? [];
  const slots = group.questions.map((q) => q.number);
  const chosen = slots.map((n) => responses[n] ?? "");
  const limit = group.selectCount ?? slots.length;
  const picked = chosen.filter((v) => v !== "").length;
  const full = picked >= limit;

  function toggle(label: string) {
    const at = chosen.indexOf(label);
    if (at >= 0) {
      onAnswer(slots[at], "");
      return;
    }
    const empty = chosen.indexOf("");
    if (empty >= 0) onAnswer(slots[empty], label);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span className="flex gap-1.5">
          {slots.map((n, i) => (
            <NumberChip key={n} n={n} answered={chosen[i] !== ""} />
          ))}
        </span>
        <span className="tabular-nums">
          {picked} of {limit} selected
        </span>
      </div>
      <fieldset
        aria-label={`Questions ${group.range[0]} to ${group.range[1]}, choose ${limit}`}
        className={cx("gap-2", options.some((o) => o.text) ? "grid" : "flex flex-wrap")}
      >
        {options.map((opt) => {
          const selected = chosen.includes(opt.label);
          return (
            <OptionButton
              key={opt.label}
              option={opt}
              id={`g${group.id}-${opt.label}`}
              name={`g-${group.id}`}
              type="checkbox"
              selected={selected}
              disabled={disabled || (full && !selected)}
              onSelect={() => toggle(opt.label)}
            />
          );
        })}
      </fieldset>
    </div>
  );
}

// ── Table completion ─────────────────────────────────────────────────────────

const BLANK_TOKEN = /\[\[(\d+)\]\]/;

/** Renders one printed line or cell, with an input wherever `[[n]]` appears. */
function BlankText({
  text,
  responses,
  onAnswer,
  disabled,
}: {
  text: string;
  responses: Record<number, string>;
  onAnswer: (n: number, v: string) => void;
  disabled?: boolean;
}) {
  const parts = text.split(/(\[\[\d+\]\])/).filter((p) => p !== "");
  return (
    <>
      {parts.map((part, i) => {
        const m = BLANK_TOKEN.exec(part);
        if (!m) return <span key={i}>{part}</span>;
        const n = Number(m[1]);
        const value = responses[n] ?? "";
        return (
          <span key={i} className="mx-1 inline-flex items-center gap-1.5 align-middle">
            <NumberChip n={n} answered={value !== ""} />
            <AnswerInput
              n={n}
              value={value}
              onAnswer={onAnswer}
              disabled={disabled}
              className="w-32 py-1.5 text-sm"
              placeholder="Answer"
            />
          </span>
        );
      })}
    </>
  );
}

function TableCompletion({
  group,
  responses,
  onAnswer,
  disabled,
}: RendererProps) {
  const rows = group.table ?? [];
  const hasHeader = rows.length > 1 && !rows[0].some((c) => BLANK_TOKEN.test(c));
  const body = hasHeader ? rows.slice(1) : rows;
  const inTable = new Set(
    rows.flatMap((row) =>
      row.flatMap((cell) =>
        [...cell.matchAll(/\[\[(\d+)\]\]/g)].map((m) => Number(m[1])),
      ),
    ),
  );
  // A blank the table parse missed would otherwise be unanswerable.
  const orphans = group.questions
    .map((q) => q.number)
    .filter((n) => !inTable.has(n));

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left align-top text-sm">
          {hasHeader && (
            <thead>
              <tr>
                {rows[0].map((cell, i) => (
                  <th
                    key={i}
                    scope="col"
                    className="border border-border bg-muted/50 px-3 py-2 font-semibold text-foreground"
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {body.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td
                    key={c}
                    className="border border-border px-3 py-2.5 leading-relaxed text-foreground"
                  >
                    <BlankText
                      text={cell}
                      responses={responses}
                      onAnswer={onAnswer}
                      disabled={disabled}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {orphans.length > 0 && (
        <QuestionList
          group={group}
          numbers={orphans}
          responses={responses}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      )}
    </div>
  );
}

function NotesCompletion({
  group,
  responses,
  onAnswer,
  disabled,
}: RendererProps) {
  const lines = group.notes ?? [];
  const inNotes = new Set(
    lines.flatMap((line) =>
      [...line.matchAll(/\[\[(\d+)\]\]/g)].map((m) => Number(m[1])),
    ),
  );
  // A blank the notes parse missed would otherwise be unanswerable.
  const orphans = group.questions
    .map((q) => q.number)
    .filter((n) => !inNotes.has(n));

  return (
    <div className="space-y-6">
      {/* leading-loose: the inline inputs are taller than the text, and
          without it the wrapped lines collide. */}
      <div className="space-y-2 leading-loose text-foreground">
        {lines.map((line, i) => (
          <p key={i}>
            <BlankText
              text={line}
              responses={responses}
              onAnswer={onAnswer}
              disabled={disabled}
            />
          </p>
        ))}
      </div>
      {orphans.length > 0 && (
        <QuestionList
          group={group}
          numbers={orphans}
          responses={responses}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      )}
    </div>
  );
}
