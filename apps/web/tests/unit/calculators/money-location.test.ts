import { describe, it, expect } from "vitest";
import { calcMoneyLocation } from "@/lib/calculators/money-location";

// All expected values derived from the formulas, not from function output.
//
// India FV (USD):
//   indiaFvInr  = amountUsd * usdToInr * (1 + indiaNetRate/100)^n
//   futureRate  = usdToInr * (1 + fxTrend/100)^n
//   indiaFvUsd  = indiaFvInr / futureRate
//
// US FV (USD):
//   usFvUsd = amountUsd * (1 + usNetRate/100)^n
//
// indiaNetRate = indiaFdRate * (1 - indiaTax/100)
// usNetRate    = usReturn   * (1 - usTax/100)

const BASE = {
  amountUsd: 1000,
  usdToInr: 84,
  fxTrendPctPerYear: 0,
  usReturnPct: 7,
  indiaFdRatePct: 7,
  usTaxPct: 0,
  indiaTaxPct: 0,
  years: 10,
};

describe("calcMoneyLocation", () => {
  describe("tie condition — same net rates, no FX trend", () => {
    it("equal rates, no taxes, no FX trend → tie (hand-verifiable)", () => {
      // indiaNetRate = 7, usNetRate = 7
      // indiaFvInr = 1000*84 * 1.07^10 = 84000 * 1.9672 ≈ 165,245
      // futureRate = 84 (fxTrend=0)
      // indiaFvUsd = 165,245/84 = 1000 * 1.07^10 = usFvUsd → tie
      const r = calcMoneyLocation(BASE);
      expect(r.winner).toBe("tie");
      expect(r.indiaFvUsd).toBeCloseTo(r.usFvUsd, 2);
      expect(r.usFvUsd).toBeCloseTo(1000 * Math.pow(1.07, 10), 2);
    });
  });

  describe("India wins — higher rate, no FX headwind", () => {
    it("India 9% vs US 7%, no tax, no FX trend → India wins", () => {
      const r = calcMoneyLocation({ ...BASE, indiaFdRatePct: 9 });
      const expectedIndiaFvUsd = 1000 * Math.pow(1.09, 10); // no FX change
      const expectedUsFvUsd    = 1000 * Math.pow(1.07, 10);
      expect(r.indiaFvUsd).toBeCloseTo(expectedIndiaFvUsd, 2);
      expect(r.usFvUsd).toBeCloseTo(expectedUsFvUsd, 2);
      expect(r.winner).toBe("india");
    });
  });

  describe("US wins — FX headwind erodes India advantage", () => {
    it("India 7%, US 7%, no tax, FX trend +3%/yr → US wins", () => {
      // futureRate = 84 * 1.03^10 ≈ 112.85
      // indiaFvInr = 84000 * 1.07^10 ≈ 165,245
      // indiaFvUsd = 165,245 / 112.85 ≈ 1,464 < usFvUsd 1,967 → US wins
      const r = calcMoneyLocation({ ...BASE, fxTrendPctPerYear: 3 });
      const futureRate = 84 * Math.pow(1.03, 10);
      const expectedIndiaFvUsd = (1000 * 84 * Math.pow(1.07, 10)) / futureRate;
      const expectedUsFvUsd    = 1000 * Math.pow(1.07, 10);
      expect(r.indiaFvUsd).toBeCloseTo(expectedIndiaFvUsd, 2);
      expect(r.winner).toBe("us");
      expect(r.indiaFvUsd).toBeLessThan(expectedUsFvUsd);
    });
  });

  describe("tax impact", () => {
    it("both taxed at 25% — tie still holds when rates equal", () => {
      const r = calcMoneyLocation({ ...BASE, usTaxPct: 25, indiaTaxPct: 25 });
      // indiaNetRate = 7 * 0.75 = 5.25;  usNetRate = 7 * 0.75 = 5.25
      // no FX trend → tie
      expect(r.winner).toBe("tie");
      expect(r.indiaNetRatePct).toBeCloseTo(5.25, 4);
      expect(r.usNetRatePct).toBeCloseTo(5.25, 4);
    });

    it("higher India tax flips winner when rates were equal", () => {
      // India 7% taxed 30% → net 4.9% vs US 7% untaxed → US wins
      const r = calcMoneyLocation({ ...BASE, indiaTaxPct: 30 });
      const indiaNetRate = 7 * (1 - 30 / 100); // 4.9
      const expectedIndiaFvUsd = 1000 * Math.pow(1 + indiaNetRate / 100, 10);
      const expectedUsFvUsd    = 1000 * Math.pow(1.07, 10);
      expect(r.indiaNetRatePct).toBeCloseTo(4.9, 4);
      expect(r.indiaFvUsd).toBeCloseTo(expectedIndiaFvUsd, 2);
      expect(r.winner).toBe("us");
    });
  });

  describe("amountInr and futureUsdToInr", () => {
    it("amountInr = amountUsd * usdToInr", () => {
      const r = calcMoneyLocation(BASE);
      expect(r.amountInr).toBeCloseTo(1000 * 84, 4);
    });

    it("futureUsdToInr = usdToInr * (1 + fxTrend/100)^years", () => {
      const r = calcMoneyLocation({ ...BASE, fxTrendPctPerYear: 2 });
      expect(r.futureUsdToInr).toBeCloseTo(84 * Math.pow(1.02, 10), 4);
    });

    it("fxTrend=0 → futureUsdToInr = usdToInr (unchanged)", () => {
      const r = calcMoneyLocation(BASE);
      expect(r.futureUsdToInr).toBeCloseTo(84, 4);
    });
  });

  describe("edge cases — no NaN, no Infinity", () => {
    it("years=0 → both FVs equal amountUsd", () => {
      const r = calcMoneyLocation({ ...BASE, years: 0 });
      expect(r.usFvUsd).toBeCloseTo(1000, 4);
      expect(r.indiaFvUsd).toBeCloseTo(1000, 4);
    });

    it("0% rates → both FVs equal initial (after FX round-trip)", () => {
      const r = calcMoneyLocation({
        ...BASE,
        usReturnPct: 0, indiaFdRatePct: 0,
        usTaxPct: 0, indiaTaxPct: 0, fxTrendPctPerYear: 0,
      });
      expect(r.usFvUsd).toBeCloseTo(1000, 4);
      expect(r.indiaFvUsd).toBeCloseTo(1000, 4);
    });

    it("all results finite on typical inputs", () => {
      const r = calcMoneyLocation({ ...BASE, fxTrendPctPerYear: 2.5, indiaTaxPct: 30 });
      expect(isFinite(r.indiaFvUsd)).toBe(true);
      expect(isFinite(r.usFvUsd)).toBe(true);
      expect(isFinite(r.differenceUsd)).toBe(true);
    });

    it("differencePct is non-negative", () => {
      const r = calcMoneyLocation({ ...BASE, indiaFdRatePct: 9 });
      expect(r.differencePct).toBeGreaterThanOrEqual(0);
    });
  });
});
