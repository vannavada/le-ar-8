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
            hint="Pre-filled from published rates (regulatory-rules.ts). Adjust if claiming DTAA benefit or if your CA advises a different rate."
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
            <strong>NRE vs NRO:</strong> NRE account balances are freely repatriable —
            the USD 1M limit applies only to NRO accounts. Surcharges on large
            amounts (above ₹50 lakh) are not modelled here and will raise the
            effective rate further.
          </p>

          <p className="text-xs text-muted-foreground">
            Rules applied: {RULE_AS_OF}. Annual limit: USD {NRO_REPATRIATION_LIMIT_USD.toLocaleString()}.
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
                  label: `% of USD ${(NRO_REPATRIATION_LIMIT_USD / 1_000_000).toFixed(0)}M annual limit used`,
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
                <span>USD 1M annual NRO limit</span>
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
              Estimate based on {RULE_AS_OF} rates. Surcharges on amounts
              above ₹50 lakh, DTAA treaty benefits, and CA12B/Form 15CB compliance
              costs are not included. Verify with a CA before initiating repatriation.
            </p>
          </div>
        )
      }
      notes={`NRO repatriation limit: USD ${NRO_REPATRIATION_LIMIT_USD.toLocaleString()} per financial year (RBI FEMA.13(R)/2016-RB). NRE balances are freely repatriable. This estimate covers base TDS + cess only — no surcharges, no DTAA adjustments, no professional fees. India-US DTAA Article 11 can reduce interest TDS to 15% if you obtain a Tax Residency Certificate and file Form 10F — consult a CA to claim this.`}
      ctaSlot={<NestMarginCTA />}
    />
  );
}
