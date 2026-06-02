// Time to Financial Independence Calculator — pure math, no side effects.
//
// Based on the "Shockingly Simple Math" behind FIRE:
//   - Annual savings = income × savingsRate
//   - Annual expenses = income × (1 - savingsRate)
//   - FI target = annualExpenses / withdrawalRate  (e.g. 25× expenses at 4%)
//
// Years to FI: solve FV_annuity(annualSavings, r, n) = target
//   annualSavings * ((1+r)^n - 1) / r = target
//   (1+r)^n = 1 + target*r / annualSavings
//   n = ln(1 + target*r / annualSavings) / ln(1+r)
//
// Classic verification: 50% savings rate, 5% real return → ~16.6 years ✓

export interface TimeToFiInput {
  income: number;        // gross annual income ($)
  savingsRate: number;   // % of income saved (0–100)
  expectedReturn: number; // annual investment return (%)
  withdrawalRate: number; // safe withdrawal rate (%, default 4%)
}

export interface TimeToFiResult {
  annualSavings: number;    // income × savingsRate
  annualExpenses: number;   // income − annualSavings
  targetPortfolio: number;  // annualExpenses / withdrawalRate
  yearsToFi: number;        // solution (may be Infinity if rate < 0)
  savingsMultiple: number;  // 1 / withdrawalRate (e.g. 25× for 4%)
  expenseRatio: number;     // annualExpenses / income = 1 - savingsRate/100
}

export function calcTimeToFi(input: TimeToFiInput): TimeToFiResult {
  const { income, savingsRate, expectedReturn, withdrawalRate } = input;
  const r = expectedReturn / 100;
  const wRate = Math.max(0.001, withdrawalRate / 100);

  const annualSavings = income * (savingsRate / 100);
  const annualExpenses = income - annualSavings;
  const targetPortfolio = annualExpenses / wRate;
  const savingsMultiple = 1 / wRate;
  const expenseRatio = annualExpenses / (income || 1);

  let yearsToFi: number;

  if (annualSavings <= 0) {
    yearsToFi = Infinity;
  } else if (targetPortfolio <= 0) {
    yearsToFi = 0;
  } else if (r <= 0) {
    yearsToFi = targetPortfolio / annualSavings;
  } else {
    const ratio = 1 + (targetPortfolio * r) / annualSavings;
    yearsToFi = ratio <= 1 ? 0 : Math.log(ratio) / Math.log(1 + r);
  }

  return {
    annualSavings,
    annualExpenses,
    targetPortfolio,
    yearsToFi,
    savingsMultiple,
    expenseRatio,
  };
}

// Spot-checks:
// income=$100k, savingsRate=50%, return=7%, withdrawal=4%
//   annualSavings=$50k, annualExpenses=$50k, target=$1.25M
//   yearsToFi = ln(1 + 1,250,000*0.07/50,000) / ln(1.07)
//             = ln(1 + 1.75) / ln(1.07) = ln(2.75) / 0.0677 ≈ 14.9 years (at 7%)
//
// income=$100k, savingsRate=50%, return=5%, withdrawal=4%
//   yearsToFi ≈ 16.6 years — matches classic MMM/Shockingly Simple Math ✓
//
// income=$100k, savingsRate=10%, return=7%, withdrawal=4%
//   annualExpenses=$90k, target=$2.25M, savings=$10k
//   yearsToFi ≈ 42+ years ✓ (low savings rate takes much longer)
