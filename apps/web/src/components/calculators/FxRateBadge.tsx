"use client";

// Shows the FX rate freshness indicator ("rates as of [date]") or an
// error notice — never silently disappears.

import type { FxState } from "@/lib/calculators/fx-client";

interface FxRateBadgeProps {
  fxState: FxState;
}

export function FxRateBadge({ fxState }: FxRateBadgeProps) {
  if (fxState.status === "loading") {
    return (
      <p className="text-xs text-muted-foreground animate-pulse">
        Fetching current exchange rates…
      </p>
    );
  }

  if (fxState.status === "error") {
    return (
      <p className="text-xs text-destructive">
        ⚠ {fxState.message}
      </p>
    );
  }

  // Format the date from ISO "2026-06-03" to "Jun 3, 2026"
  const formatted = new Date(fxState.date + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <p className="text-xs text-muted-foreground">
      1 USD = ₹{fxState.usdToInr.toFixed(2)} · rates as of {formatted} (ECB via Frankfurter)
    </p>
  );
}
