"use client";

// Field classification:
//   cost       — REQUIRED (subject of the calculation)
//   period     — select (not a number field)
//   returnRate — optional (blank = 0%: shows nominal cost without compounding)
//   years      — REQUIRED (time horizon; 0 is meaningless)

import { useState, useEffect } from "react";
import { CalculatorShell } from "./CalculatorShell";
import { CalcInput, CalcSelect } from "./CalcInput";
import { CalcResults, ResetButton } from "./CalcResults";
import { calcSubscriptionCost, type SubscriptionPeriod } from "@/lib/calculators/subscription-cost";
import { fmtCurrency } from "@/lib/calculators/format";
import { trackCalculatorUsed } from "./calcEvents";

const DEFAULTS = { cost: 15, period: "monthly" as SubscriptionPeriod, returnRate: 7, years: 20 };

export function SubscriptionCostCalculator() {
  const [cost, setCost] = useState<number | null>(DEFAULTS.cost);
  const [period, setPeriod] = useState<SubscriptionPeriod>(DEFAULTS.period);
  const [returnRate, setReturnRate] = useState<number | null>(DEFAULTS.returnRate);
  const [years, setYears] = useState<number | null>(DEFAULTS.years);

  const canCompute = cost !== null && years !== null;
  const result = canCompute
    ? calcSubscriptionCost({ cost: cost!, period, returnRate: returnRate ?? 0, years: years! })
    : null;

  useEffect(() => {
    trackCalculatorUsed("subscription-cost");
  }, []);

  return (
    <CalculatorShell
      title="True Cost of a Subscription"
      description="Monthly charges feel small. Over decades, compounded against what you could have earned, they're not. Enter any recurring cost — streaming, SaaS, gym, anything — and see what it's really worth."
      inputs={
        <div className="space-y-4">
          <CalcInput id="cost" label="Subscription cost" value={cost} onChange={setCost} required prefix="$" min={0} step={1} />
          <CalcSelect id="period" label="Billing period" value={period} onChange={setPeriod}
            options={[{ value: "monthly", label: "Monthly" }, { value: "annual", label: "Annual" }]} />
          <CalcInput id="return" label="Expected annual investment return" value={returnRate} onChange={setReturnRate} suffix="%" min={0} max={30} step={0.5} />
          <CalcInput id="years" label="Years" value={years} onChange={setYears} required suffix="yr" min={1} max={60} />
          <ResetButton onReset={() => { setCost(DEFAULTS.cost); setPeriod(DEFAULTS.period); setReturnRate(DEFAULTS.returnRate); setYears(DEFAULTS.years); }} />
        </div>
      }
      results={
        result === null ? (
          <CalcResults empty="Enter your subscription cost and time horizon to see the true cost." />
        ) : (
          <CalcResults
            headline={{ label: `True cost over ${years!} years (invested)`, value: fmtCurrency(result.opportunityCost) }}
            rows={[
              { label: "Annual cost", value: fmtCurrency(result.annualCost) },
              { label: "Daily cost", value: "$" + result.costPerDay.toFixed(2) },
              { label: `Total paid (${years!} yr, no investing)`, value: fmtCurrency(result.totalPaid) },
              { label: `Opportunity cost (invested at ${returnRate ?? 0}%)`, value: fmtCurrency(result.opportunityCost), highlight: true },
              { label: "Multiplier vs. total paid", value: (result.opportunityCost / (result.totalPaid || 1)).toFixed(1) + "×" },
            ]}
          />
        )
      }
      notes="Assumes the subscription cost is paid annually and the equivalent is invested at the start of each year. Return is nominal; does not account for inflation or taxes on investment gains."
    />
  );
}
