"use client";

// Field classification:
//   usIncomeUsd       — REQUIRED (US-source income)
//   indiaIncomeInr    — REQUIRED (India-source income)
//   filingStatus      — REQUIRED (select)
//   applyStdDeduction — optional toggle
//   usdToInr          — from live FX

import { useState, useEffect } from "react";
import { CalculatorShell } from "./CalculatorShell";
import { CalcInput } from "./CalcInput";
import { CalcSelect } from "./CalcInput";
import { CalcResults, ResetButton } from "./CalcResults";
import { FxRateBadge } from "./FxRateBadge";
import { useFxRates } from "@/lib/calculators/fx-client";
import {
  calcDualTaxResidency,
  type FilingStatus,
} from "@/lib/calculators/dual-tax-residency";
import { fmtCurrency, fmtINRCompact, fmtPct } from "@/lib/calculators/format";
import { NestMarginCTA } from "@/components/affiliate/NestMarginCTA";
import { trackCalculatorUsed } from "./calcEvents";

const FILING_OPTIONS: { value: FilingStatus; label: string }[] = [
  { value: "single", label: "Single" },
  { value: "mfj",    label: "Married Filing Jointly (MFJ)" },
];

const DEFAULTS = {
  usIncomeUsd: 120_000,
  indiaIncomeInr: 2_000_000,  // ₹20 lakh
  filingStatus: "single" as FilingStatus,
  applyStdDeduction: true,
};

const RULE_YEAR = "2024";

// This is the strongest disclaimer of the 3 Build 3 calculators.
const DISCLAIMER = (
  <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50/40 dark:bg-amber-950/30 px-4 py-3">
    <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
      ⚠ Rough ballpark only — NOT a tax computation. Consult a professional.
    </p>
    <p className="mt-1 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
      Dual-residency tax situations are among the most complex in personal finance.
      This tool gives a <strong>rough order-of-magnitude estimate</strong> for illustrative
      purposes only. It does NOT model: DTAA tiebreaker rules, FEIE (Form 2555),
      FBAR, FATCA, self-employment tax, state income taxes, AMT, capital gains
      carve-outs, surcharges, or the old vs. new India tax regime distinction.
      US bracket data used here is from <strong>tax year 2024 (approximate)</strong> — verify
      current-year brackets at IRS.gov before use.
      Any number shown here could be materially wrong for your situation.{" "}
      <strong>Do not make tax-planning or residency decisions based on this calculator.</strong>{" "}
      Consult a qualified cross-border CPA or tax attorney before filing in either country.
    </p>
  </div>
);

