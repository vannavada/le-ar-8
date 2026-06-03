import { describe, it, expect } from "vitest";
import { calcCrossBorderProperty } from "@/lib/calculators/crossborder-property";

// All expected values derived from the formulas, not from function output.
//
// capitalUsd          = propertyPriceInr / usdToInr
// propertyFvInr       = propertyPriceInr * (1 + appreciation/100)^n
// totalRentalInr      = propertyPriceInr * rentalYield/100 * n   (flat annuity)
// indiaTotalInr       = propertyFvInr + totalRentalInr
// indiaAfterFriction  = indiaTotalInr * (1 - friction/100)
// indiaFvUsd          = indiaAfterFriction / usdToInr
// usFvUsd             = capitalUsd * (1 + usReturn/100)^n

const BASE = {
  propertyPriceInr: 10_000_000,  // ₹1 crore
  usdToInr: 84,
  rentalYieldPct: 3.5,
  propertyAppreciationPct: 5,
  repatriationFrictionPct: 5,
  usReturnPct: 7,
  years: 10,
};

describe("calcCrossBorderProperty", () => {
  describe("hand-verifiable spot-check (code comment values)", () => {
    it("₹1Cr, 5% appreciation, 3.5% yield, 5% friction, 7% US, 10yr", () => {
      const r = calcCrossBorderProperty(BASE);

      const capitalUsd     = 10_000_000 / 84;
      const propertyFvInr  = 10_000_000 * Math.pow(1.05, 10);
      const totalRentalInr = 10_000_000 * 0.035 * 10;
      const indiaTotalInr  = propertyFvInr + totalRentalInr;
      const indiaAfterFric = indiaTotalInr * 0.95;
      const indiaFvUsd     = indiaAfterFric / 84;
      const usFvUsd        = capitalUsd * Math.pow(1.07, 10);

      expect(r.capitalUsd).toBeCloseTo(capitalUsd, 2);
      expect(r.propertyFvInr).toBeCloseTo(propertyFvInr, 2);
      expect(r.totalRentalInr).toBeCloseTo(totalRentalInr, 2);
      expect(r.indiaAfterFrictionInr).toBeCloseTo(indiaAfterFric, 2);
      expect(r.indiaFvUsd).toBeCloseTo(indiaFvUsd, 2);
      expect(r.usFvUsd).toBeCloseTo(usFvUsd, 2);
    });
  });

  describe("winner detection", () => {
    it("high appreciation + rental beats modest US return → India wins", () => {
      // 10% appreciation + 5% yield vs 7% US should favor India
      const r = calcCrossBorderProperty({
        ...BASE,
        propertyAppreciationPct: 10,
        rentalYieldPct: 5,
        repatriationFrictionPct: 0,
      });
      expect(r.winner).toBe("india");
    });

    it("zero appreciation + zero rental → US wins (friction kills India)", () => {
      const r = calcCrossBorderProperty({
        ...BASE,
        propertyAppreciationPct: 0,
        rentalYieldPct: 0,
        repatriationFrictionPct: 5,
      });
      // India FV = propertyPrice * 0.95 / usdToInr = capitalUsd * 0.95 < capitalUsd < usFvUsd
      expect(r.winner).toBe("us");
      expect(r.indiaFvUsd).toBeLessThan(r.capitalUsd);
    });
  });

  describe("capitalUsd", () => {
    it("capitalUsd = propertyPriceInr / usdToInr", () => {
      const r = calcCrossBorderProperty(BASE);
      expect(r.capitalUsd).toBeCloseTo(10_000_000 / 84, 2);
    });
  });

  describe("rental income", () => {
    it("totalRentalInr = price * yieldPct/100 * years (flat annuity)", () => {
      const r = calcCrossBorderProperty(BASE);
      expect(r.totalRentalInr).toBeCloseTo(10_000_000 * 0.035 * 10, 4);
    });

    it("0% rental yield → totalRentalInr = 0", () => {
      const r = calcCrossBorderProperty({ ...BASE, rentalYieldPct: 0 });
      expect(r.totalRentalInr).toBeCloseTo(0, 4);
    });
  });

  describe("repatriation friction", () => {
    it("0% friction → indiaAfterFriction = indiaTotalInr", () => {
      const r = calcCrossBorderProperty({ ...BASE, repatriationFrictionPct: 0 });
      expect(r.indiaAfterFrictionInr).toBeCloseTo(r.indiaTotalInr, 2);
    });

    it("100% friction → indiaFvUsd = 0", () => {
      const r = calcCrossBorderProperty({ ...BASE, repatriationFrictionPct: 100 });
      expect(r.indiaFvUsd).toBeCloseTo(0, 2);
    });
  });

  describe("annualized return", () => {
    it("annualizedIndiaReturnPct is a CAGR: (indiaFvUsd/capitalUsd)^(1/n) - 1", () => {
      const r = calcCrossBorderProperty(BASE);
      const expectedCagr = (Math.pow(r.indiaFvUsd / r.capitalUsd, 1 / 10) - 1) * 100;
      expect(r.annualizedIndiaReturnPct).toBeCloseTo(expectedCagr, 4);
    });

    it("annualizedUsReturnPct equals input usReturnPct", () => {
      const r = calcCrossBorderProperty(BASE);
      expect(r.annualizedUsReturnPct).toBeCloseTo(7, 4);
    });
  });

  describe("edge cases", () => {
    it("years=0 → usFvUsd = capitalUsd (no growth)", () => {
      const r = calcCrossBorderProperty({ ...BASE, years: 0 });
      expect(r.usFvUsd).toBeCloseTo(r.capitalUsd, 2);
      expect(r.totalRentalInr).toBeCloseTo(0, 4);
    });

    it("all results finite on typical inputs", () => {
      const r = calcCrossBorderProperty(BASE);
      expect(isFinite(r.indiaFvUsd)).toBe(true);
      expect(isFinite(r.usFvUsd)).toBe(true);
      expect(isFinite(r.annualizedIndiaReturnPct)).toBe(true);
      expect(isFinite(r.differenceUsd)).toBe(true);
    });

    it("differenceUsd is non-negative", () => {
      const r = calcCrossBorderProperty(BASE);
      expect(r.differenceUsd).toBeGreaterThanOrEqual(0);
    });
  });
});
