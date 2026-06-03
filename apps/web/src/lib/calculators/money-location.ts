// US↔India "Where should my money live?" — pure math, no side effects.
//
// Compares investing USD in the US vs. converting to INR and placing in
// an Indian fixed deposit, accounting for:
//   - live USD/INR exchange rate
//   - an FX trend assumption (INR depreciation per year — positive = INR weakens)
//   - user-entered post-tax returns for each country
//   - user-entered tax rates applied to nominal gains
//
// NOTE: This is an ESTIMATE. Tax rules vary by residency, account type, and
// treaty status. Use user-entered rates; never compute anyone's actual tax.
//
// India scenario (final value in USD):
//   1. Convert: amount_inr = amountUsd * usdToInr
//   2. FD grows: india_fv_inr = amount_inr * (1 + netIndiaRate)^years
//   3. Future FX: futureRate = usdToInr * (1 + fxTrendPct/100)^years
//      (fxTrendPct > 0 = INR weakens → more INR per USD at exit)
//   4. india_fv_usd = india_fv_inr / futureRate
//
// US scenario:
//   us_fv_usd = amountUsd * (1 + netUsRate)^years

export interface MoneyLocationInput {
  amountUsd: number;
  usdToInr: number;
  fxTrendPctPerYear: number; // % annual INR change; positive = INR weakens vs USD
  usReturnPct: number;       // nominal US investment return (%)
  indiaFdRatePct: number;    // India FD / savings rate (%)
  usTaxPct: number;          // user-entered US effective tax rate on gains (%)
  indiaTaxPct: number;       // user-entered India effective tax rate on interest (%)
  years: number;
}

export interface MoneyLocationResult {
  amountInr: number;         // initial USD converted to INR at current rate

  // India scenario
  indiaNetRatePct: number;   // after-tax India rate
  indiaFvInr: number;        // India ending value in INR
  futureUsdToInr: number;    // projected USD/INR after N years
  indiaFvUsd: number;        // India ending value converted back to USD

  // US scenario
  usNetRatePct: number;      // after-tax US rate
  usFvUsd: number;           // US ending value in USD

  // Comparison
  winner: "india" | "us" | "tie";
  differenceUsd: number;     // |india - us| in USD
  differencePct: number;     // % more than the lower scenario
}

export function calcMoneyLocation(input: MoneyLocationInput): MoneyLocationResult {
  const {
    amountUsd, usdToInr, fxTrendPctPerYear,
    usReturnPct, indiaFdRatePct, usTaxPct, indiaTaxPct, years,
  } = input;
  const n = Math.max(0, Math.round(years));

  const amountInr = amountUsd * usdToInr;

  // India: FD interest net of tax
  const indiaNetRatePct = indiaFdRatePct * (1 - indiaTaxPct / 100);
  const indiaFvInr = amountInr * Math.pow(1 + indiaNetRatePct / 100, n);

  // Future FX rate: if INR weakens by fxTrend%/yr, each USD buys more INR at exit
  const futureUsdToInr = usdToInr * Math.pow(1 + fxTrendPctPerYear / 100, n);
  const indiaFvUsd = futureUsdToInr > 0 ? indiaFvInr / futureUsdToInr : 0;

  // US: nominal return net of tax
  const usNetRatePct = usReturnPct * (1 - usTaxPct / 100);
  const usFvUsd = amountUsd * Math.pow(1 + usNetRatePct / 100, n);

  const diff = Math.abs(indiaFvUsd - usFvUsd);
  const winner: "india" | "us" | "tie" =
    diff < 0.01 ? "tie" : indiaFvUsd > usFvUsd ? "india" : "us";
  const lowerFv = Math.min(indiaFvUsd, usFvUsd);
  const differencePct = lowerFv > 0 ? (diff / lowerFv) * 100 : 0;

  return {
    amountInr,
    indiaNetRatePct,
    indiaFvInr,
    futureUsdToInr,
    indiaFvUsd,
    usNetRatePct,
    usFvUsd,
    winner,
    differenceUsd: diff,
    differencePct,
  };
}

// Spot-checks:
// amountUsd=1000, usdToInr=84, fxTrend=0, usReturn=7, indiaFd=7,
//   usTax=0, indiaTax=0, years=10:
//   indiaNetRate=7%, usNetRate=7%, futureRate=84
//   indiaFvInr = 84000 * 1.07^10 = 84000 * 1.9672 ≈ 165,244
//   indiaFvUsd = 165,244 / 84 ≈ 1,967 = 1000 * 1.07^10  → tie ✓
//
// Same but fxTrend=3% (INR weakens):
//   futureRate = 84 * 1.03^10 ≈ 112.9
//   indiaFvUsd = 165,244 / 112.9 ≈ 1,463 vs usFvUsd=1,967 → US wins ✓
