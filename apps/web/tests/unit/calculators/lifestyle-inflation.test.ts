import { describe, it, expect } from "vitest";
import { calcLifestyleInflation } from "@/lib/calculators/lifestyle-inflation";

// Formula: FV of ordinary annuity  fvAnnuity(pmt, r, n) = pmt * ((1+r)^n − 1) / r
//   bankScenarioFV  = fvAnnuity(raise, r, n)      — full raise invested
//   creepScenarioFV = fvAnnuity(bankAmount, r, n)  — only non-spent portion invested
// All expected values derived from the formula, not from function output.

function fvAnnuity(pmt: number, r: number, n: number): number {
  if (r === 0) return pmt * n;
  return pmt * ((Math.pow(1 + r, n) - 1) / r);
}

describe("calcLifestyleInflation", () => {
  describe("hand-verifiable spot-check", () => {
    it("$10k raise, 50% creep, 10yr, 7% → bankScenarioFV ≈ $138,164", () => {
      // creepAmount=$5k, bankAmount=$5k
      // bankScenarioFV = 10000 * ((1.07^10 − 1) / 0.07) ≈ 138,164
      // creepScenarioFV = 5000 * same factor ≈ 69,082
      const expectedBank = fvAnnuity(10000, 0.07, 10);
      const expectedCreep = fvAnnuity(5000, 0.07, 10);
      const r = calcLifestyleInflation({ raise: 10000, creepPct: 50, years: 10, returnRate: 7 });
      expect(r.bankScenarioFV).toBeCloseTo(expectedBank, 2);
      expect(r.creepScenarioFV).toBeCloseTo(expectedCreep, 2);
      expect(r.bankScenarioFV).toBeCloseTo(138164, 0);
      expect(r.opportunityCost).toBeCloseTo(expectedBank - expectedCreep, 2);
    });
  });

  describe("creepAmount and bankAmount split", () => {
    it("50% creep splits raise evenly", () => {
      const r = calcLifestyleInflation({ raise: 1000, creepPct: 50, years: 10, returnRate: 7 });
      expect(r.creepAmount).toBeCloseTo(500, 4);
      expect(r.bankAmount).toBeCloseTo(500, 4);
    });

    it("30% creep: creepAmount=300, bankAmount=700 on $1k raise", () => {
      const r = calcLifestyleInflation({ raise: 1000, creepPct: 30, years: 10, returnRate: 7 });
      expect(r.creepAmount).toBeCloseTo(300, 4);
      expect(r.bankAmount).toBeCloseTo(700, 4);
    });
  });

  describe("totalCreepSpend", () => {
    it("totalCreepSpend = creepAmount × years", () => {
      const r = calcLifestyleInflation({ raise: 1000, creepPct: 30, years: 10, returnRate: 7 });
      expect(r.totalCreepSpend).toBeCloseTo(300 * 10, 4);
    });
  });

  describe("edge cases", () => {
    it("0% creep: no opportunity cost (all raise banked)", () => {
      const r = calcLifestyleInflation({ raise: 1000, creepPct: 0, years: 10, returnRate: 7 });
      expect(r.creepAmount).toBeCloseTo(0, 4);
      expect(r.bankAmount).toBeCloseTo(1000, 4);
      expect(r.opportunityCost).toBeCloseTo(0, 2);
      // creepScenarioFV = bankScenarioFV when no creep
      expect(r.creepScenarioFV).toBeCloseTo(r.bankScenarioFV, 2);
    });

    it("100% creep: all raise spent, maximum opportunity cost", () => {
      const r = calcLifestyleInflation({ raise: 1000, creepPct: 100, years: 10, returnRate: 7 });
      expect(r.bankAmount).toBeCloseTo(0, 4);
      expect(r.creepScenarioFV).toBeCloseTo(0, 4);
      expect(r.opportunityCost).toBeCloseTo(r.bankScenarioFV, 2);
    });

    it("0% return: FV = pmt × n (no compounding)", () => {
      // bankScenarioFV = 1000 * 5 = 5000; creepScenarioFV = 500 * 5 = 2500
      const r = calcLifestyleInflation({ raise: 1000, creepPct: 50, years: 5, returnRate: 0 });
      expect(r.bankScenarioFV).toBeCloseTo(5000, 4);
      expect(r.creepScenarioFV).toBeCloseTo(2500, 4);
      expect(r.opportunityCost).toBeCloseTo(2500, 4);
    });

    it("all results finite (no NaN) on typical inputs", () => {
      const r = calcLifestyleInflation({ raise: 5000, creepPct: 40, years: 20, returnRate: 7 });
      for (const v of Object.values(r)) expect(isFinite(v)).toBe(true);
    });
  });
});