export function DualTaxResidencyCalculator() {
  const fxState = useFxRates();

  const [usIncome, setUsIncome]         = useState<number | null>(DEFAULTS.usIncomeUsd);
  const [indiaIncome, setIndiaIncome]   = useState<number | null>(DEFAULTS.indiaIncomeInr);
  const [filingStatus, setFilingStatus] = useState<FilingStatus>(DEFAULTS.filingStatus);
  const [applyStdDed, setApplyStdDed]   = useState<boolean>(DEFAULTS.applyStdDeduction);

  useEffect(() => { trackCalculatorUsed("dual-tax-residency"); }, []);

  const usdToInr = fxState.status === "ok" ? fxState.usdToInr : null;
  const canCompute = usIncome !== null && indiaIncome !== null && usdToInr !== null;

  const result = canCompute
    ? calcDualTaxResidency({
        usIncomeUsd: usIncome!,
        indiaIncomeInr: indiaIncome!,
        filingStatus,
        usdToInr: usdToInr!,
        applyUsStdDeduction: applyStdDed,
      })
    : null;

  const emptyReason =
    fxState.status === "loading" ? "Fetching exchange rates…" :
    fxState.status === "error"   ? fxState.message :
    "Enter income in both countries to see the rough dual-residency estimate.";

  return (
    <CalculatorShell
      title="Dual-Tax-Residency Estimator"
      description="Rough ballpark: how much tax might you owe in both the US and India, and does the Foreign Tax Credit likely prevent double-taxation? This is a starting-point illustration — not a tax computation."
      alertBanner={DISCLAIMER}
      inputs={
        <div className="space-y-4">
          <FxRateBadge fxState={fxState} />

          <CalcSelect
            id="filingStatus"
            label="US filing status"
            value={filingStatus}
            onChange={(v) => setFilingStatus(v as FilingStatus)}
            options={FILING_OPTIONS}
          />

          <CalcInput
            id="usIncome"
            label="US-source income"
            value={usIncome}
            onChange={setUsIncome}
            required
            prefix="$"
            min={0}
            step={10000}
            hint="Wages, business income, US dividends, etc. (ordinary income only — this estimator does not separate capital gains)."
          />

          <CalcInput
            id="indiaIncome"
            label="India-source income"
            value={indiaIncome}
            onChange={setIndiaIncome}
            required
            prefix="₹"
            min={0}
            step={100000}
            hint="Indian salary, rental, or business income in INR. Modelled using the new tax regime (FY 2024-25). NRIs are not eligible for the Section 87A rebate."
          />

          <div className="flex items-center gap-3 pt-1">
            <input
              id="stdDed"
              type="checkbox"
              checked={applyStdDed}
              onChange={(e) => setApplyStdDed(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <label htmlFor="stdDed" className="text-sm text-foreground cursor-pointer">
              Apply US standard deduction before bracket calculation
            </label>
          </div>
          <p className="text-xs text-muted-foreground -mt-2 pl-7">
            Single: $14,600 / MFJ: $29,200 ({RULE_YEAR}). Uncheck if itemizing or comparing gross-income figures.
          </p>

          <p className="text-xs text-muted-foreground border border-border/50 rounded-md px-3 py-2 bg-muted/30">
            <strong>What&apos;s NOT modelled:</strong> FEIE (Form 2555), FBAR/FATCA,
            self-employment tax (~15.3% on net SE income), state income taxes, AMT,
            capital gains rates, surcharges on high incomes, old-vs-new India regime,
            DTAA tiebreaker residency determination. Each of these can materially
            change the actual number.
          </p>

          <ResetButton onReset={() => {
            setUsIncome(DEFAULTS.usIncomeUsd);
            setIndiaIncome(DEFAULTS.indiaIncomeInr);
            setFilingStatus(DEFAULTS.filingStatus);
            setApplyStdDed(DEFAULTS.applyStdDeduction);
          }} />
        </div>
      }
      results={
        result === null ? (
          <CalcResults empty={emptyReason} />
        ) : (
          <div className="space-y-4">
            {/* FTC indicator banner */}
            <div
              className={`rounded-lg px-4 py-3 text-sm font-medium ${
                result.ftcLikelyCoversFully
                  ? "bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30"
                  : "bg-amber-50/40 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border border-amber-500/30"
              }`}
            >
              {result.ftcLikelyCoversFully
                ? "FTC likely covers double-taxation on India income (rough estimate)"
                : "Some double-taxation exposure possible — FTC may not fully offset US liability"}
              <p className="text-xs font-normal mt-1 opacity-80">
                This is an approximation. Actual FTC eligibility requires Form 1116 and professional analysis.
              </p>
            </div>

            <CalcResults
              headline={{
                label: "Rough total tax burden",
                value: fmtCurrency(result.totalEstimatedBurdenUsd),
              }}
              rows={[
                { label: "Worldwide income (rough)", value: fmtCurrency(result.totalWorldwideUsd), muted: true },
                { label: `  US income`, value: fmtCurrency(usIncome!), muted: true },
                { label: `  India income (at ₹${usdToInr?.toFixed(2)}/USD)`, value: fmtCurrency(result.indiaIncomeUsd), muted: true },
              ]}
            />

            <CalcResults
              headline={{ label: "India tax estimate", value: fmtINRCompact(result.roughIndiaTotalTaxInr) }}
              rows={[
                { label: "India income (new regime)", value: fmtINRCompact(indiaIncome!) },
                { label: "Income tax (bracket)", value: fmtINRCompact(result.roughIndiaTaxInr) },
                { label: "Cess (4%)", value: fmtINRCompact(result.roughIndiaCessInr), muted: true },
                { label: "India total tax in USD", value: fmtCurrency(result.roughIndiaTaxUsd) },
                { label: "India effective rate", value: fmtPct(result.roughIndiaEffectiveRatePct, 1), muted: true },
              ]}
            />

            <CalcResults
              headline={{ label: "US tax estimate (after FTC)", value: fmtCurrency(result.roughNetUsTaxUsd) }}
              rows={[
                { label: `US AGI (${applyStdDed ? "after std deduction" : "no std deduction"})`, value: fmtCurrency(result.usAgiUsd) },
                { label: "US tax on worldwide income (before FTC)", value: fmtCurrency(result.roughUsTaxBeforeFtcUsd) },
                { label: `US marginal bracket rate at this income`, value: fmtPct(result.roughUsMarginalRatePct, 0), muted: true },
                { label: "Estimated FTC (India tax ↔ US marginal cost)", value: "−" + fmtCurrency(result.estimatedFtcUsd), highlight: result.estimatedFtcUsd > 0 },
                { label: "Net US tax after FTC", value: fmtCurrency(result.roughNetUsTaxUsd), highlight: true },
              ]}
            />

            <CalcResults
              headline={{ label: "Rough combined effective rate", value: fmtPct(result.roughEffectiveRatePct, 1) }}
              rows={[
                { label: "Total estimated burden", value: fmtCurrency(result.totalEstimatedBurdenUsd) },
                { label: "On worldwide income of", value: fmtCurrency(result.totalWorldwideUsd), muted: true },
              ]}
            />

            <p className="text-xs text-muted-foreground leading-relaxed border border-amber-500/30 rounded-md px-3 py-2 bg-amber-50/20 dark:bg-amber-950/20">
              ⚠ Rough estimates only. All figures use simplified {RULE_YEAR} brackets
              without FEIE, SE tax, state taxes, surcharges, or capital-gains
              carve-outs. The actual number for your situation will differ.
              This output is a conversation-starter for your CPA — not a filing input.
            </p>
          </div>
        )
      }
      notes={`India tax: new regime slabs FY 2024-25. US tax: 2024 federal brackets (${filingStatus === "mfj" ? "MFJ" : "Single"}), ${applyStdDed ? "standard deduction applied" : "no standard deduction"}. FTC modelled as min(India tax in USD, US marginal rate × India income in USD) — this is an approximation of Form 1116 math. Does not include: state taxes, AMT, FEIE, self-employment tax, old India regime, treaty elections, surcharges. India-US DTAA (1990) may affect these figures significantly.`}
      ctaSlot={<NestMarginCTA />}
    />
  );
}
