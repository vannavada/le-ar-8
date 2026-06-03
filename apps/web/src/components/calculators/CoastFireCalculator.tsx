"use client";

// Field classification:
//   currentPortfolio — optional (blank = $0: "starting from scratch" is valid)
//   expectedReturn   — optional (blank = 0%: worst-case coast = full target now)
//   targetNumber     — REQUIRED (can't define coast without a retirement goal)
//   currentAge       — REQUIRED (needed for years-to-retirement calculation)
//   retirementAge    — REQUIRED (needed for years-to-retirement calculation)

import { useState, useEffect } from "react";
import { CalculatorShell } from "./CalculatorShell";
import { CalcInput } from "./CalcInput";
import { CalcResults, ResetButton } from "./CalcResults";
import { calcCoastFire } from "@/lib/calculators/coast-fire";
import { fmtCurrency } from "@/lib/calculators/format";
import { trackCalculatorUsed } from "./calcEvents";

const DEFAULTS = {
  currentPortfolio: 100000,
  expectedReturn: 7,
  currentAge: 35,
  retirementAge: 65,
  targetNumber: 1000000,
};

export function CoastFireCalculator() {
  const [currentPortfolio, setCurrentPortfolio] = useState<number | null>(DEFAULTS.currentPortfolio);
  const [expectedReturn, setExpectedReturn] = useState<number | null>(DEFAULTS.expectedReturn);
  const [currentAge, setCurrentAge] = useState<number | null>(DEFAULTS.currentAge);
  const [retirementAge, setRetirementAge] = useState<number | null>(DEFAULTS.retirementAge);
  const [targetNumber, setTargetNumber] = useState<number | null>(DEFAULTS.targetNumber);

  const canCompute = targetNumber !== null && currentAge !== null && retirementAge !== null;
  const result = canCompute
    ? calcCoastFire({
        currentPortfolio: currentPortfolio ?? 0,
        expectedReturn: expectedReturn ?? 0,
        currentAge: currentAge!,
        retirementAge: retirementAge!,
        targetNumber: targetNumber!,
      })
    : null;

  useEffect(() => {
    trackCalculatorUsed("coast-fire");
  }, []);

  const yearsToRetirement = canCompute ? Math.max(0, retirementAge! - currentAge!) : null;

  return (
    <CalculatorShell
      title="Coast-FIRE Number"
      description="Coast-FIRE is the point where you have enough invested that — even if you never contribute another dollar — it will compound to your retirement target on its own. Have you already coasted?"
      inputs={
        <div className="space-y-4">
          <CalcInput id="portfolio" label="Current invested portfolio" value={currentPortfolio} onChange={setCurrentPortfolio} prefix="$" min={0} step={10000} />
          <CalcInput id="target" label="Retirement portfolio target" value={targetNumber} onChange={setTargetNumber} required prefix="$" min={0} step={50000} />
          <CalcInput id="currentAge" label="Current age" value={currentAge} onChange={setCurrentAge} required suffix="yr" min={18} max={80} />
          <CalcInput id="retirementAge" label="Retirement age" value={retirementAge} onChange={setRetirementAge} required suffix="yr" min={18} max={90} />
          <CalcInput id="return" label="Expected annual return" value={expectedReturn} onChange={setExpectedReturn} suffix="%" min={0} max={20} step={0.5} />
          <ResetButton onReset={() => { setCurrentPortfolio(DEFAULTS.currentPortfolio); setExpectedReturn(DEFAULTS.expectedReturn); setCurrentAge(DEFAULTS.currentAge); setRetirementAge(DEFAULTS.retirementAge); setTargetNumber(DEFAULTS.targetNumber); }} />
        </div>
      }
      results={
        result === null ? (
          <CalcResults empty="Enter your retirement target, current age, and retirement age to see your coast number." />
        ) : (
          <CalcResults
            headline={{
              label: result.hasCoasted ? "You have coasted! 🎉" : "Your coast number",
              value: fmtCurrency(result.coastNumber),
            }}
            rows={[
              {
                label: result.hasCoasted ? "Surplus above coast number" : "Gap to coast number",
                value: fmtCurrency(Math.abs(result.surplus)),
                highlight: true,
              },
              {
                label: `Projected portfolio at ${retirementAge!} (no contributions)`,
                value: fmtCurrency(result.projectedValueAtRetirement),
              },
              {
                label: "Target at retirement",
                value: fmtCurrency(targetNumber!),
                muted: true,
              },
              ...(!result.hasCoasted && result.coastAge != null
                ? [{ label: "Projected coast age (at current trajectory)", value: `~${result.coastAge.toFixed(0)}`, highlight: true }]
                : []),
              {
                label: "Years to retirement",
                value: `${yearsToRetirement} yr`,
                muted: true,
              },
            ]}
          />
        )
      }
      notes={`Coast number = the lump sum needed today to grow to your target with no further contributions. Formula: target ÷ (1 + return)^years. Does not account for inflation (use a real return rate for inflation-adjusted results) or sequence-of-returns risk.`}
    />
  );
}
