"use client";

// Field classification:
//   grossAmountInr   — REQUIRED
//   assetType        — REQUIRED (select; auto-fills tdsRate)
//   tdsRatePct       — optional (blank = 0%; user-adjustable from default)
//   cessRatePct      — optional (blank = 0%; default 4%)
//   ltcgExemptionInr — optional (only relevant for LTCG equity; blank = 0)
//   usdToInr         — from live FX

import { useState, useEffect } from "react";
import { CalculatorShell } from "./CalculatorShell";
import { CalcInput } from "./CalcInput";
import { CalcSelect } from "./CalcInput";
import { CalcResults, ResetButton } from "./CalcResults";
import { FxRateBadge } from "./FxRateBadge";
import { useFxRates } from "@/lib/calculators/fx-client";
import {
  calcNriRepatriation,
  DEFAULT_TDS_BY_ASSET_TYPE,
  ASSET_TYPE_LABELS,
  type NriAssetType,
} from "@/lib/calculators/nri-repatriation";
import {
  LTCG_EQUITY_EXEMPTION_INR,
  INDIA_CESS_PCT,
  NRO_REPATRIATION_LIMIT_USD,
} from "@/lib/calculators/regulatory-rules";
import { fmtCurrency, fmtINRCompact, fmtPct } from "@/lib/calculators/format";
import { NestMarginCTA } from "@/components/affiliate/NestMarginCTA";
import { trackCalculatorUsed } from "./calcEvents";

const ASSET_OPTIONS: { value: NriAssetType; label: string }[] = [
  { value: "nro-interest",  label: ASSET_TYPE_LABELS["nro-interest"] },
  { value: "ltcg-equity",   label: ASSET_TYPE_LABELS["ltcg-equity"] },
  { value: "stcg-equity",   label: ASSET_TYPE_LABELS["stcg-equity"] },
  { value: "ltcg-realty",   label: ASSET_TYPE_LABELS["ltcg-realty"] },
  { value: "dividend",      label: ASSET_TYPE_LABELS["dividend"] },
];

const DEFAULTS = {
  assetType: "nro-interest" as NriAssetType,
  grossAmountInr: 1_000_000,
  tdsRatePct: DEFAULT_TDS_BY_ASSET_TYPE["nro-interest"],
  cessRatePct: INDIA_CESS_PCT,
  ltcgExemptionInr: LTCG_EQUITY_EXEMPTION_INR,
};

// ⚠️ Source dates for the disclaimer shown in the UI
const RULE_AS_OF = "AY 2025-26 / FY 2024-25";

const DISCLAIMER = (
  <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50/40 dark:bg-amber-950/30 px-4 py-3">
    <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
      ⚠ Estimate only — NOT tax or legal advice
    </p>
    <p className="mt-1 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
      Tax rules and repatriation limits change. Rates shown are based on published
      rules as of {RULE_AS_OF} and have <strong>not been independently verified</strong> —
      the site owner must confirm accuracy before relying on this calculator. Individual
      circumstances, surcharges, DTAA benefits, and applicable account type (NRO/NRE)
      significantly affect the real outcome. Consult a qualified cross-border CA or
      tax professional before making repatriation decisions.
    </p>
  </div>
);

