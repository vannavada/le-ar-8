import { describe, it, expect } from "vitest";
import { calcTimeToFi } from "@/lib/calculators/time-to-fi";

// Formulas:
//   annualSavings   = income * savingsRate/100
//   annualExpenses  = income − annualSavings
//   targetPortfolio = annualExpenses / (withdrawalRate/100)
//   yearsToFi (r>0) = ln(1 + targetPortfolio*r / annualSavings) / ln(1+r)
//   yearsToFi (r=0) = targetPortfolio / annualSavings
// All expected values derived from the formulas, not from function output.

describe("calcTimeToFi", () => {
  describe("classic Shockingly Simple Math verification", () => {
    it("50% savings / 5% return / 4% withdrawal → ≈16.6 yr", () => {
      // targetPortfolio = 50,000/0.04 = 1,250,000
      // ratio = 1 + 1,250,000*0.05/50,000 = 2.25
      // yearsToFi = ln(2.25) / ln(1.05) ≈ 16.62
      const expected = Math.log(1 + (1_250_000 * 0.05) / 50_000) / Math.log(1.05);
      const r = calcTimeToFi({ income: 100_000, savingsRate: 50, expectedReturn: 5, withdrawalRate: 4 });
      expect(r.yearsToFi).toBeCloseTo(expected, 2);
      expect(r.yearsToFi).toBeCloseTo(16.6, 1);
    });

    it("50% savings / 7% return / 4% withdrawal → ≈14.95 yr (code spot-check)", () => {
      // ratio = 1 + 1,250,000*0.07/50,000 = 2.75
      // yearsToFi = ln(2.75) / ln(1.07) ≈ 14.952
      const expected = Math.log(2.75) / Math.log(1.07);
      const r = calcTimeToFi({ income: 100_000, savingsRate: 50, expectedReturn: 7, withdrawalRate: 4 });
      expect(r.yearsToFi).toBeCloseTo(expected, 2);
      expect(r.yearsToFi).toBeCloseTo(14.95, 1);
    });
  });

  describe("derived portfolio values", () => {
    it("annualSavings, annualExpenses, targetPortfolio computed correctly", () => {
      const r = calcTimeToFi({ income: 80_000, savingsRate: 25, expectedReturn: 7, withdrawalRate: 4 });
      expect(r.annualSavings).toBeCloseTo(20_000, 2);
      expect(r.annualExpenses).toBeCloseTo(60_000, 2);
      expect(r.targetPortfolio).toBeCloseTo(1_500_000, 2); // 60k / 0.04
      expect(r.savingsMultiple).toBeCloseTo(25, 4);        // 1 / 0.04
      expect(r.expenseRatio).toBeCloseTo(0.75, 4);         // 60k / 80k
    });
  });

  describe("edge cases", () => {
    it("0% savings rate → yearsToFi = Infinity", () => {
      const r = calcTimeToFi({ income: 100_000, savingsRate: 0, expectedReturn: 7, withdrawalRate: 4 });
      expect(r.yearsToFi).toBe(Infinity);
    });

    it("0% return → linear savings: yearsToFi = target / savings", () => {
      // $50k income, 50% savings → $50k/yr savings, $1.25M target → 25 yr
      const r = calcTimeToFi({ income: 100_000, savingsRate: 50, expectedReturn: 0, withdrawalRate: 4 });
      expect(r.yearsToFi).toBeCloseTo(25, 2);
    });

    it("90% savings rate → very fast FI (≈2–3 yr at 7%)", () => {
      // expenses=$10k, target=$250k, savings=$90k
      // ratio = 1 + 250,000*0.07/90,000 ≈ 1.194
      // yearsToFi = ln(1.194) / ln(1.07) ≈ 2.6
      const expected = Math.log(1 + (250_000 * 0.07) / 90_000) / Math.log(1.07);
      const r = calcTimeToFi({ income: 100_000, savingsRate: 90, expectedReturn: 7, withdrawalRate: 4 });
      expect(r.yearsToFi).toBeCloseTo(expected, 2);
      expect(r.yearsToFi).toBeLessThan(5);
    });

    it("high savings rate produces shorter timeline than low savings rate", () => {
      const high = calcTimeToFi({ income: 100_000, savingsRate: 70, expectedReturn: 7, withdrawalRate: 4 });
      const low  = calcTimeToFi({ income: 100_000, savingsRate: 20, expectedReturn: 7, withdrawalRate: 4 });
      expect(high.yearsToFi).toBeLessThan(low.yearsToFi);
    });

    it("long but finite timeline on low savings rate", () => {
      const r = calcTimeToFi({ income: 100_000, savingsRate: 10, expectedReturn: 7, withdrawalRate: 4 });
      expect(isFinite(r.yearsToFi)).toBe(true);
      expect(r.yearsToFi).toBeGreaterThan(30);
    });

    it("all result fields are finite on typical inputs", () => {
      const r = calcTimeToFi({ income: 100_000, savingsRate: 40, expectedReturn: 7, withdrawalRate: 4 });
      expect(isFinite(r.annualSavings)).toBe(true);
      expect(isFinite(r.annualExpenses)).toBe(true);
      expect(isFinite(r.targetPortfolio)).toBe(true);
      expect(isFinite(r.yearsToFi)).toBe(true);
    });
  });
});
