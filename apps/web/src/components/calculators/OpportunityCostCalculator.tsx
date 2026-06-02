"use client";

import { useState, useEffect } from "react";
import { CalculatorShell } from "./CalculatorShell";
import { CalcInput } from "./CalcInput";
import { CalcResults, ResetButton } from "./CalcResults";
import { calcOpportunityCost } from "@/lib/calculators/opportunity-cost";
import { fmtCurrency } from "@/lib/calculators/format";
import { trackCalculatorUsed } from "./calcEvents";

const DEFAULTS = { amount: 1000, returnRate: 7, years: 20 };

export function OpportunityCostCalculator() {
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [returnRate, setReturnRate] = useState(DEFAULTS.returnRate);
  const [years, setYears] = useState(DEFAULTS.years);

  const result = calcOpportunityCost({ amount, returnRate, years });

  useEffect(() => {
    trackCalculatorUsed("opportunity-cost");
  }, []);

  return (
    <CalculatorShell
      title="Opportunity Cost of a Purchase"
      description="Every dollar you spend today is a dollar that can't compound. This isn't an argument against spending — it's a tool for making spending deliberate. What does that purchase actually cost in future money?"
      inputs={
        <div className="space-y-4">
          <CalcInput id="amount" label="Purchase amount" value={amount} onChange={setAmount} prefix="$" min={0} step={100} />
          <CalcInput id="return" label="Expected annual investment return" value={returnRate} onChange={setReturnRate} suffix="%" min={0} max={30} step={0.5} />
          <CalcInput id="years" label="Time horizon" value={years} onChange={setYears} suffix="yr" min={1} max={60} />
          <ResetButton onReset={() => { setAmount(DEFAULTS.amount); setReturnRate(DEFAULTS.returnRate); setYears(DEFAULTS.years); }} />
        </div>
      }
      results={
        <CalcResults
          headline={{ label: `${amount > 0 ? fmtCurrency(amount) : "This purchase"} in ${years} years`, value: fmtCurrency(result.futureValue) }}
          rows={[
            { label: "Purchase price today", value: fmtCurrency(amount) },
            { label: "Future value if invested", value: fmtCurrency(result.futureValue), highlight: true },
            { label: "Growth (opportunity forfeited)", value: fmtCurrency(result.gain) },
            { label: "Multiplier", value: (result.futureValue / (amount || 1)).toFixed(1) + "×" },
            { label: `Rule of 72 (doubles every)`, value: isFinite(result.doubleTime) ? result.doubleTime.toFixed(1) + " yr" : "—", muted: true },
          ]}
        />
      }
      notes="Assumes a one-time lump-sum investment at the nominal return rate. Does not account for inflation, taxes on gains, or ongoing portfolio fees. Use after-tax return to see real purchasing-power impact."
    />
  );
}
