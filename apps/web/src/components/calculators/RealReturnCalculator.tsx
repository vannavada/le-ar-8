"use client";

// Field classification:
//   nominalReturn — optional (blank = 0%: valid e.g. cash/money-market scenario)
//   inflationRate — optional (blank = 0%: no-inflation scenario)
//   taxRate       — optional (blank = 0%: Roth IRA / tax-advantaged account)
//
// All three fields are rate adjustments where 0% is financially meaningful.
// This calculator always shows a result — no required fields.

import { useState, useEffect } from "react";
import { CalculatorShell } from "./CalculatorShell";
import { CalcInput } from "./CalcInput";
import { CalcResults, ResetButton } from "./CalcResults";
import { calcRealReturn } from "@/lib/calculators/real-return";
import { fmtPct } from "@/lib/calculators/format";
import { trackCalculatorUsed } from "./calcEvents";

const DEFAULTS = { nominalReturn: 10, inflationRate: 3, taxRate: 22 };

export function RealReturnCalculator() {
  const [nominalReturn, setNominalReturn] = useState<number | null>(DEFAULTS.nominalReturn);
  const [inflationRate, setInflationRate] = useState<number | null>(DEFAULTS.inflationRate);
  const [taxRate, setTaxRate] = useState<number | null>(DEFAULTS.taxRate);

  // All fields optional — always compute (blank treated as 0)
  const result = calcRealReturn({
    nominalReturn: nominalReturn ?? 0,
    inflationRate: inflationRate ?? 0,
    taxRate: taxRate ?? 0,
  });

  useEffect(() => {
    trackCalculatorUsed("real-return");
  }, []);

  const isPositive = result.realReturn >= 0;
  const nominalDisplay = nominalReturn ?? 0;
  const taxDisplay = taxRate ?? 0;
  const inflationDisplay = inflationRate ?? 0;

  return (
    <CalculatorShell
      title="Real Return"
      description="Your brokerage account shows 10%. But after taxes, after inflation — what did you actually earn in purchasing power? The gap between nominal and real is where most investors lose ground without realising it."
      inputs={
        <div className="space-y-4">
          <CalcInput id="nominal" label="Nominal investment return" value={nominalReturn} onChange={setNominalReturn} suffix="%" min={-10} max={50} step={0.5} />
          <CalcInput id="inflation" label="Inflation rate" value={inflationRate} onChange={setInflationRate} suffix="%" min={0} max={20} step={0.25} />
          <CalcInput
            id="tax"
            label="Your effective tax rate on gains"
            value={taxRate}
            onChange={setTaxRate}
            suffix="%"
            min={0}
            max={60}
            step={1}
            hint="Enter your own rate. This calculator does not compute your tax — that depends on your situation, account type, and jurisdiction."
          />
          <ResetButton onReset={() => { setNominalReturn(DEFAULTS.nominalReturn); setInflationRate(DEFAULTS.inflationRate); setTaxRate(DEFAULTS.taxRate); }} />
        </div>
      }
      results={
        <CalcResults
          headline={{
            label: "Real after-tax return",
            value: fmtPct(result.realReturn),
          }}
          rows={[
            { label: "Nominal return (gross)", value: fmtPct(nominalDisplay) },
            { label: `Tax drag (${taxDisplay}% rate applied to nominal gain)`, value: "−" + fmtPct(result.taxDrag), muted: !result.taxDrag },
            { label: "After-tax nominal return", value: fmtPct(result.afterTaxNominal) },
            { label: "Inflation adjustment (Fisher equation)", value: "−" + fmtPct(inflationDisplay) + " (approx)", muted: true },
            {
              label: isPositive ? "Real purchasing-power gain" : "Real purchasing-power LOSS",
              value: fmtPct(result.realReturn),
              highlight: true,
            },
          ]}
        />
      }
      notes={`Real return = (1 + after-tax nominal%) ÷ (1 + inflation%) − 1, using the Fisher equation (more accurate than simple subtraction at higher rates). Tax rate is user-entered — this calculator applies it as a flat rate on nominal returns. Your actual tax depends on account type (taxable vs. tax-advantaged), holding period, jurisdiction, and individual circumstances. Not tax advice.`}
    />
  );
}
