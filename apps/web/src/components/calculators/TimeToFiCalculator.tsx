"use client";

import { useState, useEffect } from "react";
import { CalculatorShell } from "./CalculatorShell";
import { CalcInput } from "./CalcInput";
import { CalcResults, ResetButton } from "./CalcResults";
import { calcTimeToFi } from "@/lib/calculators/time-to-fi";
import { fmtCurrency, fmtYears, fmtPct } from "@/lib/calculators/format";
import { trackCalculatorUsed } from "./calcEvents";

const DEFAULTS = { income: 100000, savingsRate: 30, expectedReturn: 7, withdrawalRate: 4 };

export function TimeToFiCalculator() {
  const [income, setIncome] = useState(DEFAULTS.income);
  const [savingsRate, setSavingsRate] = useState(DEFAULTS.savingsRate);
  const [expectedReturn, setExpectedReturn] = useState(DEFAULTS.expectedReturn);
  const [withdrawalRate, setWithdrawalRate] = useState(DEFAULTS.withdrawalRate);

  const result = calcTimeToFi({ income, savingsRate, expectedReturn, withdrawalRate });

  useEffect(() => {
    trackCalculatorUsed("time-to-fi");
  }, []);

  return (
    <CalculatorShell
      title="Time to Financial Independence"
      description="The single most powerful lever in your FI timeline isn't your investment return — it's your savings rate. This calculator runs the real FIRE math: how long until your portfolio can sustain your lifestyle indefinitely?"
      inputs={
        <div className="space-y-4">
          <CalcInput id="income" label="Annual gross income" value={income} onChange={setIncome} prefix="$" min={0} step={5000} />
          <CalcInput id="savings" label="Savings rate" value={savingsRate} onChange={setSavingsRate} suffix="%" min={1} max={99} step={1} hint="The most important number here. Try moving it — watch the years drop." />
          <CalcInput id="return" label="Expected annual investment return" value={expectedReturn} onChange={setExpectedReturn} suffix="%" min={1} max={20} step={0.5} hint="Use a real (after-inflation) return for inflation-adjusted results." />
          <CalcInput id="withdrawal" label="Safe withdrawal rate" value={withdrawalRate} onChange={setWithdrawalRate} suffix="%" min={1} max={10} step={0.25} hint="4% = 25× expenses. Lower = more conservative." />
          <ResetButton onReset={() => { setIncome(DEFAULTS.income); setSavingsRate(DEFAULTS.savingsRate); setExpectedReturn(DEFAULTS.expectedReturn); setWithdrawalRate(DEFAULTS.withdrawalRate); }} />
        </div>
      }
      results={
        <CalcResults
          headline={{
            label: "Years to financial independence",
            value: isFinite(result.yearsToFi) ? fmtYears(result.yearsToFi) : "Save more",
          }}
          rows={[
            { label: "Annual savings", value: fmtCurrency(result.annualSavings), highlight: true },
            { label: "Annual expenses (lifestyle to sustain)", value: fmtCurrency(result.annualExpenses) },
            { label: `FI target (${result.savingsMultiple.toFixed(0)}× annual expenses)`, value: fmtCurrency(result.targetPortfolio), highlight: true },
            { label: "Expense ratio (1 − savings rate)", value: fmtPct(result.expenseRatio * 100, 0) },
          ]}
        />
      }
      notes={`FI target = annual expenses ÷ withdrawal rate (the "4% rule" = 25× expenses). Years calculated using the future-value-of-annuity formula. Classic result: 50% savings rate → ~17 years at 5% real return (Shockingly Simple Math). Assumes no starting portfolio, constant income, and steady returns — reality is lumpier.`}
    />
  );
}
