import { describe, it, expect } from "vitest";
import { calcNriRepatriation, type NriRepatriationInput } from "@/lib/calculators/nri-repatriation";

// All expected values derived from the formula, not from function output.
//
// taxableInr   = max(0, grossAmountInr - ltcgEquityExemptionInr)   [exemption only for ltcg-equity]
// taxInr       = taxableInr * (tdsRatePct / 100)
// cessInr      = taxInr * (cessRatePct / 100)
// netInr       = grossAmountInr - taxInr - cessInr
// netUsd       = netInr / usdToInr
// effectiveRate = (taxInr + cessInr) / grossAmountInr * 100
// limitPct      = netUsd / 1,000,000 * 100
//
// NOTE: These tests verify the math given the rule inputs.
// They do NOT verify that the tax rates are currently accurate —
// that is the site owner's verification responsibility.

const FX = 84; // fixed rate for predictable test arithmetic

const BASE: NriRepatriationInput = {
  grossAmountInr: 1_000_000,
  assetType: "nro-interest",
  tdsRatePct: 30,
  cessRatePct: 4,
  ltcgEquityExemptionInr: 0,
  usdToInr: FX,
};

describe("calcNriRepatriation", () => {
  describe("NRO interest — 30% TDS + 4% cess", () => {
    it("calculates tax, cess, net correctly", () => {
      const r = calcNriRepatriation(BASE);
      // taxable = 10,00,000 (no exemption for nro-interest)
      // tax = 10,00,000 * 0.30 = 3,00,000
      // cess = 3,00,000 * 0.04 = 12,000
      // net = 10,00,000 - 3,12,000 = 6,88,000
      expect(r.taxableAmountInr).toBeCloseTo(1_000_000, 4);
      expect(r.taxInr).toBeCloseTo(300_000, 4);
      expect(r.cessInr).toBeCloseTo(12_000, 4);
      expect(r.totalDeductionInr).toBeCloseTo(312_000, 4);
      expect(r.netInr).toBeCloseTo(688_000, 4);
    });

    it("converts net to USD correctly", () => {
      const r = calcNriRepatriation(BASE);
      // netUsd = 6,88,000 / 84 ≈ 8190.48
      expect(r.netUsd).toBeCloseTo(688_000 / FX, 4);
    });

    it("computes effective rate as (tax + cess) / gross * 100", () => {
      const r = calcNriRepatriation(BASE);
      // effectiveRate = 3,12,000 / 10,00,000 * 100 = 31.2%
      expect(r.effectiveTaxRatePct).toBeCloseTo(31.2, 4);
    });

    it("computes limit pct used", () => {
      const r = calcNriRepatriation(BASE);
      const expectedNetUsd = 688_000 / FX;
      expect(r.limitPctUsed).toBeCloseTo((expectedNetUsd / 1_000_000) * 100, 2);
    });

    it("does NOT exceed the $1M limit for a ₹10L input", () => {
      const r = calcNriRepatriation(BASE);
      expect(r.exceedsLimit).toBe(false);
      expect(r.excessUsd).toBeCloseTo(0, 4);
    });
  });

  describe("LTCG equity — exemption subtracted before tax", () => {
    it("applies LTCG exemption to taxable amount", () => {
      const r = calcNriRepatriation({
        ...BASE,
        assetType: "ltcg-equity",
        tdsRatePct: 12.5,
        ltcgEquityExemptionInr: 125_000,
        grossAmountInr: 500_000,
      });
      // taxable = 5,00,000 - 1,25,000 = 3,75,000
      // tax = 3,75,000 * 0.125 = 46,875
      // cess = 46,875 * 0.04 = 1,875
      // net = 5,00,000 - 48,750 = 4,51,250
      expect(r.taxableAmountInr).toBeCloseTo(375_000, 4);
      expect(r.taxInr).toBeCloseTo(46_875, 4);
      expect(r.cessInr).toBeCloseTo(1_875, 4);
      expect(r.netInr).toBeCloseTo(451_250, 4);
    });

    it("exemption larger than gain → zero tax", () => {
      const r = calcNriRepatriation({
        ...BASE,
        assetType: "ltcg-equity",
        tdsRatePct: 12.5,
        ltcgEquityExemptionInr: 200_000,
        grossAmountInr: 100_000,
      });
      // taxable = max(0, 1,00,000 - 2,00,000) = 0
      expect(r.taxableAmountInr).toBeCloseTo(0, 4);
      expect(r.taxInr).toBeCloseTo(0, 4);
      expect(r.netInr).toBeCloseTo(100_000, 4);
    });

    it("non-equity asset type ignores ltcgEquityExemptionInr", () => {
      // nro-interest should not apply exemption even if value is set
      const r = calcNriRepatriation({
        ...BASE,
        assetType: "nro-interest",
        ltcgEquityExemptionInr: 125_000,
      });
      expect(r.taxableAmountInr).toBeCloseTo(1_000_000, 4);
    });
  });

  describe("STCG equity — 20% TDS + 4% cess", () => {
    it("calculates correctly at 20%", () => {
      const r = calcNriRepatriation({
        ...BASE,
        assetType: "stcg-equity",
        tdsRatePct: 20,
        grossAmountInr: 500_000,
      });
      // tax = 5,00,000 * 0.20 = 1,00,000; cess = 4,000; net = 3,96,000
      expect(r.taxInr).toBeCloseTo(100_000, 4);
      expect(r.cessInr).toBeCloseTo(4_000, 4);
      expect(r.netInr).toBeCloseTo(396_000, 4);
    });
  });

  describe("exceeds limit", () => {
    it("flags exceedsLimit when net USD > $1M", () => {
      // To exceed $1M: need net > 84M INR, so gross much larger
      // Gross ₹12Cr at 30% TDS + 4% cess: net = 12Cr * 0.688 = 8.256Cr / 84 ≈ $982K — still under
      // Let's use ₹14Cr: net = 14Cr * 0.688 = 9.632Cr / 84 ≈ $1,146,666 → over
      const r = calcNriRepatriation({
        ...BASE,
        grossAmountInr: 140_000_000,  // ₹14 crore
      });
      const expectedNet = 140_000_000 * (1 - 0.312);
      const expectedNetUsd = expectedNet / FX;
      expect(r.exceedsLimit).toBe(true);
      expect(r.excessUsd).toBeCloseTo(expectedNetUsd - 1_000_000, 2);
    });
  });

  describe("edge cases", () => {
    it("zero gross → all zeros", () => {
      const r = calcNriRepatriation({ ...BASE, grossAmountInr: 0 });
      expect(r.taxInr).toBeCloseTo(0, 4);
      expect(r.netInr).toBeCloseTo(0, 4);
      expect(r.netUsd).toBeCloseTo(0, 4);
    });

    it("zero TDS and cess → net equals gross", () => {
      const r = calcNriRepatriation({ ...BASE, tdsRatePct: 0, cessRatePct: 0 });
      expect(r.netInr).toBeCloseTo(1_000_000, 4);
      expect(r.effectiveTaxRatePct).toBeCloseTo(0, 4);
    });

    it("all results are finite on typical inputs", () => {
      const r = calcNriRepatriation(BASE);
      expect(isFinite(r.taxInr)).toBe(true);
      expect(isFinite(r.netUsd)).toBe(true);
      expect(isFinite(r.limitPctUsed)).toBe(true);
    });

    it("negative gross is clamped to 0", () => {
      const r = calcNriRepatriation({ ...BASE, grossAmountInr: -500_000 });
      expect(r.taxableAmountInr).toBeCloseTo(0, 4);
      expect(r.netInr).toBeCloseTo(0, 4);
    });
  });

  describe("custom repatriation limit", () => {
    it("uses custom limit when provided", () => {
      const r = calcNriRepatriation({
        ...BASE,
        grossAmountInr: 1_000_000,
        repatriationLimitUsd: 500_000, // smaller custom limit
      });
      const netUsd = r.netUsd;
      expect(r.limitPctUsed).toBeCloseTo((netUsd / 500_000) * 100, 2);
    });
  });
});
