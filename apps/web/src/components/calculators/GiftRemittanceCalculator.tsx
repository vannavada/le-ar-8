"use client";

// Field classification:
//   transferUsd                  — REQUIRED
//   recipientType                — REQUIRED (select)
//   priorGiftsToRecipientUsd     — optional (blank = 0)
//   lifetimeExemptionUsedUsd     — optional (blank = 0)
//   usdToInr                     — from live FX (for India side calculation)
//
// Annual exclusion and lifetime exemption thresholds are user-adjustable
// (seeded from regulatory-rules.ts) because they change every year.

import { useState, useEffect } from "react";
import { CalculatorShell } from "./CalculatorShell";
import { CalcInput } from "./CalcInput";
import { CalcSelect } from "./CalcInput";
import { CalcResults, ResetButton } from "./CalcResults";
import { FxRateBadge } from "./FxRateBadge";
import { useFxRates } from "@/lib/calculators/fx-client";
import {
  calcGiftRemittance,
  type GiftRecipientType,
} from "@/lib/calculators/gift-remittance";
import {
  US_ANNUAL_GIFT_EXCLUSION_USD,
  US_ANNUAL_GIFT_EXCLUSION_NON_CITIZEN_SPOUSE_USD,
  US_LIFETIME_GIFT_ESTATE_EXEMPTION_USD,
  INDIA_GIFT_TAXABLE_THRESHOLD_INR,
} from "@/lib/calculators/regulatory-rules";
import { fmtCurrency, fmtINRCompact } from "@/lib/calculators/format";
import { NestMarginCTA } from "@/components/affiliate/NestMarginCTA";
import { trackCalculatorUsed } from "./calcEvents";

const RECIPIENT_OPTIONS: { value: GiftRecipientType; label: string }[] = [
  { value: "relative",           label: "Relative in India (parent, sibling, child, spouse)" },
  { value: "non-relative",       label: "Non-relative in India (friend, unrelated person)" },
  { value: "non-citizen-spouse", label: "Non-US-citizen spouse in India" },
];

const DEFAULTS = {
  transferUsd: 20_000,
  recipientType: "relative" as GiftRecipientType,
  priorGiftsUsd: 0,
  lifetimeUsedUsd: 0,
  annualExclusionUsd: US_ANNUAL_GIFT_EXCLUSION_USD,
  lifetimeExemptionUsd: US_LIFETIME_GIFT_ESTATE_EXEMPTION_USD,
};

const RULE_YEAR = "2026";

const DISCLAIMER = (
  <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50/40 dark:bg-amber-950/30 px-4 py-3">
    <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
      ⚠ Estimate only — NOT tax or legal advice
    </p>
    <p className="mt-1 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
      US gift-tax thresholds are inflation-indexed and <strong>change every year</strong>.
      The lifetime exemption ({RULE_YEAR}: ${US_LIFETIME_GIFT_ESTATE_EXEMPTION_USD.toLocaleString()})
      is inflation-adjusted annually — verify the current figure at IRS.gov before use.
      India gift-tax rules depend on the exact relationship. These figures
      are as of {RULE_YEAR} and must be verified before use. Consult a qualified
      cross-border tax professional before making large transfers.
    </p>
  </div>
);