export function NriRepatriationCalculator() {
  const fxState = useFxRates();

  const [assetType, setAssetType]     = useState<NriAssetType>(DEFAULTS.assetType);
  const [grossAmountInr, setGross]    = useState<number | null>(DEFAULTS.grossAmountInr);
  const [tdsRate, setTdsRate]         = useState<number | null>(DEFAULTS.tdsRatePct);
  const [cessRate, setCessRate]       = useState<number | null>(DEFAULTS.cessRatePct);
  const [ltcgExemption, setLtcgExemption] = useState<number | null>(DEFAULTS.ltcgExemptionInr);

  // Auto-fill TDS rate when asset type changes
  useEffect(() => {
    setTdsRate(DEFAULT_TDS_BY_ASSET_TYPE[assetType]);
  }, [assetType]);

  useEffect(() => { trackCalculatorUsed("nri-repatriation"); }, []);

  const usdToInr = fxState.status === "ok" ? fxState.usdToInr : null;
  const canCompute = grossAmountInr !== null && usdToInr !== null;

  const result = canCompute
    ? calcNriRepatriation({
        grossAmountInr: grossAmountInr!,
        assetType,
        tdsRatePct: tdsRate ?? 0,
        cessRatePct: cessRate ?? 0,
        ltcgEquityExemptionInr: ltcgExemption ?? 0,
        usdToInr: usdToInr!,
      })
    : null;

  const emptyReason =
    fxState.status === "loading" ? "Fetching exchange rates…" :
    fxState.status === "error"   ? fxState.message :
    "Enter a gross amount to see the repatriation estimate.";

  const limitBar = result
    ? Math.min(100, result.limitPctUsed)
    : 0;

  return (
    <CalculatorShell
      title="NRI Repatriation Calculator"
      description="Estimate how much of your Indian income or asset-sale proceeds you can repatriate to the US after Indian taxes — and how it compares to the RBI's USD 1 million/year NRO limit."
      alertBanner={DISCLAIMER}
      inputs={
        <div className="space-y-4">
          <FxRateBadge fxState={fxState} />

          <CalcSelect
            id="assetType"
            label="Asset / income type"
            value={assetType}
            onChange={(v) => setAssetType(v as NriAssetType)}
            options={ASSET_OPTIONS}
          />

          <CalcInput
            id="gross"
            label="Gross amount (before tax)"
            value={grossAmountInr}
            onChange={setGross}
            required
            prefix="₹"
            min={0}
            step={100000}
            hint="Enter total INR amount before any TDS deduction."
          />

          {assetType === "ltcg-equity" && (
            <CalcInput
              id="ltcgExemption"
              label="LTCG equity exemption remaining this year"
              value={ltcgExemption}
              onChange={setLtcgExemption}
              prefix="₹"
              min={0}
              max={125000}
              step={12500}
              hint={`₹1,25,000 per financial year (Finance Act 2024, AY 2025-26). Reduce if already used.`}
            />
          )}

          <div className="pt-1 pb-0.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Tax rates — verify &amp; adjust
          </div>

          <CalcInput
            id="tdsRate"
            label="TDS / withholding rate"
            value={tdsRate}
            onChange={setTdsRate}
            suffix="%"
            min={0}
            max={40}
            step={0.5}
            hint="Base statutory rate (no treaty benefit applied). US-resident NRIs may qualify for 15% under India-US DTAA Art. 11 with a Tax Residency Certificate (IRS) + Form 10F — adjust to 15% if your CA confirms DTAA applies."
          />

          <CalcInput
            id="cessRate"
            label="Health &amp; Education Cess"
            value={cessRate}
            onChange={setCessRate}
            suffix="%"
            min={0}
            max={10}
            step={0.5}
            hint="4% cess on all India income tax since Finance Act 2018. Change only if rules have changed."
          />

          <p className="text-xs text-muted-foreground border border-border/50 rounded-md px-3 py-2 bg-muted/30">
            <strong>NRO accounts only:</strong> The USD 1M cap applies to NRO accounts
            specifically — per Indian financial year (April–March), not the calendar year.
            NRE and FCNR accounts are freely repatriable with no annual cap.
            Surcharges on amounts above ₹50 lakh are not modelled here.
          </p>

          <p className="text-xs text-muted-foreground">
            Rules applied: {RULE_AS_OF}. NRO annual limit: USD {NRO_REPATRIATION_LIMIT_USD.toLocaleString()} per Indian financial year (April–March).
          </p>

          <ResetButton onReset={() => {
            setAssetType(DEFAULTS.assetType);
            setGross(DEFAULTS.grossAmountInr);
            setTdsRate(DEFAULTS.tdsRatePct);
            setCessRate(DEFAULTS.cessRatePct);
            setLtcgExemption(DEFAULTS.ltcgExemptionInr);
          }} />
        </div>
      }
      results={
        result === null ? (
          <CalcResults empty={emptyReason} />
        ) : (
          <div className="space-y-4">
            <CalcResults
              headline={{
                label: "Net repatriable (USD)",
                value: fmtCurrency(result.netUsd),
              }}
              rows={[
                { label: "Gross amount", value: fmtINRCompact(grossAmountInr!) },
                ...(assetType === "ltcg-equity" && (ltcgExemption ?? 0) > 0
                  ? [{ label: "LTCG exemption applied", value: "−" + fmtINRCompact(ltcgExemption ?? 0), muted: true }]
                  : []),
                { label: "Taxable amount", value: fmtINRCompact(result.taxableAmountInr) },
                { label: `TDS / withholding (${fmtPct(tdsRate ?? 0, 1)})`, value: "−" + fmtINRCompact(result.taxInr) },
                { label: `Cess (${fmtPct(cessRate ?? 0, 0)} on tax)`, value: "−" + fmtINRCompact(result.cessInr) },
                { label: "Net after tax (INR)", value: fmtINRCompact(result.netInr), highlight: true },
                { label: `Net in USD (at ₹${usdToInr?.toFixed(2)}/USD)`, value: fmtCurrency(result.netUsd), highlight: true },
                { label: "Effective deduction rate", value: fmtPct(result.effectiveTaxRatePct, 1), muted: true },
                {
                  label: `% of NRO annual limit (USD ${(NRO_REPATRIATION_LIMIT_USD / 1_000_000).toFixed(0)}M, Apr–Mar FY) used`,
                  value: fmtPct(result.limitPctUsed, 1) + (result.exceedsLimit ? " — OVER LIMIT" : ""),
                  highlight: result.exceedsLimit,
                },
                ...(result.exceedsLimit
                  ? [{ label: "Amount over limit (needs separate application)", value: fmtCurrency(result.excessUsd) }]
                  : []),
              ]}
            />

            {/* Visual limit bar */}
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>NRO limit: USD 1M/yr (Apr–Mar)</span>
                <span>{fmtPct(result.limitPctUsed, 1)} used</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${limitBar}%`,
                    backgroundColor: result.exceedsLimit ? "#D81B60" : "#5f9e7e",
                  }}
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Estimate based on {RULE_AS_OF} rates. Surcharges above ₹50 lakh, DTAA
              treaty benefits, and Form 15CA/15CB compliance costs (renamed Form 146 /
              Form 145 under Income Tax Act 2025, from April 1, 2026) are not included.
              Verify with a CA before initiating repatriation.
            </p>
          </div>
        )
      }
      notes={`NRO repatriation limit: USD ${NRO_REPATRIATION_LIMIT_USD.toLocaleString()} per Indian financial year (April–March) — RBI FEMA.13(R)/2016-RB. NRE and FCNR accounts are freely repatriable with no cap. This estimate covers base TDS + cess only — no surcharges, no DTAA adjustments. India-US DTAA Article 11 can reduce NRO interest TDS from 30% to 15% with a Tax Residency Certificate (from the IRS) and Form 10F filed with the Indian bank — consult a CA to claim this. Repatriation requires Form 15CA/15CB filings (renamed Form 146/Form 145 under the Income Tax Act 2025, from April 1, 2026).`}
      ctaSlot={<NestMarginCTA />}
    />
  );
}
