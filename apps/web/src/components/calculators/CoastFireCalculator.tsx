"use client";

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
  const [currentPortfolio, setCurrentPortfolio] = useState(DEFAULTS.currentPortfolio);
  const [expectedReturn, setExpectedReturn] = useState(DEFAULTS.expectedReturn);
  const [currentAge, setCurrentAge] = useState(DEFAULTS.currentAge);
  const [retirementAge, setRetirementAge] = useState(DEFAULTS.retirementAge);
  const [targetNumber, setTargetNumber] = useState(DEFAULTS.targetNumber);

  const result = calcCoastFire({ currentPortfolio, expectedReturn, currentAge, retirementAge, targetNumber });

  useEffect(() => {
    trackCalculatorUsed("coast-fire");
  }, []);

  const yearsToRetirement = Math.max(0, retirementAge - currentAge);

  return (
    <CalculatorShell
      title="Coast-FIRE Number"
      description="Coast-FIRE is the point where you have enough invested that — even if you never contribute another dollar — it will compound to your retirement target on its own. Have you already coasted?"
      inputs={
        <div className="space-y-4">
          <CalcInput id="portfolio" label="Current invested portfolio" value={currentPortfolio} onChange={setCurrentPortfolio} prefix="$" min={0} step={10000} />
          <CalcInput id="target" label="Retirement portfolio target" value={targetNumber} onChange={setTargetNumber} prefix="$" min={0} step={50000} />
          <CalcInput id="currentAge" label="Current age" value={currentAge} onChange={setCurrentAge} suffix="yr" min={18} max={80} />
          <CalcInput id="retirementAge" label="Retirement age" value={retirementAge} onChange={setRetirementAge} suffix="yr" min={currentAge + 1} max={90} />
          <CalcInput id="return" label="Expected annual return" value={expectedReturn} onChange={setExpectedReturn} suffix="%" min={1} max={20} step={0.5} />
          <ResetButton onReset={() => { setCurrentPortfolio(DEFAULTS.currentPortfolio); setExpectedReturn(DEFAULTS.expectedReturn); setCurrentAge(DEFAULTS.currentAge); setRetirementAge(DEFAULTS.retirementAge); setTargetNumber(DEFAULTS.targetNumber); }} />
        </div>
      }
      results={
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
              label: `Projected portfolio at ${retirementAge} (no contributions)`,
              value: fmtCurrency(result.projectedValueAtRetirement),
            },
            {
              label: "Target at retirement",
              value: fmtCurrency(targetNumber),
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
      }
      notes={`Coast number = the lump sum needed today to grow to your target with no further contributions. Formula: target ÷ (1 + return)^years. Does not account for inflation (use a real return rate for inflation-adjusted results) or sequence-of-returns risk.`}
    />
  );
}
