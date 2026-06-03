// Salary Negotiation Value Calculator — pure math, no side effects.
//
// A one-time raise negotiated today compounds across a career because:
//   1. Future salary increases (%) apply to the higher base
//   2. The extra take-home each year can be invested
//
// Extra earned in year k (0-indexed): raise * (1+g)^k
// Total extra earned: raise * ((1+g)^n - 1) / g   (g > 0)
//                   : raise * n                   (g = 0)
//
// FV of growing annuity (each year's extra invested at r):
//   FV = raise * (1+r) * [(1+r)^n - (1+g)^n] / (r - g)   (r ≠ g)
//   FV = raise * n * (1+r)^n                               (r = g)
//
// Derivation: FV = Σ_{k=0}^{n-1} raise*(1+g)^k*(1+r)^(n-k)
//   = raise*(1+r)^n * Σ [(1+g)/(1+r)]^k (geometric series)

export interface SalaryNegotiationInput {
  raise: number;         // negotiated raise amount ($)
  yearsRemaining: number; // career years left
  salaryGrowth: number;  // annual salary increase rate (%)
  investmentReturn: number; // annual investment return if extra saved (%)
}

export interface SalaryNegotiationResult {
  totalExtraEarned: number;   // sum of all raise increments (not invested)
  investedFV: number;         // FV if each year's extra is invested
  firstYearExtra: number;     // = raise (sanity check display)
  finalYearExtra: number;     // raise * (1+g)^(n-1)
}

export function calcSalaryNegotiation(
  input: SalaryNegotiationInput
): SalaryNegotiationResult {
  const { raise, yearsRemaining, salaryGrowth, investmentReturn } = input;
  const g = salaryGrowth / 100;
  const r = investmentReturn / 100;
  const n = Math.max(0, Math.round(yearsRemaining));

  // Total extra earned (simple sum, no investing)
  const totalExtraEarned =
    g === 0
      ? raise * n
      : raise * ((Math.pow(1 + g, n) - 1) / g);

  // FV of growing annuity (extra earned each year, invested at r)
  let investedFV: number;
  if (n === 0) {
    investedFV = 0;
  } else if (Math.abs(r - g) < 1e-10) {
    // r ≈ g: FV = raise * n * (1+r)^n
    investedFV = raise * n * Math.pow(1 + r, n);
  } else {
    investedFV = raise * (1 + r) * (Math.pow(1 + r, n) - Math.pow(1 + g, n)) / (r - g);
  }

  const firstYearExtra = raise;
  const finalYearExtra = raise * Math.pow(1 + g, Math.max(0, n - 1));

  return { totalExtraEarned, investedFV, firstYearExtra, finalYearExtra };
}

// Spot-check:
// raise=$5k, 20 years remaining, 3% salary growth, 7% investment return
// totalExtraEarned = 5000 * (1.03^20 - 1)/0.03 = 5000 * 26.87 ≈ $134,352
// investedFV = 5000 * 1.07 * (1.07^20 - 1.03^20) / (0.07 - 0.03)
//            = 5000 * 1.07 * (3.8697 - 1.8061) / 0.04
//            = 5000 * 1.07 * 51.59
//            ≈ $276,000
