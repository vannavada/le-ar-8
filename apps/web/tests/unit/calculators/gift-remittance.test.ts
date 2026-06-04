import { describe, it, expect } from "vitest";
import { calcGiftRemittance, type GiftRemittanceInput } from "@/lib/calculators/gift-remittance";

// All expected values are formula-derived.
//
// annualExclusion: $18,000 (non-citizen-spouse: $185,000)
// annualExclusionUsedBefore  = min(priorGifts, annualExclusion)
// annualExclusionRemainingBefore = max(0, annualExclusion - usedBefore)
// taxableGift = max(0, transfer - remaining)
// newLifetimeUsed = priorLifetimeUsed + taxableGift
// remainingLifetime = max(0, lifetimeExemption - newLifetimeUsed)
// India: non-relative, transferInr > 50,000 → taxable
//
// NOTE: Tests verify the math given the (flagged) rule inputs.
// They do NOT verify that the thresholds are currently accurate.

const FX = 84;

const BASE: GiftRemittanceInput = {
  transferUsd: 15_000,
  recipientType: "relative",
  priorGiftsToRecipientUsd: 0,
  lifetimeExemptionUsedUsd: 0,
  usdToInr: FX,
  annualExclusionOverrideUsd: 18_000,
  lifetimeExemptionOverrideUsd: 13_610_000,
};

