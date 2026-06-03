import { describe, it, expect } from "vitest";
import { calcRealReturn } from "@/lib/calculators/real-return";

// Formulas:
//   afterTaxNominal = nominalReturn * (1 - taxRate / 100)
//   realReturn      = ((1 + afterTaxNominal/100) / (1 + inflationRate/100) - 1) * 100  [Fisher eq.]
// All expected values derived from the formulas, not from function output.

describe("calcRealReturn", () => {
  describe("hand-verifiable spot-checks", () => {
    it("10% nominal / 3% inflation / 25% tax → real return ≈ 4.369%", () => {
      // afterTaxNominal = 10 * 0.75 = 7.5%
      // realReturn = (1.075 / 1.03 − 1) * 100 = 4.3689...%
      const r = calcRealReturn({ nominalReturn: 10, inflationRate: 3, taxRate: 25 });
      expect(r.afterTaxNominal).toBeCloseTo(7.5, 4);
      expect(r.realReturn).toBeCloseTo(4.369, 2);
      expect(r.taxDrag).toBeCloseTo(2.5, 4);
      expect(r.inflationDrag).toBeCloseTo(3, 4);
    });

    it("3% nominal / 3% inflation / 20% tax → slightly negative real return", () => {
      // afterTaxNominal = 3 * 0.8 = 2.4%
      // realReturn = (1.024 / 1.03 − 1) * 100 ≈ −0.583%
      const r = calcRealReturn({ nominalReturn: 3, inflationRate: 3, taxRate: 20 });
      expect(r.afterTaxNominal).toBeCloseTo(2.4, 4);
      expect(r.realReturn).toBeCloseTo(-0.583, 2);
    });
  });

  describe("edge cases", () => {
    it("0% nominal / 2% inflation / 0% tax → real return ≈ −1.961%", () => {
      // afterTaxNominal = 0%
      // realReturn = (1.0 / 1.02 − 1) * 100 = −1.9608%
      const r = calcRealReturn({ nominalReturn: 0, inflationRate: 2, taxRate: 0 });
      expect(r.afterTaxNominal).toBeCloseTo(0, 4);
      expect(r.realReturn).toBeCloseTo(-1.961, 2);
    });

    it("8% nominal / 0% inflation / 0% tax → real return = 8% (no drag)", () => {
      // afterTaxNominal = 8, realReturn = (1.08 / 1.0 − 1)*100 = 8%
      const r = calcRealReturn({ nominalReturn: 8, inflationRate: 0, taxRate: 0 });
      expect(r.afterTaxNominal).toBeCloseTo(8, 4);
      expect(r.realReturn).toBeCloseTo(8, 4);
    });

    it("6% nominal / 5% inflation / 20% tax → near-zero real return", () => {
      // afterTaxNominal = 6 * 0.8 = 4.8%
      // realReturn = (1.048 / 1.05 − 1) * 100 ≈ −0.190%
      const afterTax = 6 * (1 - 20 / 100);
      const expected = ((1 + afterTax / 100) / (1 + 5 / 100) - 1) * 100;
      const r = calcRealReturn({ nominalReturn: 6, inflationRate: 5, taxRate: 20 });
      expect(r.realReturn).toBeCloseTo(expected, 4);
      expect(r.realReturn).toBeCloseTo(-0.190, 2);
    });

    it("result fields are all finite numbers (no NaN)", () => {
      const r = calcRealReturn({ nominalReturn: 7, inflationRate: 2, taxRate: 15 });
      expect(isFinite(r.afterTaxNominal)).toBe(true);
      expect(isFinite(r.realReturn)).toBe(true);
      expect(isFinite(r.taxDrag)).toBe(true);
      expect(isFinite(r.inflationDrag)).toBe(true);
    });
  });

  describe("Fisher equation vs. simple subtraction", () => {
    it("Fisher drag is always slightly larger than simple subtraction at high rates", () => {
      // Simple subtraction would give: afterTaxNominal − inflation = 7.5 − 3 = 4.5%
      // Fisher gives ≈ 4.369%, which is less (correct, more conservative)
      const r = calcRealReturn({ nominalReturn: 10, inflationRate: 3, taxRate: 25 });
      const simpleSub = r.afterTaxNominal - 3;
      expect(r.realReturn).toBeLessThan(simpleSub);
    });
  });
});
