"use client";

import { useState, useEffect } from "react";
import { CalculatorShell } from "./CalculatorShell";
import { CalcInput } from "./CalcInput";
import { CalcResults, ResetButton } from "./CalcResults";
import { calcLifestyleInflation } from "@/lib/calculators/lifestyle-inflation";
import { fmtCurrency, fmtPct } from "@/lib/calculators/format";
import { trackCalculatorUsed } from "./calcEvents";

const DEFAULTS = { raise: 5000, creepPct: 50, years: 20, returnRate: 7 };

export function LifestyleInflationCalculator() {
  const [raise, setRaise] = useState(DEFAULTS.raise);
  const [creepPct, setCreepPct] = useState(DEFAULTS.creepPct);
  const [years, setYears] = useState(DEFAULTS.years);
  const [returnRate, setReturnRate] = useState(DEFAULTS.returnRate);

  const result = calcLifestyleInflation({ raise, creepPct, years, returnRate });

  useEffect(() => {
    trackCalculatorUsed("lifestyle-inflation");
  }, []);

  return (
    <CalculatorShell
      title="Lifestyle Inflation"
      description="Your raise is real — but how much of it quietly disappears into a higher lifestyle? This calculator shows what lifestyle creep actually costs, compounded over your investing years."
      inputs={
        <div className="space-y-4">
          <CalcInput id="raise" label="Annual raise amount" value={raise} onChange={setRaise} prefix="$" min={0} step={500} />
          <CalcInput id="creep" label="Lifestyle creep — % of raise spent on higher living" value={creepPct} onChange={setCreepPct} suffix="%" min={0} max={100} step={5} hint="0% = bank the whole raise. 100% = none of it is saved." />
          <CalcInput id="return" label="Expected annual investment return" value={returnRate} onChange={setReturnRate} suffix="%" min={0} max={30} step={0.5} />
          <CalcInput id="years" label="Years to invest" value={years} onChange={setYears} suffix="yr" min={1} max={60} />
          <ResetButton onReset={() => { setRaise(DEFAULTS.raise); setCreepPct(DEFAULTS.creepPct); setYears(DEFAULTS.years); setReturnRate(DEFAULTS.returnRate); }} />
        </div>
      }
      results={
        <CalcResults
          headline={{ label: "Opportunity cost of lifestyle creep", value: fmtCurrency(result.opportunityCost) }}
          rows={[
            { label: "Raise absorbed by lifestyle", value: fmtCurrency(result.creepAmount) + "/yr" },
            { label: "Raise actually saved", value: fmtCurrency(result.bankAmount) + "/yr", highlight: true },
            { label: "Total spent on lifestyle (" + years + " yr)", value: fmtCurrency(result.totalCreepSpend) },
            { label: "Portfolio if full raise invested", value: fmtCurrency(result.bankScenarioFV), highlight: true },
            { label: "Portfolio with " + creepPct + "% creep", value: fmtCurrency(result.creepScenarioFV) },
            { label: "Lost to creep (compounded)", value: fmtCurrency(result.opportunityCost), highlight: true },
          ]}
        />
      }
      notes={`Assumes the raise is invested at the start of each year (ordinary annuity). Investment return is nominal; adjust for inflation to see real purchasing power. Creep % applies uniformly — real creep is usually higher in year 1.`}
    />
  );
}
