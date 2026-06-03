// Client-side FX rate hook — fetches /api/fx-rates once on mount.
// The route handler caches Frankfurter for 4 h server-side, so this
// client fetch is cheap (no direct call to Frankfurter from the browser).

import { useState, useEffect } from "react";
import type { FxRatesResult } from "@/app/api/fx-rates/route";

export type FxState =
  | { status: "loading" }
  | { status: "ok"; usdToInr: number; date: string }
  | { status: "error"; message: string };

export function useFxRates(): FxState {
  const [state, setState] = useState<FxState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/fx-rates")
      .then((r) => r.json() as Promise<FxRatesResult>)
      .then((data) => {
        if (cancelled) return;
        if (data.ok) {
          setState({ status: "ok", usdToInr: data.usdToInr, date: data.date });
        } else {
          setState({ status: "error", message: data.error });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({ status: "error", message: "Exchange rates temporarily unavailable." });
        }
      });
    return () => { cancelled = true; };
  }, []);

  return state;
}
