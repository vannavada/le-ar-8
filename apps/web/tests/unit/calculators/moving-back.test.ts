import { describe, it, expect } from "vitest";
import { calcMovingBack } from "@/lib/calculators/moving-back";

// All expected values derived from the formulas, not from function output.
//
// salaryInrDirect              = usSalaryUsd * usdToInr
// equivalentIndiaAnnualCostUsd = usSalaryUsd * colRatio
// equivalentIndiaAnnualCostInr = equivalentIndiaAnnualCostUsd * usdToInr
// equivalentIndiaMonthlyBudget = equivalentIndiaAnnualCostInr / 12
// purchasingPowerMultiple      = 1 / colRatio
// annualSavingByMovingUsd      = usSalaryUsd - equivalentIndiaAnnualCostUsd
// savingsRunwayYears           = (usSavingsUsd * usdToInr) / equivalentIndiaAnnualCostInr

const BASE = {
  usSalaryUsd: 100_000,
  usdToInr: 84,
  colRatio: 0.35,
};

describe("calcMovingBack", () => {
  describe("hand-verifiable spot-check (code comment values)", () => {
    it("$100k salary, 84 INR/USD, 35% COL ratio", () => {
      const r = calcMovingBack({ ...BASE, usSavingsUsd: 500_000 });

      expect(r.salaryInrDirect).toBeCloseTo(8_400_000, 0);
      expect(r.equivalentIndiaAnnualCostUsd).toBeCloseTo(35_000, 2);
      expect(r.equivalentIndiaAnnualCostInr).toBeCloseTo(2_940_000, 0);
      expect(r.equivalentIndiaMonthlyBudgetInr).toBeCloseTo(245_000, 0);
      expect(r.purchasingPowerMultiple).toBeCloseTo(1 / 0.35, 4);
      expect(r.annualSavingByMovingUsd).toBeCloseTo(65_000, 2);

      // Savings runway: 500k * 84 / 2,940,000 = 42,000,000 / 2,940,000
      expect(r.savingsInInr).toBeCloseTo(42_000_000, 0);
      expect(r.savingsRunwayYears).toBeCloseTo(42_000_000 / 2_940_000, 4);
      expect(r.savingsRunwayYears).toBeCloseTo(14.286, 2);
    });
  });

  describe("COL ratio variants", () => {
    it("colRatio=1 → equivalent India cost equals US salary, 1× multiple", () => {
      const r = calcMovingBack({ ...BASE, colRatio: 1 });
      expect(r.equivalentIndiaAnnualCostUsd).toBeCloseTo(100_000, 2);
      expect(r.purchasingPowerMultiple).toBeCloseTo(1, 4);
      expect(r.annualSavingByMovingUsd).toBeCloseTo(0, 2);
    });

    it("colRatio=0.5 → India costs half as much, 2× purchasing power", () => {
      const r = calcMovingBack({ ...BASE, colRatio: 0.5 });
      expect(r.equivalentIndiaAnnualCostUsd).toBeCloseTo(50_000, 2);
      expect(r.purchasingPowerMultiple).toBeCloseTo(2, 4);
      expect(r.annualSavingByMovingUsd).toBeCloseTo(50_000, 2);
    });

    it("colRatio=0.25 → India costs 25%, 4× purchasing power", () => {
      const r = calcMovingBack({ ...BASE, colRatio: 0.25 });
      expect(r.purchasingPowerMultiple).toBeCloseTo(4, 4);
      expect(r.equivalentIndiaAnnualCostUsd).toBeCloseTo(25_000, 2);
    });
  });

  describe("FX rate impact", () => {
    it("higher FX rate → proportionally higher INR values", () => {
      const r100 = calcMovingBack({ ...BASE, usdToInr: 100 });
      // salaryInrDirect = 100k * 100 = 10M
      expect(r100.salaryInrDirect).toBeCloseTo(10_000_000, 0);
      // equivalentIndiaAnnualCostInr = 35k * 100 = 3.5M
      expect(r100.equivalentIndiaAnnualCostInr).toBeCloseTo(3_500_000, 0);
    });
  });

  describe("savings runway", () => {
    it("no savings → savingsInInr=null, savingsRunwayYears=null", () => {
      const r = calcMovingBack({ ...BASE, usSavingsUsd: null });
      expect(r.savingsInInr).toBeNull();
      expect(r.savingsRunwayYears).toBeNull();
    });

    it("savingsRunwayYears = (savings * usdToInr) / annualCostInr", () => {
      const r = calcMovingBack({ ...BASE, usSavingsUsd: 200_000 });
      const expectedRunway = (200_000 * 84) / (100_000 * 0.35 * 84);
      expect(r.savingsRunwayYears).toBeCloseTo(expectedRunway, 4);
      // = 200,000 / (100,000 * 0.35) = 200,000 / 35,000 ≈ 5.714
      expect(r.savingsRunwayYears).toBeCloseTo(5.714, 2);
    });
  });

  describe("derived formulas", () => {
    it("salaryInrDirect = usSalaryUsd * usdToInr", () => {
      const r = calcMovingBack(BASE);
      expect(r.salaryInrDirect).toBeCloseTo(100_000 * 84, 4);
    });

    it("monthlyBudget = annualCostInr / 12", () => {
      const r = calcMovingBack(BASE);
      expect(r.equivalentIndiaMonthlyBudgetInr).toBeCloseTo(
        r.equivalentIndiaAnnualCostInr / 12,
        4
      );
    });

    it("annualSaving = usSalary - equivalentIndiaAnnualCostUsd", () => {
      const r = calcMovingBack(BASE);
      expect(r.annualSavingByMovingUsd).toBeCloseTo(
        100_000 - r.equivalentIndiaAnnualCostUsd,
        4
      );
    });
  });

  describe("edge cases", () => {
    it("all results finite on typical inputs", () => {
      const r = calcMovingBack({ ...BASE, usSavingsUsd: 300_000 });
      expect(isFinite(r.salaryInrDirect)).toBe(true);
      expect(isFinite(r.equivalentIndiaAnnualCostInr)).toBe(true);
      expect(isFinite(r.purchasingPowerMultiple)).toBe(true);
      expect(isFinite(r.savingsRunwayYears!)).toBe(true);
    });

    it("purchasingPowerMultiple > 1 when India is cheaper (colRatio < 1)", () => {
      const r = calcMovingBack({ ...BASE, colRatio: 0.35 });
      expect(r.purchasingPowerMultiple).toBeGreaterThan(1);
    });
  });
});
