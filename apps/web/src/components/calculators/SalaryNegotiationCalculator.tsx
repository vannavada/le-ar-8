"use client";

// Field classification:
//   raise            — REQUIRED (subject of the calculation)
//   yearsRemaining   — REQUIRED (career horizon; 0 is meaningless)
//   salaryGrowth     — optional (blank = 0%: flat salary is a valid baseline)
//   investmentReturn — optional (blank = 0%: "just the cash value" is a valid comparison)

import { useState, useEffect } from "react";
import { CalculatorShell } from "./CalculatorShell";
import { CalcInput } from "./CalcInput";
import { CalcResults, ResetButton } from "./CalcResults";
import { calcSalaryNegotiation } from "@/lib/calculators/salary-negotiation";
import { fmtCurrency } from "@/lib/calculators/format";
import { trackCalculatorUsed } from "./calcEvents";

const DEFAULTS = { raise: 5000, yearsRemaining: 25, salaryGrowth: 3, investmentReturn: 7 };

export function SalaryNegotiationCalculator() {
  const [raise, setRaise] = useState<number | null>(DEFAULTS.raise);
  const [yearsRemaining, setYearsRemaining] = useState<number | null>(DEFAULTS.yearsRemaining);
  const [salaryGrowth, setSalaryGrowth] = useState<number | null>(DEFAULTS.salaryGrowth);
  const [investmentReturn, setInvestmentReturn] = useState<number | null>(DEFAULTS.investmentReturn);

  const canCompute = raise !== null && yearsRemaining !== null;
  const result = canCompute
    ? calcSalaryNegotiation({
        raise: raise!,
        yearsRemaining: yearsRemaining!,
        salaryGrowth: salaryGrowth ?? 0,
        investmentReturn: investmentReturn ?? 0,
      })
    : null;

  useEffect(() => {
    trackCalculatorUsed("salary-negotiation");
  }, []);

  return (
    <CalculatorShell
      title="Lifetime Value of a Raise"
      description="A raise doesn't just affect this year. Every future raise you receive is calculated off your higher base — and the extra take-home can compound for decades. That awkward negotiation conversation is worth far more than the number on the offer letter."
      inputs={
        <div className="space-y-4">
          <CalcInput id="raise" label="Negotiated raise" value={raise} onChange={setRaise} required prefix="$" min={0} step={500} />
          <CalcInput id="years" label="Career years remaining" value={yearsRemaining} onChange={setYearsRemaining} required suffix="yr" min={1} max={50} />
          <CalcInput id="growth" label="Annual salary growth rate" value={salaryGrowth} onChange={setSalaryGrowth} suffix="%" min={0} max={20} step={0.5} hint="Typical: 2–5%. Future raises will apply to the higher base." />
          <CalcInput id="return" label="Investment return (if extra is saved)" value={investmentReturn} onChange={setInvestmentReturn} suffix="%" min={0} max={30} step={0.5} />
          <ResetButton onReset={() => { setRaise(DEFAULTS.raise); setYearsRemaining(DEFAULTS.yearsRemaining); setSalaryGrowth(DEFAULTS.salaryGrowth); setInvestmentReturn(DEFAULTS.investmentReturn); }} />
        </div>
      }
      results={
        result === null ? (
          <CalcResults empty="Enter your raise and career years remaining to see the lifetime value." />
        ) : (
          <CalcResults
            headline={{ label: "Lifetime value if extra is invested", value: fmtCurrency(result.investedFV) }}
            rows={[
              { label: "Raise year 1", value: fmtCurrency(result.firstYearExtra) },
              { label: `Raise in year ${yearsRemaining!} (compounded salary growth)`, value: fmtCurrency(result.finalYearExtra) },
              { label: "Total extra earned over career (not invested)", value: fmtCurrency(result.totalExtraEarned) },
              { label: "Lifetime value (each year's extra invested)", value: fmtCurrency(result.investedFV), highlight: true },
            ]}
          />
        )
      }
      notes={`Assumes salary growth rate compounds future raises off the higher base. The invested FV uses a growing annuity formula: each year's extra earnings (raise × (1+g)^k) are invested at the investment return. This is a career-level estimate — individual years will vary. Does not account for tax, benefits changes, or job changes.`}
    />
  );
}
