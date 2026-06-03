import Link from "next/link";
import { HubList } from "@/components/articles/HubList";

const ACCENT = "#5f9e7e";

export default function FinanceHubPage() {
  return (
    <div>
      <Link
        href="/finance-hub/tools"
        className="group mb-8 flex items-center justify-between gap-4 rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md"
        style={{ borderColor: `${ACCENT}40` }}
      >
        <div>
          <p
            className="font-semibold text-sm leading-snug group-hover:underline"
            style={{ color: ACCENT }}
          >
            Financial Calculators
          </p>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground leading-relaxed">
            7 pure-math tools — FIRE numbers, real returns, the lifetime value of a raise, and more. Runs entirely in your browser.
          </p>
        </div>
        <span
          className="flex-shrink-0 text-xs font-medium"
          style={{ color: ACCENT }}
        >
          Open tools →
        </span>
      </Link>

      <HubList hub="FINANCE_HUB" />
    </div>
  );
}
