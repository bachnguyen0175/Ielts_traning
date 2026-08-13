"use client";

import {
  createContext,
  use,
  useId,
  type ComponentProps,
  type ReactNode,
} from "react";
import { cx } from "@/lib/cx";

// A form field is the one place a shared context genuinely earns its keep: the
// label, control, hint and error all need to agree on the same ids for
// `htmlFor` / `aria-describedby` / `aria-invalid`. Passing those by hand is how
// accessible markup rots, so the context wires them once.
//
// `error` is a message, not a boolean mode — the control renders the same way
// either way, it just also announces the problem.

type FieldContextValue = {
  id: string;
  describedBy?: string;
  invalid: boolean;
};

const FieldContext = createContext<FieldContextValue | null>(null);

function useField(): FieldContextValue {
  const ctx = use(FieldContext);
  if (!ctx) {
    throw new Error("Field parts must be rendered inside <Field>");
  }
  return ctx;
}

export function Field({
  label,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  const base = useId();
  const id = `${base}-control`;
  const hintId = `${base}-hint`;
  const errorId = `${base}-error`;

  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <FieldContext value={{ id, describedBy, invalid: Boolean(error) }}>
      <div className={cx("space-y-2", className)}>
        <label
          htmlFor={id}
          className="block text-sm font-medium text-foreground"
        >
          {label}
        </label>

        {children}

        {hint && (
          <p id={hintId} className="text-xs leading-relaxed text-muted-foreground">
            {hint}
          </p>
        )}

        {error && (
          <p
            id={errorId}
            // Errors sit beside the field they belong to, not in a summary at
            // the top (ux-guidelines: Forms / Error Clarity).
            className="text-xs font-medium text-rose-700 dark:text-rose-300"
          >
            {error}
          </p>
        )}
      </div>
    </FieldContext>
  );
}

const controlClasses =
  "w-full rounded-xl border bg-card/60 px-3.5 py-2.5 text-sm text-foreground " +
  "placeholder:text-muted-foreground/70 transition-colors duration-200 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60";

export function FieldInput({
  className,
  ...rest
}: Omit<ComponentProps<"input">, "id" | "aria-describedby" | "aria-invalid">) {
  const { id, describedBy, invalid } = useField();
  return (
    <input
      {...rest}
      id={id}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      className={cx(
        controlClasses,
        invalid ? "border-rose-500/60" : "border-border",
        className,
      )}
    />
  );
}

export function FieldSelect({
  className,
  children,
  ...rest
}: Omit<ComponentProps<"select">, "id" | "aria-describedby" | "aria-invalid">) {
  const { id, describedBy, invalid } = useField();
  return (
    <select
      {...rest}
      id={id}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      className={cx(
        controlClasses,
        "cursor-pointer",
        invalid ? "border-rose-500/60" : "border-border",
        className,
      )}
    >
      {children}
    </select>
  );
}
