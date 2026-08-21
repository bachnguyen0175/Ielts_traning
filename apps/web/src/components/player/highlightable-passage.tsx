"use client";

import { memo, useRef, useState } from "react";

/**
 * Reading passage with a highlight tool (SIT-5). Selecting text reveals a
 * "Highlight" button that wraps the selection in a <mark>. Memoized so answering
 * questions (parent re-renders) doesn't wipe highlights. Highlights are
 * ephemeral for now (not persisted across reloads).
 */
/**
 * Splits the body into paragraphs, attaching the printed label ("A", "B", …) to
 * the paragraph it introduces. "Which paragraph contains…" questions point at
 * those labels, so they have to be on screen.
 */
function labelParagraphs(body?: string): { label?: string; text: string }[] {
  const out: { label?: string; text: string }[] = [];
  let pending: string | undefined;
  for (const para of body?.split("\n\n") ?? []) {
    if (/^[A-Z]$/.test(para)) {
      pending = para;
      continue;
    }
    out.push(pending ? { label: pending, text: para } : { text: para });
    pending = undefined;
  }
  return out;
}

export const HighlightablePassage = memo(function HighlightablePassage({
  title,
  body,
}: {
  title: string;
  body?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [btn, setBtn] = useState<{ x: number; y: number } | null>(null);

  function onMouseUp() {
    const sel = typeof window !== "undefined" ? window.getSelection?.() : null;
    if (!sel || sel.isCollapsed || sel.rangeCount === 0 || !ref.current) {
      setBtn(null);
      return;
    }
    const range = sel.getRangeAt(0);
    if (!ref.current.contains(range.commonAncestorContainer)) {
      setBtn(null);
      return;
    }
    const rect = range.getBoundingClientRect();
    setBtn({ x: rect.left + rect.width / 2, y: rect.top });
  }

  function highlight() {
    const sel = window.getSelection?.();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    try {
      const mark = document.createElement("mark");
      mark.className = "rounded bg-accent/30 text-foreground";
      range.surroundContents(mark);
    } catch {
      /* selection crosses element boundaries — skip */
    }
    sel.removeAllRanges();
    setBtn(null);
  }

  return (
    <article>
      <h3 className="font-serif text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      {/* The passage is the primary text on this screen and gets read for
          minutes at a stretch, so it takes full foreground contrast and a
          generous measure — muted grey here was the app's worst legibility
          offender. */}
      <div
        ref={ref}
        onMouseUp={onMouseUp}
        className="mt-4 max-w-prose space-y-4 text-[0.95rem] leading-[1.75] text-foreground"
      >
        {labelParagraphs(body).map((para, i) => (
          <p key={i}>
            {para.label && (
              <>
                <span className="mr-1 font-semibold text-foreground">
                  {para.label}
                </span>{" "}
              </>
            )}
            {para.text}
          </p>
        ))}
      </div>
      {btn && (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={highlight}
          style={{
            position: "fixed",
            left: btn.x,
            // Flip below the selection when there is no room above it.
            top: btn.y > 52 ? btn.y - 44 : btn.y + 24,
            transform: "translateX(-50%)",
          }}
          className="z-50 cursor-pointer rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-lg"
        >
          Highlight
        </button>
      )}
    </article>
  );
});
