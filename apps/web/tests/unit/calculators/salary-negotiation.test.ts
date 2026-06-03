import { describe, it, expect } from "vitest";
import { calcSalaryNegotiation } from "@/lib/calculators/salary-negotiation";

// Formulas:
//   totalExtraEarned (g>0): raise * ((1+g)^n − 1) / g
//   totalExtraEarned (g=0): raise * n
//   investedFV (r≠g): raise * (1+r) * ((1+r)^n − (1+g)^n) / (r − g)
//   investedFV (r=g):  raise * n * (1+r)^n
// All expected values derived from the formulas, not from function output.

describe("calcSalaryNegotiation", () => {
  describe("hand-verifiable spot-check (code comment)", () => {
    it("$5k raise, 20yr, 3% growth, 7% return → totalExtraEarned ≈ $134,352", () => {
      // totalExtraEarned = 5000 * (1.03^20 − 1) / 0.03
      const expected = 5000 * ((Math.pow(1.03, 20) - 1) / 0.03);
      const r = calcSalaryNegotiation({
        raise: 5000,
        yearsRemaining: 20,
        salaryGrowth: 3,
        investmentReturn: 7,
      });
      expect(r.totalExtraEarned).toBeCloseTo(expected, 2);
      expect(r.totalExtraEarned).toBeCloseTo(134_352, 0);
    });

    it("$5k raise, 20yr, 3% growth, 7% return → investedFV ≈ $276,003", () => {
      // investedFV = 5000 * 1.07 * (1.07^20 − 1.03^20) / (0.07 − 0.03)
      const expected =
        5000 * 1.07 * (Math.pow(1.07, 20) - Math.pow(1.03, 20)) / (0.07 - 0.03);
      const r = calcSalaryNegotiation({
        raise: 5000,
        yearsRemaining: 20,
        salaryGrowth: 3,
        investmentReturn: 7,
      });
      expect(r.investedFV).toBeCloseTo(expected, 2);
      expect(r.investedFV).toBeCloseTo(276_003, 0);
    });
  });

  describe("firstYearExtra and finalYearExtra", () => {
    it("firstYearExtra always equals raise", () => {
      const r = calcSalaryNegotiation({
        raise: 8000,
        yearsRemaining: 15,
        salaryGrowth: 3,
        investmentReturn: 7,
      });
      expect(r.firstYearExtra).toBe(8000);
    });

    it("finalYearExtra = raise * (1+g)^(n−1)", () => {
      // raise=$1000, n=5, g=3%: finalYearExtra = 1000 * 1.03^4
      const expected = 1000 * Math.pow(1.03, 4);
      const r = calcSalaryNegotiation({
        raise: 1000,
        yearsRemaining: 5,
        salaryGrowth: 3,
        investmentReturn: 7,
      });
      expect(r.finalYearExtra).toBeCloseTo(expected, 2);
      expect(r.finalYearExtra).toBeCloseTo(1125.51, 1);
    });
  });

  describe("edge cases", () => {
    it("0 years remaining: investedFV = 0, totalExtraEarned = 0", () => {
      const r = calcSalaryNegotiation({
        raise: 5000,
        yearsRemaining: 0,
        salaryGrowth: 3,
        investmentReturn: 7,
      });
      expect(r.investedFV).toBeCloseTo(0, 4);
      expect(r.totalExtraEarned).toBeCloseTo(0, 4);
    });

    it("r = g (special degenerate case): investedFV = raise * n * (1+r)^n", () => {
      // raise=$1000, n=10, g=r=5%: investedFV = 1000 * 10 * 1.05^10
      const expected = 1000 * 10 * Math.pow(1.05, 10);
      const r = calcSalaryNegotiation({
        raise: 1000,
        yearsRemaining: 10,
        salaryGrowth: 5,
        investmentReturn: 5,
      });
      expect(r.investedFV).toBeCloseTo(expected, 2);
      expect(r.investedFV).toBeCloseTo(16_289, 0);
    });

    it("g = 0 (flat salary): totalExtraEarned = raise * n", () => {
      const r = calcSalaryNegotiation({
        raise: 1000,
        yearsRemaining: 5,
        salaryGrowth: 0,
        investmentReturn: 7,
      });
      expect(r.totalExtraEarned).toBeCloseTo(1000 * 5, 4);
    });

    it("g = 0, r = 7%: investedFV = raise*(1+r)*((1+r)^n − 1)/r", () => {
      // raise=$1000, n=5, g=0, r=7%
      const expected = 1000 * 1.07 * (Math.pow(1.07, 5) - 1) / 0.07;
      const r = calcSalaryNegotiation({
        raise: 1000,
        yearsRemaining: 5,
        salaryGrowth: 0,
        investmentReturn: 7,
      });
      expect(r.investedFV).toBeCloseTo(expected, 2);
      expect(r.investedFV).toBeCloseTo(6153, 0);
    });

    it("investedFV > totalExtraEarned when return > 0", () => {
      const r = calcSalaryNegotiation({
        raise: 5000,
        yearsRemaining: 20,
        salaryGrowth: 3,
        investmentReturn: 7,
      });
      expect(r.investedFV).toBeGreaterThan(r.totalExtraEarned);
    });

    it("all results finite on typical inputs", () => {
      const r = calcSalaryNegotiation({
        raise: 10000,
        yearsRemaining: 30,
        salaryGrowth: 3,
        investmentReturn: 7,
      });
      expect(isFinite(r.investedFV)).toBe(true);
      expect(isFinite(r.totalExtraEarned)).toBe(true);
    });
  });
});
