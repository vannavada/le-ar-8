"use client";

// Field classification:
//   usSalaryUsd  — REQUIRED (subject of the calculation)
//   colRatio     — optional (blank = default 0.35: India ~35% of US COL)
//   usSavingsUsd — optional (blank = null: savings runway section hidden)
//   usdToInr     — from FX API (not user-editable)

import { useState, useEffect } from "react";
import { CalculatorShell } from "./CalculatorShell";
import { CalcInput } from "./CalcInput";
import { CalcResults, ResetButton } from "./CalcResults";
import { FxRateBadge } from "./FxRateBadge";
import { useFxRates } from "@/lib/calculators/fx-client";
import { calcMovingBack } from "@/lib/calculators/moving-back";
import { fmtCurrency, fmtINRCompact, fmtYears } from "@/lib/calculators/format";
import { NestMarginCTA } from "@/components/affiliate/NestMarginCTA";
import { trackCalculatorUsed } from "./calcEvents";

const DEFAULTS = {
  usSalaryUsd: 120000,
  colRatio: 0.35,   // India ~35% of US for comparable lifestyle (Numbeo rough midpoint)
  usSavingsUsd: null as number | null,
};

export function MovingBackCalculator() {
  const fxState = useFxRates();

  const [usSalary, setUsSalary]   = useState<number | null>(DEFAULTS.usSalaryUsd);
  const [colRatio, setColRatio]   = useState<number | null>(DEFAULTS.colRatio);
  const [usSavings, setUsSavings] = useState<number | null>(DEFAULTS.usSavingsUsd);

  useEffect(() => { trackCalculatorUsed("moving-back"); }, []);

  const usdToInr = fxState.status === "ok" ? fxState.usdToInr : null;
  const canCompute = usSalary !== null && usdToInr !== null;

  const result = canCompute
    ? calcMovingBack({
        usSalaryUsd: usSalary!,
        usdToInr: usdToInr!,
        colRatio: colRatio ?? 0.35,
        usSavingsUsd: usSavings,
      })
    : null;

  const emptyReason =
    fxState.status === "loading" ? "Fetching exchange rates…" :
    fxState.status === "error"   ? fxState.message :
    "Enter your US salary to see the India equivalent.";

  const colDisplay = (colRatio ?? 0.35) * 100;

  return (
    <CalculatorShell
      title="Cost of Moving Back to India"
      description="What is your US salary or savings actually worth in India? This calculator adjusts for cost-of-living differences so you can see the real purchasing-power picture."
      inputs={
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground border border-border/50 rounded-md px-3 py-2 bg-muted/30">
            <span className="font-medium">Estimate.</span> COL ratio is a broad approximation — your city pair and lifestyle matter. Not financial advice.
          </p>

          <FxRateBadge fxState={fxState} />

          <CalcInput id="salary" label="Annual US salary (or annual spend)" value={usSalary} onChange={setUsSalary} required prefix="$" min={0} step={5000} />
          <CalcInput
            id="col"
            label="India cost-of-living ratio"
            value={colRatio}
            onChange={setColRatio}
            suffix="× US"
            min={0.1}
            max={1.5}
            step={0.05}
            hint="Fraction of US spend for equal lifestyle. 0.35 = India costs ~35% of US. Adjust for your city pair (Numbeo, Expatistan)."
          />
          <CalcInput id="savings" label="US savings to move (optional)" value={usSavings} onChange={setUsSavings} prefix="$" min={0} step={10000} hint="If you move a lump sum, we'll show how long it sustains your Indian lifestyle." />

          <ResetButton onReset={() => {
            setUsSalary(DEFAULTS.usSalaryUsd);
            setColRatio(DEFAULTS.colRatio);
            setUsSavings(DEFAULTS.usSavingsUsd);
          }} />
        </div>
      }
      results={
        result === null ? (
          <CalcResults empty={emptyReason} />
        ) : (
          <CalcResults
            headline={{
              label: "Monthly India budget for same lifestyle",
              value: fmtINRCompact(result.equivalentIndiaMonthlyBudgetInr) + "/mo",
            }}
            rows={[
              { label: "US salary", value: fmtCurrency(usSalary!) + "/yr" },
              { label: "Direct FX equivalent (no COL adj.)", value: fmtINRCompact(result.salaryInrDirect) + "/yr", muted: true },
              { label: `Equivalent India annual cost (${colDisplay.toFixed(0)}% COL ratio)`, value: fmtINRCompact(result.equivalentIndiaAnnualCostInr) + "/yr" },
              { label: "Equivalent India monthly budget", value: fmtINRCompact(result.equivalentIndiaMonthlyBudgetInr) + "/mo", highlight: true },
              { label: "Purchasing power multiple", value: result.purchasingPowerMultiple.toFixed(2) + "×", highlight: true },
              { label: "Annual 'saving' vs. US lifestyle", value: fmtCurrency(result.annualSavingByMovingUsd) + "/yr", muted: false },
              ...(result.savingsInInr !== null
                ? [
                    { label: "Savings converted to INR", value: fmtINRCompact(result.savingsInInr) },
                    { label: "Savings runway at Indian lifestyle", value: fmtYears(result.savingsRunwayYears!), highlight: true },
                  ]
                : []),
            ]}
          />
        )
      }
      notes={`COL ratio is a single number standing in for a complex reality — Bangalore or Mumbai will be closer to 0.4–0.5 vs. US; a tier-2 city may be 0.2–0.3. Numbeo and Expatistan publish city-pair comparisons. The purchasing-power multiple is 1 ÷ COL ratio. The "annual saving" assumes you keep earning your US salary from India (remote work / freelance) and spend at Indian prices — it is not a passive income figure. Savings runway assumes static spending at the equivalent Indian lifestyle cost with no investment return on the principal.`}
      ctaSlot={<NestMarginCTA />}
    />
  );
}
