// Gift / Remittance Limit Calculator — pure math, no side effects.
//
// Estimates US gift-tax implications of transferring USD to India, and the
// Indian income-tax implication for the recipient.
//
// ⚠️  ESTIMATE ONLY. Gift-tax thresholds are inflation-indexed and change each
// year. The TCJA lifetime exemption is scheduled to be roughly halved in 2026.
// All rule constants are in regulatory-rules.ts — verify before relying on them.
// This is NOT tax or legal advice.
//
// US gift-tax mechanics (simplified):
//   Annual exclusion: $18,000/recipient (2024) — $185,000 for non-citizen spouse.
//   Above the annual exclusion: taxable gift; reduces lifetime exemption ($13.61M 2024).
//   No US gift tax is owed until the lifetime exemption is exhausted.
//   Form 709 is required if taxable gifts exceed zero.
//
// India recipient tax (Section 56(2)(x)):
//   Gifts from a "relative" (spouse, sibling, parent, child, grandparent,
//   grandchild, and their spouses, and spouse's siblings): fully exempt.
//   Gifts from a non-relative: taxable as income if aggregate in the year > ₹50,000.

import {
  US_ANNUAL_GIFT_EXCLUSION_USD,
  US_ANNUAL_GIFT_EXCLUSION_NON_CITIZEN_SPOUSE_USD,
  US_LIFETIME_GIFT_ESTATE_EXEMPTION_USD,
  INDIA_GIFT_TAXABLE_THRESHOLD_INR,
} from "./regulatory-rules";

export type GiftRecipientType =
  | "relative"             // defined under Indian IT Act Section 56(2)(x); US non-spouse
  | "non-relative"         // India non-relative; US non-spouse
  | "non-citizen-spouse";  // higher annual exclusion; India: spouse = relative (exempt)

export interface GiftRemittanceInput {
  transferUsd: number;
  recipientType: GiftRecipientType;
  priorGiftsToRecipientUsd: number;  // gifts to same person earlier this calendar year
  lifetimeExemptionUsedUsd: number;  // cumulative prior taxable gifts across all recipients
  usdToInr: number;
  annualExclusionOverrideUsd?: number;   // optional: let caller override from config
  lifetimeExemptionOverrideUsd?: number; // optional override
  indiaTaxableThresholdInr?: number;     // optional override
}

export interface GiftRemittanceResult {
  annualExclusionUsd: number;
  totalGiftsThisYearUsd: number;       // priorGifts + transferUsd
  annualExclusionUsedBefore: number;   // min(priorGifts, annualExclusion)
  annualExclusionRemainingBefore: number;
  withinAnnualExclusion: boolean;
  taxableGiftThisTransferUsd: number;  // amount above annual exclusion from this transfer
  newLifetimeUsedUsd: number;          // lifetimeExemptionUsedUsd + taxableGiftThisTransferUsd
  remainingLifetimeExemptionUsd: number;
  lifetimeExhausted: boolean;
  form709RequiredLikely: boolean;      // if taxable gift > 0

  transferAmountInr: number;
  indiaRecipientTaxableAmountInr: number; // 0 if exempt
  indiaRecipientLikelyTaxable: boolean;
}

