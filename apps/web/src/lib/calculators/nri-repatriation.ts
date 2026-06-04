// NRI Repatriation Calculator — pure math, no side effects.
//
// Estimates how much of an Indian income or asset-sale amount can be
// repatriated to the US after Indian taxes, expressed in USD, and compares
// against the RBI's USD 1M/year NRO repatriation limit.
//
// ⚠️  ESTIMATE ONLY. Tax rules change. The constants used here are flagged and
// dated in regulatory-rules.ts — verify before relying on them. This is NOT
// tax or legal advice.
//
// Formula:
//   taxableInr    = max(0, grossAmountInr - ltcgEquityExemptionInr)
//                   (exemption only applies to LTCG-equity asset type)
//   taxInr        = taxableInr * (tdsRatePct / 100)
//   cessInr       = taxInr * (cessRatePct / 100)
//   netInr        = grossAmountInr - taxInr - cessInr
//   netUsd        = netInr / usdToInr
//   limitPctUsed  = (netUsd / repatriationLimitUsd) * 100
//
// The user adjusts tdsRatePct and cessRatePct — seeded from regulatory-rules.ts
// but user-editable so DTAA reductions or personal circumstances can be modelled.

import {
  NRO_REPATRIATION_LIMIT_USD,
  INDIA_CESS_PCT,
} from "./regulatory-rules";

export type NriAssetType =
  | "nro-interest"
  | "ltcg-equity"
  | "stcg-equity"
  | "ltcg-realty"
  | "dividend";

export interface NriRepatriationInput {
  grossAmountInr: number;
  assetType: NriAssetType;
  tdsRatePct: number;            // user-editable; seeded from regulatory-rules
  cessRatePct: number;           // user-editable; default INDIA_CESS_PCT (4%)
  ltcgEquityExemptionInr: number; // only used for ltcg-equity; default LTCG_EQUITY_EXEMPTION_INR
  usdToInr: number;
  repatriationLimitUsd?: number; // default NRO_REPATRIATION_LIMIT_USD
}

export interface NriRepatriationResult {
  taxableAmountInr: number;   // after LTCG equity exemption if applicable
  taxInr: number;             // base tax on taxable amount
  cessInr: number;            // 4% cess on the base tax
  totalDeductionInr: number;  // taxInr + cessInr
  netInr: number;             // grossAmountInr - totalDeductionInr
  netUsd: number;             // netInr / usdToInr
  effectiveTaxRatePct: number; // (taxInr + cessInr) / grossAmountInr * 100
  repatriationLimitUsd: number;
  limitPctUsed: number;       // netUsd as % of the $1M limit
  exceedsLimit: boolean;
  excessUsd: number;          // > 0 only if exceedsLimit
}

export function calcNriRepatriation(
  input: NriRepatriationInput
): NriRepatriationResult {
  const {
    grossAmountInr,
    assetType,
    tdsRatePct,
    cessRatePct,
    ltcgEquityExemptionInr,
    usdToInr,
    repatriationLimitUsd = NRO_REPATRIATION_LIMIT_USD,
  } = input;

  const gross = Math.max(0, grossAmountInr);

  // LTCG equity has an annual per-taxpayer exemption; other asset types do not.
  const exemption =
    assetType === "ltcg-equity" ? Math.max(0, ltcgEquityExemptionInr) : 0;
  const taxableAmountInr = Math.max(0, gross - exemption);

  const taxInr = taxableAmountInr * (tdsRatePct / 100);
  const cessInr = taxInr * (cessRatePct / 100);
  const totalDeductionInr = taxInr + cessInr;
  const netInr = Math.max(0, gross - totalDeductionInr);
  const netUsd = usdToInr > 0 ? netInr / usdToInr : 0;
  const effectiveTaxRatePct = gross > 0 ? (totalDeductionInr / gross) * 100 : 0;

  const limitPctUsed = repatriationLimitUsd > 0
    ? (netUsd / repatriationLimitUsd) * 100
    : 0;
  const exceedsLimit = netUsd > repatriationLimitUsd;
  const excessUsd = exceedsLimit ? netUsd - repatriationLimitUsd : 0;

  return {
    taxableAmountInr,
    taxInr,
    cessInr,
    totalDeductionInr,
    netInr,
    netUsd,
    effectiveTaxRatePct,
    repatriationLimitUsd,
    limitPctUsed,
    exceedsLimit,
    excessUsd,
  };
}

// Default TDS rates by asset type — seeded from regulatory-rules, exported so
// the UI can auto-populate when the user selects an asset type.
// ⚠️  These defaults come from regulatory-rules.ts — see that file for sources.
export const DEFAULT_TDS_BY_ASSET_TYPE: Record<NriAssetType, number> = {
  "nro-interest":  30,  // Section 195; DTAA may reduce to 15%
  "ltcg-equity":   12.5,
  "stcg-equity":   20,
  "ltcg-realty":   12.5,
  "dividend":      20,
};

export const ASSET_TYPE_LABELS: Record<NriAssetType, string> = {
  "nro-interest": "NRO interest income",
  "ltcg-equity":  "LTCG — listed equity / equity MF (>12 months)",
  "stcg-equity":  "STCG — listed equity / equity MF (≤12 months)",
  "ltcg-realty":  "LTCG — immovable property (>2 years)",
  "dividend":     "Dividend from Indian company",
};

// Spot-checks (hand-verifiable):
//
// NRO interest, ₹10,00,000, TDS 30%, cess 4%, rate 84:
//   taxable = 10,00,000 (no exemption)
//   tax = 3,00,000; cess = 12,000; deduction = 3,12,000
//   net = 6,88,000; net USD = 6,88,000/84 ≈ $8,190
//   effectiveTaxRate = 31.2%; limitPctUsed ≈ 0.82% ✓
//
// LTCG equity, ₹3,00,000, exemption ₹1,25,000 used 0, TDS 12.5%, cess 4%, rate 84:
//   taxable = 3,00,000 - 1,25,000 = 1,75,000
//   tax = 21,875; cess = 875; deduction = 22,750
//   net = 2,77,250; net USD ≈ $3,300 ✓
