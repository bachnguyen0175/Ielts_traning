"use client";

import { memo, useRef, useState } from "react";

/**
 * Reading passage with a highlight tool (SIT-5). Selecting text reveals a
 * "Highlight" button that wraps the selection in a <mark>. Memoized so answering
 * questions (parent re-renders) doesn't wipe highlights. Highlights are
 * ephemeral for now (not persisted across reloads).
 */
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
    <article className="space-y-3">
      <h3 className="font-serif text-xl font-semibold text-foreground">
        {title}
      </h3>
      <div ref={ref} onMouseUp={onMouseUp} className="space-y-3">
        {body?.split("\n\n").map((para, i) => (
          <p key={i} className="leading-relaxed text-muted-foreground">
            {para}
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
            top: btn.y - 44,
            transform: "translateX(-50%)",
          }}
          className="z-50 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-lg"
        >
          Highlight
        </button>
      )}
    </article>
  );
});
