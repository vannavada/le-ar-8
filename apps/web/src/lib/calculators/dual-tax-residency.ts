// Dual-Tax-Residency Estimator — pure math, no side effects.
//
// ⚠️  THIS IS A DELIBERATELY ROUGH, BALLPARK ESTIMATOR — NOT A TAX COMPUTATION.
//
// Real dual-residency tax analysis involves: DTAA tie-breaker rules, FEIE,
// FBAR, FATCA, state income taxes, self-employment tax, AMT, capital-gains
// carve-outs, specific income sourcing rules, treaty elections, and
// professional judgment about which regime applies. None of that is modelled
// here. This tool shows the ORDER OF MAGNITUDE of potential exposure and
// whether the Foreign Tax Credit is likely to prevent double-taxation —
// nothing more. Treat every output as a rough starting point for a CPA
// conversation, not an actionable figure.
//
// Model:
//   1. India tax: simplified new-regime slab rate on India income (no 87A
//      rebate — NRIs are not eligible). Plus 4% cess.
//   2. US tax: simplified 2024 bracket calculation on worldwide income
//      (US income + India income in USD). Optional standard deduction.
//   3. Foreign Tax Credit: estimated as min(India tax in USD, US tax
//      attributable to India income via rough marginal-rate proxy).
//   4. Net US tax: US bracket tax − FTC (floor at 0).
//   5. Total estimated burden = net US tax + India tax in USD.
//
// Simplifications (all flagged in UI):
//   - All income treated as ordinary; capital gains handled separately in IRL.
//   - No FEIE (Form 2555); no FBAR; no AMT; no state income tax.
//   - No treaty tiebreaker rules — assumes full exposure in both countries.
//   - FTC proxy is an approximation; actual FTC computation requires Form 1116.
//   - India new regime used; old regime may apply to NRIs for certain incomes.

import {
  INDIA_NEW_REGIME_SLABS_INR,
  INDIA_CESS_PCT,
  US_BRACKETS_SINGLE_2024_USD,
  US_BRACKETS_MFJ_2024_USD,
  US_STANDARD_DEDUCTION_SINGLE_2024_USD,
  US_STANDARD_DEDUCTION_MFJ_2024_USD,
} from "./regulatory-rules";

export type FilingStatus = "single" | "mfj";

export interface DualTaxResidencyInput {
  usIncomeUsd: number;       // US-source income (wages, business, etc.)
  indiaIncomeInr: number;    // India-source income
  filingStatus: FilingStatus;
  usdToInr: number;
  applyUsStdDeduction: boolean; // whether to subtract std deduction before US brackets
}

export interface DualTaxResidencyResult {
  indiaIncomeUsd: number;
  totalWorldwideUsd: number;

  // India tax (new regime + cess)
  roughIndiaTaxInr: number;
  roughIndiaCessInr: number;
  roughIndiaTotalTaxInr: number;
  roughIndiaTaxUsd: number;
  roughIndiaEffectiveRatePct: number;

  // US tax (before FTC)
  usAgiUsd: number;              // after std deduction if applied
  roughUsTaxBeforeFtcUsd: number;
  roughUsMarginalRatePct: number; // marginal bracket rate at worldwide income level
  roughUsTaxOnIndiaIncomeUsd: number; // proxy: marginal rate × India income in USD

  // FTC estimate
  estimatedFtcUsd: number;

  // Net
  roughNetUsTaxUsd: number;
  totalEstimatedBurdenUsd: number;
  roughEffectiveRatePct: number;

  // Indicator: does FTC likely eliminate double-taxation?
  ftcLikelyCoversFully: boolean;
}

// Apply progressive tax brackets to a given income.
function applyBrackets(
  income: number,
  brackets: ReadonlyArray<{ upTo: number; rate: number }>
): { tax: number; marginalRate: number } {
  if (income <= 0) return { tax: 0, marginalRate: brackets[0].rate };
  let tax = 0;
  let prev = 0;
  let marginalRate = brackets[0].rate;
  for (const bracket of brackets) {
    if (income <= prev) break;
    const taxableInBracket = Math.min(income, bracket.upTo) - prev;
    tax += taxableInBracket * (bracket.rate / 100);
    marginalRate = bracket.rate;
    prev = bracket.upTo;
    if (income <= bracket.upTo) break;
  }
  return { tax, marginalRate };
}

