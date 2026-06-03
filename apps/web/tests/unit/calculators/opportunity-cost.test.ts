import { describe, it, expect } from "vitest";
import { calcOpportunityCost } from "@/lib/calculators/opportunity-cost";

// Formula: FV = PV * (1 + r)^n   (lump-sum compound growth)
// All expected values derived from the formula, not from function output.

describe("calcOpportunityCost", () => {
  describe("basic compound growth", () => {
    it("$100 at 10% for 1 yr = $110 (hand-verifiable)", () => {
      const r = calcOpportunityCost({ amount: 100, returnRate: 10, years: 1 });
      expect(r.futureValue).toBeCloseTo(110, 4);
      expect(r.gain).toBeCloseTo(10, 4);
    });

    it("$1,000 at 7% for 30 yr ≈ $7,612.26 (hand-verifiable)", () => {
      const expected = 1000 * Math.pow(1.07, 30); // ≈ 7612.26
      const r = calcOpportunityCost({ amount: 1000, returnRate: 7, years: 30 });
      expect(r.futureValue).toBeCloseTo(expected, 2);
      expect(r.futureValue).toBeCloseTo(7612.26, 1);
      expect(r.gain).toBeCloseTo(expected - 1000, 2);
    });

    it("$500 at 5% for 10 yr", () => {
      const expected = 500 * Math.pow(1.05, 10);
      const r = calcOpportunityCost({ amount: 500, returnRate: 5, years: 10 });
      expect(r.futureValue).toBeCloseTo(expected, 2);
      expect(r.gain).toBeCloseTo(expected - 500, 2);
    });
  });

  describe("edge cases — no NaN / no Infinity except where intentional", () => {
    it("0% return: futureValue = amount, gain = 0, doubleTime = Infinity", () => {
      const r = calcOpportunityCost({ amount: 500, returnRate: 0, years: 10 });
      expect(r.futureValue).toBeCloseTo(500, 4);
      expect(r.gain).toBeCloseTo(0, 4);
      expect(r.doubleTime).toBe(Infinity);
    });

    it("0 years: no growth regardless of rate", () => {
      const r = calcOpportunityCost({ amount: 1000, returnRate: 10, years: 0 });
      expect(r.futureValue).toBeCloseTo(1000, 4);
      expect(r.gain).toBeCloseTo(0, 4);
    });

    it("long horizon (50 yr) produces finite result", () => {
      const r = calcOpportunityCost({ amount: 1000, returnRate: 7, years: 50 });
      expect(isFinite(r.futureValue)).toBe(true);
      expect(r.futureValue).toBeGreaterThan(1000);
    });
  });

  describe("rule of 72 (doubleTime)", () => {
    it("7% rate → doubleTime = 72/7 ≈ 10.286", () => {
      const r = calcOpportunityCost({ amount: 1000, returnRate: 7, years: 1 });
      expect(r.doubleTime).toBeCloseTo(72 / 7, 4);
    });

    it("10% rate → doubleTime = 7.2", () => {
      const r = calcOpportunityCost({ amount: 1000, returnRate: 10, years: 1 });
      expect(r.doubleTime).toBeCloseTo(7.2, 4);
    });
  });
});
