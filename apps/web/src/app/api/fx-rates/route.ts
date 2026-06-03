// FX rate route handler — server-side only.
//
// Fetches USD→INR from Frankfurter (api.frankfurter.app).
// Frankfurter uses ECB reference rates, no API key required.
//
// Caching: the underlying fetch uses `next: { revalidate: 14400 }` (4 h).
// Next.js/Vercel stores the Frankfurter response in the Data Cache and
// serves it from there for the next 4 hours. The route handler function
// itself runs on every client request, but the external HTTP call is
// served from cache — Frankfurter is hit at most ~6 times per day.
//
// Failure handling: if Frankfurter is unreachable or returns an error,
// we return a 503 with a clear JSON error field — never silent zeros or NaN.

import { NextResponse } from "next/server";

const FRANKFURTER_URL = "https://api.frankfurter.app/latest?from=USD&to=INR";
const CACHE_SECONDS = 4 * 60 * 60; // 4 hours

export interface FxRatesResponse {
  ok: true;
  usdToInr: number;
  date: string;        // ISO date from ECB, e.g. "2026-06-03"
  fetchedAt: string;   // server ISO timestamp of this response
}

export interface FxRatesError {
  ok: false;
  error: string;
}

export type FxRatesResult = FxRatesResponse | FxRatesError;

export async function GET(): Promise<NextResponse<FxRatesResult>> {
  try {
    const res = await fetch(FRANKFURTER_URL, {
      // Instructs Next.js/Vercel to cache this external fetch for 4 hours.
      // The Data Cache is shared across invocations of this route handler,
      // so Frankfurter is contacted at most once per cache period.
      next: { revalidate: CACHE_SECONDS },
    });

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `Exchange rate source returned ${res.status}. Rates temporarily unavailable.` },
        { status: 503 }
      );
    }

    const data = (await res.json()) as {
      amount: number;
      base: string;
      date: string;
      rates: { INR: number };
    };

    if (!data.rates?.INR || !isFinite(data.rates.INR) || data.rates.INR <= 0) {
      return NextResponse.json(
        { ok: false, error: "Exchange rate response was malformed. Rates temporarily unavailable." },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ok: true,
      usdToInr: data.rates.INR,
      date: data.date,
      fetchedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not reach exchange rate service. Rates temporarily unavailable." },
      { status: 503 }
    );
  }
}
