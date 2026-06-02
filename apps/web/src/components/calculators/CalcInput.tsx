// Reusable labeled number input for calculators.
// Supports prefix adornment ($), suffix adornment (%, yr, /mo), min/max/step.

const ACCENT = "#5f9e7e";

interface CalcInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;   // e.g. "$"
  suffix?: string;   // e.g. "%", "yr", "/mo"
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
}

export function CalcInput({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  min = 0,
  max,
  step = 1,
  hint,
}: CalcInputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-foreground mb-1">
        {label}
      </label>
      <div className="flex items-center rounded-md border border-border bg-background focus-within:ring-2 focus-within:ring-offset-0"
        style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}
      >
        {prefix && (
          <span className="pl-3 pr-1 text-sm text-muted-foreground select-none flex-shrink-0">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="number"
          value={value}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) onChange(v);
          }}
          min={min}
          max={max}
          step={step}
          className="flex-1 min-w-0 bg-transparent py-2 px-2 text-sm text-foreground focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {suffix && (
          <span className="pr-3 pl-1 text-sm text-muted-foreground select-none flex-shrink-0">
            {suffix}
          </span>
        )}
      </div>
      {hint && (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

// A simple select for non-numeric options (e.g. monthly/annual).
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
