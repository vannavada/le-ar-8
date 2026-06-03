"use client";

// Reusable labeled number input for calculators.
//
// value is `number | null` — null means the field is empty/cleared.
// Callers treat null as 0 for optional fields, and suppress results for
// required fields. This allows free editing (clear → blank → retype) with no
// mid-edit snap-back.
//
// Implementation: internal `rawStr` string state drives the <input>; the
// parent's numeric value is only consulted to sync back on external changes
// (reset button). type="text" + inputMode="decimal" gives full string control.

import { useState, useEffect } from "react";

const ACCENT = "#5f9e7e";

interface CalcInputProps {
  id: string;
  label: string;
  value: number | null;              // null = empty/cleared
  onChange: (v: number | null) => void;
  required?: boolean;                // marks with * and shows "Required" when empty
  prefix?: string;                   // e.g. "$"
  suffix?: string;                   // e.g. "%", "yr", "/mo"
  min?: number;                      // informational; not browser-enforced (type="text")
  max?: number;
  step?: number;
  hint?: string;
}

export function CalcInput({
  id,
  label,
  value,
  onChange,
  required,
  prefix,
  suffix,
  hint,
}: CalcInputProps) {
  const [rawStr, setRawStr] = useState<string>(value === null ? "" : String(value));

  // Sync the display string when value changes externally (e.g. reset button).
  // rawStr is intentionally omitted from deps: user typing updates both rawStr
  // and value (via onChange → parent setState), so parseFloat(rawStr) always
  // equals value after a keystroke — the condition is false and no sync fires.
  // A reset changes value without going through handleChange, so the condition
  // is true and we sync. This avoids an infinite update loop.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const rawAsNumber = rawStr === "" ? null : parseFloat(rawStr);
    if (rawAsNumber !== value) {
      setRawStr(value === null ? "" : String(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setRawStr(raw);
    if (raw === "" || raw === "-") {
      onChange(null);
    } else {
      const parsed = parseFloat(raw);
      onChange(isNaN(parsed) ? null : parsed);
    }
  };

  // Normalize partial display strings on blur ("1000." → "1000", "-" → "").
  const handleBlur = () => {
    setRawStr(value === null ? "" : String(value));
  };

  const isInvalid = required === true && value === null;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-foreground mb-1">
        {label}
        {required && (
          <span className="ml-0.5 text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <div
        className={`flex items-center rounded-md border bg-background focus-within:ring-2 focus-within:ring-offset-0 ${
          isInvalid ? "border-destructive/70" : "border-border"
        }`}
        style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}
      >
        {prefix && (
          <span className="pl-3 pr-1 text-sm text-muted-foreground select-none flex-shrink-0">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={rawStr}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-required={required}
          aria-describedby={
            isInvalid ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          className="flex-1 min-w-0 bg-transparent py-2 px-2 text-sm text-foreground focus:outline-none"
        />
        {suffix && (
          <span className="pr-3 pl-1 text-sm text-muted-foreground select-none flex-shrink-0">
            {suffix}
          </span>
        )}
      </div>
      {isInvalid ? (
        <p
          id={`${id}-error`}
          className="mt-1 text-xs font-medium text-destructive"
          role="alert"
        >
          Required
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

// A simple select for non-numeric options (e.g. monthly/annual). Unchanged.
interface CalcSelectProps<T extends string> {
  id: string;
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}

export function CalcSelect<T extends string>({
  id,
  label,
  value,
  onChange,
  options,
}: CalcSelectProps<T>) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-foreground mb-1">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2"
        style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
