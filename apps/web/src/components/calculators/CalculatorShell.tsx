import Link from "next/link";

// FinanceHub sage accent — matches sections.ts
const ACCENT = "#5f9e7e";

interface CalculatorShellProps {
  title: string;
  description: string;
  inputs: React.ReactNode;
  results: React.ReactNode;
  notes?: React.ReactNode;
  ctaSlot?: React.ReactNode;
  /** Optional full-width alert/disclaimer banner rendered above the two-column layout. Use for Build 3 regulatory calculators. */
  alertBanner?: React.ReactNode;
}

export function CalculatorShell({
  title,
  description,
  inputs,
  results,
  notes,
  ctaSlot,
  alertBanner,
}: CalculatorShellProps) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground mb-4">
        <Link href="/finance-hub" className="hover:underline">
          FinanceHub
        </Link>
        <span className="mx-1.5 opacity-50">›</span>
        <Link href="/finance-hub/tools" className="hover:underline">
          Calculators
        </Link>
        <span className="mx-1.5 opacity-50">›</span>
        <span>{title}</span>
      </nav>

      {/* Title block */}
      <div className="mb-6 pb-4 border-b" style={{ borderColor: `${ACCENT}40` }}>
        <h2
          className="text-2xl font-serif font-normal leading-tight"
          style={{ color: ACCENT }}
        >
          {title}
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed max-w-2xl">
          {description}
        </p>
      </div>

      {/* Full-width alert banner (Build 3 regulatory calculators) */}
      {alertBanner && <div className="mb-6">{alertBanner}</div>}

      {/* Main two-column layout: inputs left, results right */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 lg:gap-8 items-start">
        <section aria-label="Inputs">{inputs}</section>
        <section aria-label="Results">{results}</section>
      </div>

      {/* Notes / assumptions */}
      {notes && (
        <div className="mt-8 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground leading-relaxed">{notes}</p>
        </div>
      )}

      {/* Affiliate / CTA slot */}
      {ctaSlot && <div className="mt-8">{ctaSlot}</div>}
    </div>
  );
}
