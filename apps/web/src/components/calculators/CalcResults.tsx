// Results display pattern: a headline figure + supporting breakdown rows.

const ACCENT = "#5f9e7e";

interface Row {
  label: string;
  value: string;
  muted?: boolean;      // secondary info in muted color
  highlight?: boolean;  // emphasize this row
}

interface CalcResultsProps {
  headline?: { label: string; value: string }; // optional when `empty` is set
  rows?: Row[];
  empty?: string; // message when no result yet — suppresses headline requirement
}

export function CalcResults({ headline, rows, empty }: CalcResultsProps) {
  if (empty) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">{empty}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
      {/* Headline */}
      {headline && (
        <div className="px-5 py-5 border-b border-border/40" style={{ backgroundColor: `${ACCENT}0d` }}>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
            {headline.label}
          </p>
          <p className="text-3xl font-serif font-normal" style={{ color: ACCENT }}>
            {headline.value}
          </p>
        </div>
      )}

      {/* Breakdown rows */}
      {rows && rows.length > 0 && (
        <ul className="divide-y divide-border/40">
          {rows.map((row, i) => (
            <li
              key={i}
              className="flex items-baseline justify-between px-5 py-2.5 gap-4"
            >
              <span
                className={`text-sm ${row.muted ? "text-muted-foreground" : "text-foreground"}`}
              >
                {row.label}
              </span>
              <span
                className={`text-sm font-medium tabular-nums text-right ${
                  row.highlight
                    ? "font-semibold"
                    : row.muted
                    ? "text-muted-foreground"
                    : "text-foreground"
                }`}
                style={row.highlight ? { color: ACCENT } : undefined}
              >
                {row.value}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// A minimal reset button — place below the inputs section.
interface ResetButtonProps {
  onReset: () => void;
}

export function ResetButton({ onReset }: ResetButtonProps) {
  return (
    <button
      type="button"
      onClick={onReset}
      className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2 mt-1"
    >
      Reset to defaults
    </button>
  );
}
