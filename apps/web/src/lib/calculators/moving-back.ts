// Cost of moving back to India — pure math, no side effects.
//
// Answers: "What is my US salary/savings worth in India?"
//
// colRatio is the key assumption: India COL as a fraction of US COL
// for a comparable lifestyle. colRatio = 0.35 means India costs 35% of
// the US for an equivalent standard of living.
//
// Derived values:
//   equivalentIndiaAnnualCostUsd = usSalaryUsd * colRatio
//     → the USD you'd need annually IN INDIA for the same lifestyle
//   equivalentIndiaAnnualCostInr = equivalentIndiaAnnualCostUsd * usdToInr
//   purchasingPowerMultiple = 1 / colRatio
//     → your USD goes this many times further in India
//   annualSavingByMovingUsd = usSalaryUsd - equivalentIndiaAnnualCostUsd
//     → what you "save" per year by living in India (if keeping US income)
//
// Savings runway (optional): if you move $S to India, how many years does
// it sustain your equivalent Indian lifestyle?
//   savingsRunwayYears = (usSavingsUsd * usdToInr) / equivalentIndiaAnnualCostInr

export interface MovingBackInput {
  usSalaryUsd: number;          // annual US salary (or equivalent annual spend)
  usdToInr: number;             // current USD/INR rate
  colRatio: number;             // India COL / US COL for same lifestyle (default 0.35)
  usSavingsUsd?: number | null; // optional: lump sum to move to India
}

export interface MovingBackResult {
  // Direct FX conversion (no COL adjustment)
  salaryInrDirect: number;                 // US salary × usdToInr

  // COL-adjusted values
  equivalentIndiaAnnualCostInr: number;    // what you'd spend in India for same lifestyle
  equivalentIndiaMonthlyBudgetInr: number; // monthly version
  equivalentIndiaAnnualCostUsd: number;    // same in USD terms (= usSalaryUsd * colRatio)

  // Purchasing power
  purchasingPowerMultiple: number;         // how much further your money goes (1/colRatio)
  annualSavingByMovingUsd: number;         // USD "saved" per year vs. US lifestyle cost

  // Savings runway (null when no savings provided)
  savingsInInr: number | null;             // lump sum converted to INR
  savingsRunwayYears: number | null;       // years the savings sustain Indian lifestyle
}

export function calcMovingBack(input: MovingBackInput): MovingBackResult {
  const { usSalaryUsd, usdToInr, colRatio, usSavingsUsd } = input;

  const safeColRatio = colRatio > 0 ? colRatio : 0.35;

  const salaryInrDirect = usSalaryUsd * usdToInr;

  const equivalentIndiaAnnualCostUsd = usSalaryUsd * safeColRatio;
  const equivalentIndiaAnnualCostInr = equivalentIndiaAnnualCostUsd * usdToInr;
  const equivalentIndiaMonthlyBudgetInr = equivalentIndiaAnnualCostInr / 12;

  const purchasingPowerMultiple = 1 / safeColRatio;
  const annualSavingByMovingUsd = usSalaryUsd - equivalentIndiaAnnualCostUsd;

  const savingsInInr =
    usSavingsUsd != null && isFinite(usSavingsUsd)
      ? usSavingsUsd * usdToInr
      : null;

  const savingsRunwayYears =
    savingsInInr != null && equivalentIndiaAnnualCostInr > 0
      ? savingsInInr / equivalentIndiaAnnualCostInr
      : null;

  return {
    salaryInrDirect,
    equivalentIndiaAnnualCostInr,
    equivalentIndiaMonthlyBudgetInr,
    equivalentIndiaAnnualCostUsd,
    purchasingPowerMultiple,
    annualSavingByMovingUsd,
    savingsInInr,
    savingsRunwayYears,
  };
}

// Spot-checks:
// usSalaryUsd=100000, usdToInr=84, colRatio=0.35, usSavingsUsd=500000:
//   salaryInrDirect = 8,400,000
//   equivalentIndiaAnnualCostUsd = 35,000
//   equivalentIndiaAnnualCostInr = 2,940,000
//   equivalentIndiaMonthlyBudgetInr = 245,000
//   purchasingPowerMultiple = 1/0.35 ≈ 2.857
//   annualSavingByMovingUsd = 65,000
//   savingsInInr = 42,000,000
//   savingsRunwayYears = 42,000,000 / 2,940,000 ≈ 14.286
