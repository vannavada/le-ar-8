"use client";

// Field classification:
//   propertyPriceInr         — REQUIRED (subject of comparison)
//   years                    — REQUIRED (time horizon)
//   rentalYieldPct           — optional (blank = 0%: appreciation-only scenario)
//   propertyAppreciationPct  — optional (blank = 0%: flat-value scenario)
//   repatriationFrictionPct  — optional (blank = 0%: no friction scenario)
//   usReturnPct              — optional (blank = 0%: cash comparison)
//   usdToInr                 — from FX API (not user-editable)

import { useState, useEffect } from "react";
import { CalculatorShell } from "./CalculatorShell";
import { CalcInput } from "./CalcInput";
import { CalcResults, ResetButton } from "./CalcResults";
import { FxRateBadge } from "./FxRateBadge";
import { useFxRates } from "@/lib/calculators/fx-client";
import { calcCrossBorderProperty } from "@/lib/calculators/crossborder-property";
import { fmtCurrency, fmtINRCompact, fmtPct } from "@/lib/calculators/format";
import { NestMarginCTA } from "@/components/affiliate/NestMarginCTA";
import { trackCalculatorUsed } from "./calcEvents";

const DEFAULTS = {
  propertyPriceInr: 10_000_000,   // ₹1 crore (~$119K at 84)
  rentalYieldPct: 3.5,
  propertyAppreciationPct: 5,
  repatriationFrictionPct: 5,     // TDS + FEMA + conversion (~5–10% is realistic)
  usReturnPct: 7,
  years: 10,
};

export function CrossBorderPropertyCalculator() {
  const fxState = useFxRates();

  const [propertyPriceInr, setPropertyPriceInr] = useState<number | null>(DEFAULTS.propertyPriceInr);
  const [rentalYield, setRentalYield]       = useState<number | null>(DEFAULTS.rentalYieldPct);
  const [appreciation, setAppreciation]     = useState<number | null>(DEFAULTS.propertyAppreciationPct);
  const [friction, setFriction]             = useState<number | null>(DEFAULTS.repatriationFrictionPct);
  const [usReturn, setUsReturn]             = useState<number | null>(DEFAULTS.usReturnPct);
  const [years, setYears]                   = useState<number | null>(DEFAULTS.years);

  useEffect(() => { trackCalculatorUsed("crossborder-property"); }, []);

  const usdToInr = fxState.status === "ok" ? fxState.usdToInr : null;
  const canCompute = propertyPriceInr !== null && years !== null && usdToInr !== null;

  const result = canCompute
    ? calcCrossBorderProperty({
        propertyPriceInr: propertyPriceInr!,
        usdToInr: usdToInr!,
        rentalYieldPct: rentalYield ?? 0,
        propertyAppreciationPct: appreciation ?? 0,
        repatriationFrictionPct: friction ?? 0,
        usReturnPct: usReturn ?? 0,
        years: years!,
      })
    : null;

  const winnerLabel =
    result?.winner === "india" ? "India property" :
    result?.winner === "us"    ? "US investment"  : "Tie";

  const emptyReason =
    fxState.status === "loading" ? "Fetching exchange rates…" :
    fxState.status === "error"   ? fxState.message :
    "Enter a property price and time horizon to see the comparison.";

  return (
    <CalculatorShell
      title="Buy Property in India vs. Invest in the US"
      description="Should you buy that flat in India or invest the equivalent USD in the US market? Compare total returns after appreciation, rental income, repatriation costs, and FX conversion."
      inputs={
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground border border-border/50 rounded-md px-3 py-2 bg-muted/30">
            <span className="font-medium">Estimate.</span> Simplified model — no rental tax, no maintenance costs, no vacancy. Not financial advice.
          </p>

          <FxRateBadge fxState={fxState} />

          <CalcInput id="price" label="Property price" value={propertyPriceInr} onChange={setPropertyPriceInr} required prefix="₹" min={0} step={500000} hint="Enter in INR. ₹1 crore = ₹10,000,000." />
          <CalcInput id="years" label="Holding period" value={years} onChange={setYears} required suffix="yr" min={1} max={30} />

          <div className="pt-1 pb-0.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">India property assumptions</div>
          <CalcInput id="yield" label="Annual gross rental yield" value={rentalYield} onChange={setRentalYield} suffix="%" min={0} max={15} step={0.25} hint="Typical Indian residential yield: 2–4%. Commercial: 6–9%." />
          <CalcInput id="appreciation" label="Annual property appreciation" value={appreciation} onChange={setAppreciation} suffix="%" min={0} max={20} step={0.5} hint="Historical Indian residential: 4–7%/yr. Varies widely by city." />
          <CalcInput id="friction" label="Repatriation friction (total)" value={friction} onChange={setFriction} suffix="%" min={0} max={30} step={0.5} hint="TDS on gains + FEMA compliance + currency conversion. 5–10% is a realistic estimate." />

          <div className="pt-1 pb-0.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">US alternative</div>
          <CalcInput id="usReturn" label="US investment annual return" value={usReturn} onChange={setUsReturn} suffix="%" min={0} max={30} step={0.5} />

          <ResetButton onReset={() => {
            setPropertyPriceInr(DEFAULTS.propertyPriceInr); setRentalYield(DEFAULTS.rentalYieldPct);
            setAppreciation(DEFAULTS.propertyAppreciationPct); setFriction(DEFAULTS.repatriationFrictionPct);
            setUsReturn(DEFAULTS.usReturnPct); setYears(DEFAULTS.years);
          }} />
        </div>
      }
      results={
        result === null ? (
          <CalcResults empty={emptyReason} />
        ) : (
          <CalcResults
            headline={{ label: `${years!} yr winner`, value: winnerLabel }}
            rows={[
              { label: "Capital deployed (USD)", value: fmtCurrency(result.capitalUsd) },
              { label: "Property value at end", value: fmtINRCompact(result.propertyFvInr), highlight: false },
              { label: "Total rental income (" + years! + " yr, flat yield)", value: fmtINRCompact(result.totalRentalInr) },
              { label: "India total (after " + (friction ?? 0) + "% repatriation costs)", value: fmtCurrency(result.indiaFvUsd) + " (" + fmtPct(result.annualizedIndiaReturnPct, 1) + "/yr)", highlight: result.winner === "india" },
              { label: "US investment total", value: fmtCurrency(result.usFvUsd) + " (" + fmtPct(result.annualizedUsReturnPct, 1) + "/yr)", highlight: result.winner === "us" },
              { label: "Difference", value: fmtCurrency(result.differenceUsd) },
            ]}
          />
        )
      }
      notes={`Rental income is a flat annuity on the initial property price — not compounded, no reinvestment, no vacancy or maintenance. Repatriation friction covers TDS on capital gains, FEMA repatriation procedures, and currency conversion costs as a single %. FX conversion uses today's rate (not a projected future rate). This is a first-order estimate; actual returns depend heavily on location, market timing, and individual tax treatment.`}
      ctaSlot={<NestMarginCTA />}
    />
  );
}
