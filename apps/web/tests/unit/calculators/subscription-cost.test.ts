import { describe, it, expect } from "vitest";
import { calcSubscriptionCost } from "@/lib/calculators/subscription-cost";

// Formula: opportunityCost = annualCost * ((1+r)^n − 1) / r  (FV of ordinary annuity)
//          annualCost = cost*12 (monthly) or cost (annual)
// All expected values derived from the formula, not from function output.

describe("calcSubscriptionCost", () => {
  describe("monthly subscription — period conversion", () => {
    it("$15/mo → annualCost = $180", () => {
      const r = calcSubscriptionCost({ cost: 15, period: "monthly", returnRate: 7, years: 20 });
      expect(r.annualCost).toBeCloseTo(180, 4);
    });

    it("$15/mo, 7%, 20yr → opportunityCost ≈ $7,379.17 (hand-verifiable)", () => {
      // FV annuity: 180 * ((1.07^20 − 1) / 0.07)
      const fv = 180 * ((Math.pow(1.07, 20) - 1) / 0.07);
      const r = calcSubscriptionCost({ cost: 15, period: "monthly", returnRate: 7, years: 20 });
      expect(r.opportunityCost).toBeCloseTo(fv, 2);
      expect(r.opportunityCost).toBeCloseTo(7379, 0);
      expect(r.totalPaid).toBeCloseTo(3600, 4);
    });
  });

  describe("annual subscription", () => {
    it("$200/yr → annualCost = $200", () => {
      const r = calcSubscriptionCost({ cost: 200, period: "annual", returnRate: 5, years: 10 });
      expect(r.annualCost).toBeCloseTo(200, 4);
    });

    it("$200/yr, 5%, 10yr → opportunityCost matches FV annuity formula", () => {
      // FV = 200 * ((1.05^10 − 1) / 0.05)
      const fv = 200 * ((Math.pow(1.05, 10) - 1) / 0.05);
      const r = calcSubscriptionCost({ cost: 200, period: "annual", returnRate: 5, years: 10 });
      expect(r.opportunityCost).toBeCloseTo(fv, 2);
      expect(r.totalPaid).toBeCloseTo(2000, 4);
    });
  });

  describe("edge cases — zero rate", () => {
    it("0% return: opportunityCost = totalPaid (no compounding)", () => {
      const r = calcSubscriptionCost({ cost: 100, period: "annual", returnRate: 0, years: 5 });
      expect(r.opportunityCost).toBeCloseTo(r.totalPaid, 4);
      expect(r.opportunityCost).toBeCloseTo(500, 4);
    });
  });

  describe("costPerDay", () => {
    it("$365/yr → costPerDay = 1.00", () => {
      const r = calcSubscriptionCost({ cost: 365, period: "annual", returnRate: 7, years: 10 });
      expect(r.costPerDay).toBeCloseTo(1.0, 4);
    });

    it("$12/mo → annualCost=$144 → costPerDay = 144/365", () => {
      const r = calcSubscriptionCost({ cost: 12, period: "monthly", returnRate: 7, years: 10 });
      expect(r.costPerDay).toBeCloseTo(144 / 365, 4);
    });
  });

  describe("edge cases — zero years and long horizons", () => {
    it("0 years: totalPaid = 0, opportunityCost = 0", () => {
      const r = calcSubscriptionCost({ cost: 50, period: "monthly", returnRate: 7, years: 0 });
      expect(r.totalPaid).toBeCloseTo(0, 4);
      expect(r.opportunityCost).toBeCloseTo(0, 4);
    });

    it("40-year horizon produces finite result", () => {
      const r = calcSubscriptionCost({ cost: 10, period: "monthly", returnRate: 7, years: 40 });
      expect(isFinite(r.opportunityCost)).toBe(true);
      expect(r.opportunityCost).toBeGreaterThan(r.totalPaid);
    });
  });
});