export function GiftRemittanceCalculator() {
  const fxState = useFxRates();

  const [transferUsd, setTransferUsd]         = useState<number | null>(DEFAULTS.transferUsd);
  const [recipientType, setRecipientType]     = useState<GiftRecipientType>(DEFAULTS.recipientType);
  const [priorGiftsUsd, setPriorGifts]        = useState<number | null>(DEFAULTS.priorGiftsUsd);
  const [lifetimeUsedUsd, setLifetimeUsed]    = useState<number | null>(DEFAULTS.lifetimeUsedUsd);
  const [annualExclusionUsd, setAnnualExc]    = useState<number | null>(
    recipientType === "non-citizen-spouse"
      ? US_ANNUAL_GIFT_EXCLUSION_NON_CITIZEN_SPOUSE_USD
      : US_ANNUAL_GIFT_EXCLUSION_USD
  );
  const [lifetimeExemptionUsd, setLifetimeEx] = useState<number | null>(DEFAULTS.lifetimeExemptionUsd);

  // Auto-update annual exclusion when recipient type changes
  useEffect(() => {
    setAnnualExc(
      recipientType === "non-citizen-spouse"
        ? US_ANNUAL_GIFT_EXCLUSION_NON_CITIZEN_SPOUSE_USD
        : US_ANNUAL_GIFT_EXCLUSION_USD
    );
  }, [recipientType]);

  useEffect(() => { trackCalculatorUsed("gift-remittance"); }, []);

  const usdToInr = fxState.status === "ok" ? fxState.usdToInr : null;
  const canCompute = transferUsd !== null && usdToInr !== null;

  const result = canCompute
    ? calcGiftRemittance({
        transferUsd: transferUsd!,
        recipientType,
        priorGiftsToRecipientUsd: priorGiftsUsd ?? 0,
        lifetimeExemptionUsedUsd: lifetimeUsedUsd ?? 0,
        usdToInr: usdToInr!,
        annualExclusionOverrideUsd: annualExclusionUsd ?? US_ANNUAL_GIFT_EXCLUSION_USD,
        lifetimeExemptionOverrideUsd: lifetimeExemptionUsd ?? US_LIFETIME_GIFT_ESTATE_EXEMPTION_USD,
      })
    : null;

  const emptyReason =
    fxState.status === "loading" ? "Fetching exchange rates…" :
    fxState.status === "error"   ? fxState.message :
    "Enter a transfer amount to see the gift-tax estimate.";

  return (
    <CalculatorShell
      title="Gift &amp; Remittance Limit Calculator"
      description="Estimate US gift-tax implications of sending money to India — and whether the Indian recipient owes income tax. Thresholds are user-adjustable because they change every year."
      alertBanner={DISCLAIMER}
      inputs={
        <div className="space-y-4">
          <FxRateBadge fxState={fxState} />

          <CalcSelect
            id="recipientType"
            label="Recipient relationship"
            value={recipientType}
            onChange={(v) => setRecipientType(v as GiftRecipientType)}
            options={RECIPIENT_OPTIONS}
          />

          <CalcInput
            id="transfer"
            label="Transfer amount (this gift)"
            value={transferUsd}
            onChange={setTransferUsd}
            required
            prefix="$"
            min={0}
            step={1000}
          />

          <CalcInput
            id="priorGifts"
            label="Prior gifts to this person this calendar year"
            value={priorGiftsUsd}
            onChange={setPriorGifts}
            prefix="$"
            min={0}
            step={1000}
            hint="Other amounts already given to the same recipient in 2026. Leave blank or 0 if this is the first transfer."
          />

          <CalcInput
            id="lifetimeUsed"
            label="Lifetime taxable gifts used so far (all recipients)"
            value={lifetimeUsedUsd}
            onChange={setLifetimeUsed}
            prefix="$"
            min={0}
            step={10000}
            hint="Cumulative total of prior taxable gifts (i.e., amounts above annual exclusion in past years). Typically $0 unless you've made very large gifts."
          />

          <div className="pt-1 pb-0.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Thresholds — verify &amp; adjust each year
          </div>

          <CalcInput
            id="annualExc"
            label={`Annual exclusion per recipient (${RULE_YEAR})`}
            value={annualExclusionUsd}
            onChange={setAnnualExc}
            prefix="$"
            min={0}
            step={1000}
            hint={`$${US_ANNUAL_GIFT_EXCLUSION_USD.toLocaleString()} for most recipients; $${US_ANNUAL_GIFT_EXCLUSION_NON_CITIZEN_SPOUSE_USD.toLocaleString()} for non-citizen spouses. Updated automatically by recipient type. Verify IRS Rev. Proc. for the current year.`}
          />

          <CalcInput
            id="lifetimeEx"
            label={`Lifetime exemption (${RULE_YEAR})`}
            value={lifetimeExemptionUsd}
            onChange={setLifetimeEx}
            prefix="$"
            min={0}
            step={100000}
            hint={`$${US_LIFETIME_GIFT_ESTATE_EXEMPTION_USD.toLocaleString()} for ${RULE_YEAR} — inflation-adjusted annually. Verify the current figure at IRS.gov before use.`}
          />

          <ResetButton onReset={() => {
            setTransferUsd(DEFAULTS.transferUsd);
            setRecipientType(DEFAULTS.recipientType);
            setPriorGifts(DEFAULTS.priorGiftsUsd);
            setLifetimeUsed(DEFAULTS.lifetimeUsedUsd);
            setAnnualExc(US_ANNUAL_GIFT_EXCLUSION_USD);
            setLifetimeEx(DEFAULTS.lifetimeExemptionUsd);
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
                label: "US gift-tax implication",
                value: result.withinAnnualExclusion
                  ? "Within annual exclusion"
                  : result.lifetimeExhausted
                  ? "Gift tax may be owed"
                  : "Uses lifetime exemption",
              }}
              rows={[
                { label: "Transfer amount", value: fmtCurrency(transferUsd!) },
                { label: "Annual exclusion for this recipient", value: fmtCurrency(result.annualExclusionUsd) },
                { label: "Prior gifts to this person (this year)", value: fmtCurrency(result.annualExclusionUsedBefore) },
                { label: "Exclusion remaining before this transfer", value: fmtCurrency(result.annualExclusionRemainingBefore) },
                {
                  label: "Taxable gift from this transfer",
                  value: fmtCurrency(result.taxableGiftThisTransferUsd),
                  highlight: result.taxableGiftThisTransferUsd > 0,
                },
                ...(result.taxableGiftThisTransferUsd > 0
                  ? [
                      { label: "Lifetime exemption used after this gift", value: fmtCurrency(result.newLifetimeUsedUsd), muted: true },
                      {
                        label: "Remaining lifetime exemption",
                        value: fmtCurrency(result.remainingLifetimeExemptionUsd),
                        highlight: result.lifetimeExhausted,
                      },
                    ]
                  : []),
                { label: "Form 709 filing likely required?", value: result.form709RequiredLikely ? "Yes — taxable gift > $0" : "No (within annual exclusion)", muted: true },
              ]}
            />

            <CalcResults
              headline={{
                label: "Indian recipient tax implication",
                value: result.indiaRecipientLikelyTaxable
                  ? "Likely taxable in India"
                  : "Likely exempt in India",
              }}
              rows={[
                { label: "Transfer in INR (approx.)", value: fmtINRCompact(result.transferAmountInr) },
                {
                  label: recipientType === "relative" || recipientType === "non-citizen-spouse"
                    ? "Relative under IT Act Sec 56(2)(x)"
                    : `Non-relative; threshold ₹${INDIA_GIFT_TAXABLE_THRESHOLD_INR.toLocaleString()}`,
                  value: result.indiaRecipientLikelyTaxable
                    ? "Taxable as income (entire amount)"
                    : "Exempt",
                  highlight: result.indiaRecipientLikelyTaxable,
                  muted: !result.indiaRecipientLikelyTaxable,
                },
              ]}
            />

            <p className="text-xs text-muted-foreground leading-relaxed">
              US rules as of {RULE_YEAR}. India rules: IT Act AY 2025-26.
              The annual exclusion and lifetime exemption are inflation-adjusted annually —
              check IRS Rev. Proc. before each tax year.
              "Relative" under the Indian IT Act has a specific legal definition —
              confirm the exact relationship with a CA.
            </p>
          </div>
        )
      }
      notes={`US gift tax: givers pay, not receivers. No tax is owed until the lifetime exemption is fully used. The annual exclusion resets each calendar year. Gifting to your own NRO/NRE account is NOT a gift (it's your own money) — no gift tax implications. This calculator does not cover FinCEN reporting (FBAR), FATCA, or wire-transfer bank reporting thresholds.`}
      ctaSlot={<NestMarginCTA />}
    />
  );
}