describe("calcGiftRemittance", () => {
  describe("within annual exclusion", () => {
    it("$15K to relative, no prior gifts → within exclusion, no Form 709", () => {
      const r = calcGiftRemittance(BASE);
      expect(r.annualExclusionUsd).toBe(18_000);
      expect(r.annualExclusionRemainingBefore).toBe(18_000);
      expect(r.withinAnnualExclusion).toBe(true);
      expect(r.taxableGiftThisTransferUsd).toBeCloseTo(0, 4);
      expect(r.form709RequiredLikely).toBe(false);
    });

    it("$18K exactly → within exclusion (boundary)", () => {
      const r = calcGiftRemittance({ ...BASE, transferUsd: 18_000 });
      expect(r.withinAnnualExclusion).toBe(true);
      expect(r.taxableGiftThisTransferUsd).toBeCloseTo(0, 4);
    });
  });

  describe("exceeds annual exclusion", () => {
    it("$25K to relative, no prior gifts → $7K taxable gift", () => {
      const r = calcGiftRemittance({ ...BASE, transferUsd: 25_000 });
      // remaining = 18,000; taxable = 25,000 - 18,000 = 7,000
      expect(r.taxableGiftThisTransferUsd).toBeCloseTo(7_000, 4);
      expect(r.withinAnnualExclusion).toBe(false);
      expect(r.form709RequiredLikely).toBe(true);
    });

    it("$25K with $10K prior gifts → annualExcRemaining = $8K, taxable = $17K", () => {
      const r = calcGiftRemittance({
        ...BASE,
        transferUsd: 25_000,
        priorGiftsToRecipientUsd: 10_000,
      });
      // usedBefore = min(10,000, 18,000) = 10,000
      // remainingBefore = 18,000 - 10,000 = 8,000
      // taxable = 25,000 - 8,000 = 17,000
      expect(r.annualExclusionUsedBefore).toBeCloseTo(10_000, 4);
      expect(r.annualExclusionRemainingBefore).toBeCloseTo(8_000, 4);
      expect(r.taxableGiftThisTransferUsd).toBeCloseTo(17_000, 4);
    });

    it("prior gifts already exhaust exclusion → entire transfer is taxable", () => {
      const r = calcGiftRemittance({
        ...BASE,
        transferUsd: 20_000,
        priorGiftsToRecipientUsd: 20_000, // already exceeded $18K
      });
      // usedBefore = min(20,000, 18,000) = 18,000
      // remainingBefore = 0
      // taxable = 20,000 - 0 = 20,000
      expect(r.annualExclusionRemainingBefore).toBeCloseTo(0, 4);
      expect(r.taxableGiftThisTransferUsd).toBeCloseTo(20_000, 4);
    });
  });

  describe("lifetime exemption tracking", () => {
    it("taxable gift reduces remaining lifetime exemption", () => {
      const r = calcGiftRemittance({ ...BASE, transferUsd: 50_000 });
      // taxable = 50,000 - 18,000 = 32,000
      // newLifetimeUsed = 0 + 32,000 = 32,000
      // remaining = 13,610,000 - 32,000 = 13,578,000
      expect(r.newLifetimeUsedUsd).toBeCloseTo(32_000, 4);
      expect(r.remainingLifetimeExemptionUsd).toBeCloseTo(13_578_000, 4);
    });

    it("prior lifetime used adds to new total", () => {
      const r = calcGiftRemittance({
        ...BASE,
        transferUsd: 50_000,
        lifetimeExemptionUsedUsd: 1_000_000,
      });
      // taxable = 32,000; new total = 1,032,000
      expect(r.newLifetimeUsedUsd).toBeCloseTo(1_032_000, 4);
    });

    it("lifetime exhausted when new total >= exemption", () => {
      const r = calcGiftRemittance({
        ...BASE,
        transferUsd: 1_000_000,
        lifetimeExemptionUsedUsd: 12_700_000,
        annualExclusionOverrideUsd: 18_000,
        lifetimeExemptionOverrideUsd: 13_610_000,
      });
      // taxable = 1,000,000 - 18,000 = 982,000
      // newUsed = 12,700,000 + 982,000 = 13,682,000 > 13,610,000 → exhausted
      expect(r.lifetimeExhausted).toBe(true);
      expect(r.remainingLifetimeExemptionUsd).toBeCloseTo(0, 4);
    });
  });

  describe("non-citizen spouse — higher annual exclusion", () => {
    it("$185K to non-citizen-spouse → within exclusion", () => {
      const r = calcGiftRemittance({
        ...BASE,
        recipientType: "non-citizen-spouse",
        transferUsd: 185_000,
        annualExclusionOverrideUsd: 185_000,
      });
      expect(r.annualExclusionUsd).toBe(185_000);
      expect(r.withinAnnualExclusion).toBe(true);
      expect(r.taxableGiftThisTransferUsd).toBeCloseTo(0, 4);
    });

    it("$200K to non-citizen-spouse → $15K taxable", () => {
      const r = calcGiftRemittance({
        ...BASE,
        recipientType: "non-citizen-spouse",
        transferUsd: 200_000,
        annualExclusionOverrideUsd: 185_000,
      });
      expect(r.taxableGiftThisTransferUsd).toBeCloseTo(15_000, 4);
      expect(r.form709RequiredLikely).toBe(true);
    });
  });

  describe("India recipient tax", () => {
    it("relative → not taxable in India regardless of amount", () => {
      const r = calcGiftRemittance({ ...BASE, transferUsd: 1_000_000 });
      expect(r.indiaRecipientLikelyTaxable).toBe(false);
      expect(r.indiaRecipientTaxableAmountInr).toBeCloseTo(0, 4);
    });

    it("non-citizen-spouse → not taxable in India (relative category)", () => {
      const r = calcGiftRemittance({
        ...BASE,
        recipientType: "non-citizen-spouse",
        transferUsd: 500_000,
        annualExclusionOverrideUsd: 185_000,
      });
      expect(r.indiaRecipientLikelyTaxable).toBe(false);
    });

    it("non-relative, small amount (< ₹50K) → not taxable", () => {
      // $500 × 84 = ₹42,000 < ₹50,000 threshold
      const r = calcGiftRemittance({
        ...BASE,
        recipientType: "non-relative",
        transferUsd: 500,
      });
      expect(r.transferAmountInr).toBeCloseTo(500 * FX, 4);
      expect(r.indiaRecipientLikelyTaxable).toBe(false);
    });

    it("non-relative, large amount (> ₹50K) → taxable, entire amount", () => {
      // $1,000 × 84 = ₹84,000 > ₹50,000
      const r = calcGiftRemittance({
        ...BASE,
        recipientType: "non-relative",
        transferUsd: 1_000,
      });
      expect(r.indiaRecipientLikelyTaxable).toBe(true);
      expect(r.indiaRecipientTaxableAmountInr).toBeCloseTo(1_000 * FX, 4);
    });
  });

  describe("INR conversion", () => {
    it("transferAmountInr = transferUsd * usdToInr", () => {
      const r = calcGiftRemittance({ ...BASE, transferUsd: 10_000 });
      expect(r.transferAmountInr).toBeCloseTo(10_000 * FX, 4);
    });
  });

  describe("edge cases", () => {
    it("zero transfer → all zeros, within exclusion", () => {
      const r = calcGiftRemittance({ ...BASE, transferUsd: 0 });
      expect(r.withinAnnualExclusion).toBe(true);
      expect(r.taxableGiftThisTransferUsd).toBeCloseTo(0, 4);
      expect(r.form709RequiredLikely).toBe(false);
    });

    it("all results finite on typical inputs", () => {
      const r = calcGiftRemittance({ ...BASE, transferUsd: 50_000 });
      expect(isFinite(r.taxableGiftThisTransferUsd)).toBe(true);
      expect(isFinite(r.remainingLifetimeExemptionUsd)).toBe(true);
    });
  });
});
