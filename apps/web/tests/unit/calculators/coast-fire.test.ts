import { describe, it, expect } from "vitest";
import { calcCoastFire } from "@/lib/calculators/coast-fire";

// Formulas:
//   coastNumber = targetNumber / (1 + r)^(retirementAge − currentAge)
//   yearsToCoast = ln(coastNumber / currentPortfolio) / ln(1 + r)
//   projectedValueAtRetirement = currentPortfolio * (1 + r)^n
// All expected values derived from the formulas, not from function output.

describe("calcCoastFire", () => {
  describe("hand-verifiable spot-checks (code comments)", () => {
    it("$200k, 7%, age 35→65, target $1M → already coasted", () => {
      // coastNumber = 1,000,000 / 1.07^30 ≈ $131,367
      const expectedCoast = 1_000_000 / Math.pow(1.07, 30);
      const r = calcCoastFire({
        currentPortfolio: 200_000,
        expectedReturn: 7,
        currentAge: 35,
        retirementAge: 65,
        targetNumber: 1_000_000,
      });
      expect(r.coastNumber).toBeCloseTo(expectedCoast, 2);
      expect(r.coastNumber).toBeCloseTo(131_367, 0);
      expect(r.hasCoasted).toBe(true);
      expect(r.surplus).toBeCloseTo(200_000 - expectedCoast, 2);
      expect(r.yearsToCoast).toBeNull();
      expect(r.coastAge).toBeNull();
    });

    it("$200k, 7%, age 35→65 → projectedValueAtRetirement ≈ $1,522,451", () => {
      const expected = 200_000 * Math.pow(1.07, 30);
      const r = calcCoastFire({
        currentPortfolio: 200_000,
        expectedReturn: 7,
        currentAge: 35,
        retirementAge: 65,
        targetNumber: 1_000_000,
      });
      expect(r.projectedValueAtRetirement).toBeCloseTo(expected, 2);
      expect(r.projectedValueAtRetirement).toBeCloseTo(1_522_451, 0);
    });

    it("$50k, 7%, age 35→65, target $1M → not coasted, yearsToCoast ≈ 14.3yr", () => {
      const coastNumber = 1_000_000 / Math.pow(1.07, 30);
      const expectedYears = Math.log(coastNumber / 50_000) / Math.log(1.07);
      const r = calcCoastFire({
        currentPortfolio: 50_000,
        expectedReturn: 7,
        currentAge: 35,
        retirementAge: 65,
        targetNumber: 1_000_000,
      });
      expect(r.hasCoasted).toBe(false);
      expect(r.yearsToCoast).not.toBeNull();
      expect(r.yearsToCoast!).toBeCloseTo(expectedYears, 2);
      expect(r.yearsToCoast!).toBeCloseTo(14.3, 0);
      expect(r.coastAge!).toBeCloseTo(35 + expectedYears, 2);
    });
  });

  describe("edge cases", () => {
    it("0% return: coastNumber equals targetNumber (no growth)", () => {
      const r = calcCoastFire({
        currentPortfolio: 50_000,
        expectedReturn: 0,
        currentAge: 35,
        retirementAge: 65,
        targetNumber: 100_000,
      });
      expect(r.coastNumber).toBeCloseTo(100_000, 2);
      // yearsToCoast is null because r=0 in the condition guard
      expect(r.yearsToCoast).toBeNull();
    });

    it("at retirement age: coastNumber = targetNumber, projectedValue = currentPortfolio", () => {
      const r = calcCoastFire({
        currentPortfolio: 200_000,
        expectedReturn: 7,
        currentAge: 65,
        retirementAge: 65,
        targetNumber: 1_000_000,
      });
      expect(r.coastNumber).toBeCloseTo(1_000_000, 2);
      expect(r.projectedValueAtRetirement).toBeCloseTo(200_000, 2);
      expect(r.hasCoasted).toBe(false);
    });

    it("zero portfolio: yearsToCoast is null (can't compute log of zero)", () => {
      const r = calcCoastFire({
        currentPortfolio: 0,
        expectedReturn: 7,
        currentAge: 35,
        retirementAge: 65,
        targetNumber: 1_000_000,
      });
      expect(r.yearsToCoast).toBeNull();
      expect(r.coastAge).toBeNull();
    });

    it("very small portfolio: yearsToCoast > yearsToRetirement → coastAge is null", () => {
      // With $1k at 7% and only 30yr to retirement, it can never reach the coast number in time
      const r = calcCoastFire({
        currentPortfolio: 1_000,
        expectedReturn: 7,
        currentAge: 35,
        retirementAge: 65,
        targetNumber: 1_000_000,
      });
      // yearsToCoast would be ~72yr, which exceeds the 30yr window
      expect(r.hasCoasted).toBe(false);
      expect(r.yearsToCoast).not.toBeNull();
      expect(r.coastAge).toBeNull(); // out of the retirement window
    });

    it("surplus is negative when not coasted", () => {
      const r = calcCoastFire({
        currentPortfolio: 50_000,
        expectedReturn: 7,
        currentAge: 35,
        retirementAge: 65,
        targetNumber: 1_000_000,
      });
      expect(r.surplus).toBeLessThan(0);
    });

    it("all numeric results are finite on typical inputs", () => {
      const r = calcCoastFire({
        currentPortfolio: 100_000,
        expectedReturn: 7,
        currentAge: 40,
        retirementAge: 65,
        targetNumber: 1_000_000,
      });
      expect(isFinite(r.coastNumber)).toBe(true);
      expect(isFinite(r.surplus)).toBe(true);
      expect(isFinite(r.projectedValueAtRetirement)).toBe(true);
    });
  });
});
