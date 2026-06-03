"use client";

// Field classification:
//   amountUsd        — REQUIRED (subject of comparison)
//   years            — REQUIRED (time horizon)
//   fxTrendPctPerYear— optional (blank = 0%: no FX change assumed)
//   usReturnPct      — optional (blank = 0%: "just cash" baseline)
//   indiaFdRatePct   — optional (blank = 0%)
//   usTaxPct         — optional (blank = 0%: tax-advantaged account scenario)
//   indiaTaxPct      — optional (blank = 0%)
//   usdToInr         — from FX API (not user-editable)

import { useState, useEffect } from "react";
import { CalculatorShell } from "./CalculatorShell";
import { CalcInput } from "./CalcInput";
import { CalcResults, ResetButton } from "./CalcResults";
import { FxRateBadge } from "./FxRateBadge";
import { useFxRates } from "@/lib/calculators/fx-client";
import { calcMoneyLocation } from "@/lib/calculators/money-location";
import { fmtCurrency, fmtINRCompact, fmtPct } from "@/lib/calculators/format";
import { NestMarginCTA } from "@/components/affiliate/NestMarginCTA";
import { trackCalculatorUsed } from "./calcEvents";

const DEFAULTS = {
  amountUsd: 10000,
  fxTrendPctPerYear: 2.5,  // historical ~2-3% INR annual depreciation vs USD
  usReturnPct: 7,
  indiaFdRatePct: 7,        // typical SBI FD rate (user should verify current rates)
  usTaxPct: 15,             // US LTCG rate
  indiaTaxPct: 30,          // typical NRI TDS on FD interest
  years: 10,
};

export function MoneyLocationCalculator() {
  const fxState = useFxRates();

  const [amountUsd, setAmountUsd] = useState<number | null>(DEFAULTS.amountUsd);
  const [fxTrend, setFxTrend]     = useState<number | null>(DEFAULTS.fxTrendPctPerYear);
  const [usReturn, setUsReturn]   = useState<number | null>(DEFAULTS.usReturnPct);
  const [indiaFd, setIndiaFd]     = useState<number | null>(DEFAULTS.indiaFdRatePct);
  const [usTax, setUsTax]         = useState<number | null>(DEFAULTS.usTaxPct);
  const [indiaTax, setIndiaTax]   = useState<number | null>(DEFAULTS.indiaTaxPct);
  const [years, setYears]         = useState<number | null>(DEFAULTS.years);

  useEffect(() => { trackCalculatorUsed("money-location"); }, []);

  const usdToInr = fxState.status === "ok" ? fxState.usdToInr : null;
  const canCompute = amountUsd !== null && years !== null && usdToInr !== null;

  const result = canCompute
    ? calcMoneyLocation({
        amountUsd: amountUsd!,
        usdToInr: usdToInr!,
        fxTrendPctPerYear: fxTrend ?? 0,
        usReturnPct: usReturn ?? 0,
        indiaFdRatePct: indiaFd ?? 0,
        usTaxPct: usTax ?? 0,
        indiaTaxPct: indiaTax ?? 0,
        years: years!,
      })
    : null;

  const winnerLabel =
    result?.winner === "india" ? "India (FD)" :
    result?.winner === "us"    ? "US (investment)" : "Tie";

  const emptyReason =
    fxState.status === "loading" ? "Fetching exchange rates…" :
    fxState.status === "error"   ? fxState.message :
    "Enter an amount and time horizon to see the comparison.";

  return (
    <CalculatorShell
      title="US vs. India — Where Should My Money Live?"
      description="Compare growing the same USD in a US investment vs. an Indian fixed deposit, after FX conversion, currency trend, and tax — all assumptions yours to adjust."
      inputs={
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground border border-border/50 rounded-md px-3 py-2 bg-muted/30">
            <span className="font-medium">Estimate.</span> User-entered rates only — not sourced from any bank. Not financial advice.
          </p>

          <FxRateBadge fxState={fxState} />

          <CalcInput id="amount" label="Amount to compare" value={amountUsd} onChange={setAmountUsd} required prefix="$" min={0} step={1000} />
          <CalcInput id="years" label="Time horizon" value={years} onChange={setYears} required suffix="yr" min={1} max={30} />

          <div className="pt-1 pb-0.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">India assumptions</div>
          <CalcInput id="indiaFd" label="India FD / savings rate" value={indiaFd} onChange={setIndiaFd} suffix="%" min={0} max={20} step={0.25} hint="Verify current rates at your bank. SBI 1–3 yr FD was ~7% in 2024." />
          <CalcInput id="indiaTax" label="India effective tax on interest" value={indiaTax} onChange={setIndiaTax} suffix="%" min={0} max={40} step={1} hint="NRI TDS on FD interest is typically 30%. Enter your own rate." />
          <CalcInput id="fxTrend" label="INR depreciation vs USD (per year)" value={fxTrend} onChange={setFxTrend} suffix="%" min={-5} max={10} step={0.25} hint="Positive = INR weakens. Historical avg ~2–3%/yr. Adjust your view." />

          <div className="pt-1 pb-0.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">US assumptions</div>
          <CalcInput id="usReturn" label="US investment return" value={usReturn} onChange={setUsReturn} suffix="%" min={0} max={30} step={0.5} hint="Historical S&P 500 nominal ~10%, real ~7%. Enter your own." />
          <CalcInput id="usTax" label="US effective tax rate on gains" value={usTax} onChange={setUsTax} suffix="%" min={0} max={40} step={1} hint="LTCG is 15–20% for most. 0% for Roth IRA. Enter yours." />

          <ResetButton onReset={() => {
            setAmountUsd(DEFAULTS.amountUsd); setFxTrend(DEFAULTS.fxTrendPctPerYear);
            setUsReturn(DEFAULTS.usReturnPct); setIndiaFd(DEFAULTS.indiaFdRatePct);
            setUsTax(DEFAULTS.usTaxPct); setIndiaTax(DEFAULTS.indiaTaxPct);
            setYears(DEFAULTS.years);
          }} />
        </div>
      }
      results={
        result === null ? (
          <CalcResults empty={emptyReason} />
        ) : (
          <CalcResults
            headline={{
              label: `${years!} yr winner`,
              value: winnerLabel,
            }}
            rows={[
              { label: "Amount compared", value: fmtCurrency(amountUsd!) + " / " + fmtINRCompact(result.amountInr) },
              { label: `India FD (${fmtPct(result.indiaNetRatePct)} net) → ending value`, value: fmtINRCompact(result.indiaFvInr) + " / " + fmtCurrency(result.indiaFvUsd), highlight: result.winner === "india" },
              { label: "Projected USD/INR in " + years! + " yr", value: result.futureUsdToInr.toFixed(2), muted: true },
              { label: `US investment (${fmtPct(result.usNetRatePct)} net) → ending value`, value: fmtCurrency(result.usFvUsd), highlight: result.winner === "us" },
              { label: "Difference", value: fmtCurrency(result.differenceUsd) + " (" + fmtPct(result.differencePct, 1) + " more)" },
            ]}
          />
        )
      }
      notes={`Comparison in USD terms after ${years ?? "?"} years. India scenario: convert USD to INR at today's rate, invest at the FD rate (post-tax), convert back at the projected future rate. US scenario: invest USD at the US return (post-tax). FX trend and tax rates are estimates — small changes matter significantly at long horizons. Not financial advice.`}
      ctaSlot={<NestMarginCTA />}
    />
  );
}