export function calcGiftRemittance(
  input: GiftRemittanceInput
): GiftRemittanceResult {
  const {
    transferUsd,
    recipientType,
    priorGiftsToRecipientUsd,
    lifetimeExemptionUsedUsd,
    usdToInr,
    annualExclusionOverrideUsd,
    lifetimeExemptionOverrideUsd,
    indiaTaxableThresholdInr,
  } = input;

  const transfer = Math.max(0, transferUsd);
  const prior = Math.max(0, priorGiftsToRecipientUsd);

  const annualExclusionUsd =
    annualExclusionOverrideUsd ??
    (recipientType === "non-citizen-spouse"
      ? US_ANNUAL_GIFT_EXCLUSION_NON_CITIZEN_SPOUSE_USD
      : US_ANNUAL_GIFT_EXCLUSION_USD);

  const lifetimeExemptionUsd =
    lifetimeExemptionOverrideUsd ?? US_LIFETIME_GIFT_ESTATE_EXEMPTION_USD;

  const totalGiftsThisYearUsd = prior + transfer;

  // How much of the annual exclusion was already used before this transfer?
  const annualExclusionUsedBefore = Math.min(prior, annualExclusionUsd);
  const annualExclusionRemainingBefore = Math.max(
    0,
    annualExclusionUsd - annualExclusionUsedBefore
  );

  // Taxable portion of THIS transfer (above the remaining annual exclusion)
  const taxableGiftThisTransferUsd = Math.max(
    0,
    transfer - annualExclusionRemainingBefore
  );

  const withinAnnualExclusion = taxableGiftThisTransferUsd === 0;

  const lifeUsedBefore = Math.max(0, lifetimeExemptionUsedUsd);
  const newLifetimeUsedUsd = lifeUsedBefore + taxableGiftThisTransferUsd;
  const remainingLifetimeExemptionUsd = Math.max(
    0,
    lifetimeExemptionUsd - newLifetimeUsedUsd
  );
  const lifetimeExhausted = newLifetimeUsedUsd >= lifetimeExemptionUsd;
  const form709RequiredLikely = taxableGiftThisTransferUsd > 0;

  // India recipient tax assessment
  const transferAmountInr =
    usdToInr > 0 ? transfer * usdToInr : 0;

  const indiaTaxThreshold =
    indiaTaxableThresholdInr ?? INDIA_GIFT_TAXABLE_THRESHOLD_INR;

  // Relatives (Indian IT Act Sec 56(2)(x)) are exempt; others pay tax above ₹50K
  const indiaRecipientExempt =
    recipientType === "relative" || recipientType === "non-citizen-spouse";

  const indiaRecipientLikelyTaxable =
    !indiaRecipientExempt && transferAmountInr > indiaTaxThreshold;

  // If non-relative and above threshold, the ENTIRE amount is taxable (not just the excess)
  const indiaRecipientTaxableAmountInr =
    indiaRecipientLikelyTaxable ? transferAmountInr : 0;

  return {
    annualExclusionUsd,
    totalGiftsThisYearUsd,
    annualExclusionUsedBefore,
    annualExclusionRemainingBefore,
    withinAnnualExclusion,
    taxableGiftThisTransferUsd,
    newLifetimeUsedUsd,
    remainingLifetimeExemptionUsd,
    lifetimeExhausted,
    form709RequiredLikely,
    transferAmountInr,
    indiaRecipientTaxableAmountInr,
    indiaRecipientLikelyTaxable,
  };
}

// Spot-checks (hand-verifiable):
//
// $15,000 to a relative, no prior gifts, $0 lifetime used, rate 84:
//   annualExclusion = 18,000; totalThisYear = 15,000
//   annualExclusionRemainingBefore = 18,000; taxableGift = 0
//   withinAnnualExclusion = true; form709 = false
//   indiaRecipient = relative → not taxable ✓
//
// $25,000 to a non-relative, $10,000 prior, $0 lifetime used, rate 84:
//   totalThisYear = 35,000; annualExclusionUsedBefore = 10,000
//   annualExclusionRemainingBefore = 8,000
//   taxableGift = 25,000 - 8,000 = 17,000
//   newLifetimeUsed = 17,000; remaining = 13,610,000 - 17,000 = 13,593,000
//   transferInr = 25,000 * 84 = 2,100,000 > 50,000 → India taxable ✓
//
// $200,000 to non-citizen spouse, $0 prior, $0 lifetime used:
//   annualExclusion = 185,000; taxableGift = 15,000 > 0
//   withinAnnualExclusion = false; form709 = true
//   non-citizen-spouse → India exempt ✓