export function calcDualTaxResidency(
  input: DualTaxResidencyInput
): DualTaxResidencyResult {
  const {
    usIncomeUsd,
    indiaIncomeInr,
    filingStatus,
    usdToInr,
    applyUsStdDeduction,
  } = input;

  const usIncome = Math.max(0, usIncomeUsd);
  const indiaIncome = Math.max(0, indiaIncomeInr);
  const rate = Math.max(1, usdToInr);

  const indiaIncomeUsd = indiaIncome / rate;
  const totalWorldwideUsd = usIncome + indiaIncomeUsd;

  // ── India tax (new regime, FY 2024-25) ──────────────────────────────────
  const { tax: roughIndiaTaxInr } = applyBrackets(
    indiaIncome,
    INDIA_NEW_REGIME_SLABS_INR
  );
  const roughIndiaCessInr = roughIndiaTaxInr * (INDIA_CESS_PCT / 100);
  const roughIndiaTotalTaxInr = roughIndiaTaxInr + roughIndiaCessInr;
  const roughIndiaTaxUsd = roughIndiaTotalTaxInr / rate;
  const roughIndiaEffectiveRatePct =
    indiaIncome > 0 ? (roughIndiaTotalTaxInr / indiaIncome) * 100 : 0;

  // ── US tax ───────────────────────────────────────────────────────────────
  const stdDeduction = applyUsStdDeduction
    ? filingStatus === "mfj"
      ? US_STANDARD_DEDUCTION_MFJ_2024_USD
      : US_STANDARD_DEDUCTION_SINGLE_2024_USD
    : 0;

  const usBrackets =
    filingStatus === "mfj"
      ? US_BRACKETS_MFJ_2024_USD
      : US_BRACKETS_SINGLE_2024_USD;

  // US taxes worldwide income; subtract standard deduction first.
  const usAgiUsd = Math.max(0, totalWorldwideUsd - stdDeduction);
  const { tax: roughUsTaxBeforeFtcUsd, marginalRate: roughUsMarginalRatePct } =
    applyBrackets(usAgiUsd, usBrackets);

  // Rough proxy for US tax attributable to India income:
  //   marginal bracket rate × India income in USD.
  // This overstates FTC when India income is large (it would push into higher
  // brackets), making this a conservative (favorable) estimate.
  const roughUsTaxOnIndiaIncomeUsd =
    (roughUsMarginalRatePct / 100) * indiaIncomeUsd;

  // FTC = lesser of India tax paid (in USD) and US tax attributable to India income.
  const estimatedFtcUsd = Math.min(
    roughIndiaTaxUsd,
    roughUsTaxOnIndiaIncomeUsd
  );

  const roughNetUsTaxUsd = Math.max(0, roughUsTaxBeforeFtcUsd - estimatedFtcUsd);
  const totalEstimatedBurdenUsd = roughNetUsTaxUsd + roughIndiaTaxUsd;
  const roughEffectiveRatePct =
    totalWorldwideUsd > 0
      ? (totalEstimatedBurdenUsd / totalWorldwideUsd) * 100
      : 0;

  // FTC likely covers fully if India tax (USD) ≥ US marginal rate × India income
  const ftcLikelyCoversFully =
    roughIndiaTaxUsd >= roughUsTaxOnIndiaIncomeUsd;

  return {
    indiaIncomeUsd,
    totalWorldwideUsd,
    roughIndiaTaxInr,
    roughIndiaCessInr,
    roughIndiaTotalTaxInr,
    roughIndiaTaxUsd,
    roughIndiaEffectiveRatePct,
    usAgiUsd,
    roughUsTaxBeforeFtcUsd,
    roughUsMarginalRatePct,
    roughUsTaxOnIndiaIncomeUsd,
    estimatedFtcUsd,
    roughNetUsTaxUsd,
    totalEstimatedBurdenUsd,
    roughEffectiveRatePct,
    ftcLikelyCoversFully,
  };
}

// Spot-checks (hand-verifiable):
//
// US income $0, India income ₹15,00,000, FX 84, single, no std deduction:
//   indiaIncomeUsd = 15,00,000/84 ≈ $17,857
//   India new regime:
//     0–3L: 0; 3–7L: 4L × 5% = 20,000; 7–10L: 3L × 10% = 30,000;
//     10–12L: 2L × 15% = 30,000; 12–15L: 3L × 20% = 60,000
//     roughIndiaTaxInr = 1,40,000
//     cess = 5,600; total = 1,45,600 ≈ $1,733
//   US tax on $17,857 (single, no std deduction):
//     0–11,600: $1,160; 11,600–17,857: $6,257 × 12% = $750.84 → total ≈ $1,911
//     marginalRate = 12%
//   FTC = min(1,733, 12% × 17,857 = 2,143) = 1,733
//   netUsTax = 1,911 - 1,733 = 178 → total burden ≈ 1,733 + 178 = $1,911 ✓
//   ftcLikelyCoversFully: 1,733 < 2,143 → false (India tax < US marginal cost)
//   (At 30% India rate, FTC typically covers fully for lower US brackets)
