// Lifestyle Inflation Calculator — pure math, no side effects.
//
// Models two scenarios for an annual raise:
//   A) "Creep" — creepPct% of the raise is absorbed by higher spending
//   B) "Bank it" — the entire raise is invested
//
// Formula: FV of an ordinary annuity
//   fvAnnuity(pmt, r, n) = pmt * ((1+r)^n - 1) / r   (r > 0)
//                         = pmt * n                   (r = 0)

export interface LifestyleInflationInput {
  raise: number;      // annual raise amount ($)
  creepPct: number;   // % of raise absorbed by lifestyle (0–100)
  years: number;      // investment horizon (years)
  returnRate: number; // annual investment return (%)
}

export interface LifestyleInflationResult {
  creepAmount: number;      // portion of raise spent on lifestyle
  bankAmount: number;       // portion of raise actually saved
  totalCreepSpend: number;  // cumulative lifestyle spend (creepAmount × years)
  creepScenarioFV: number;  // FV if only bankAmount invested each year
  bankScenarioFV: number;   // FV if full raise invested each year
  opportunityCost: number;  // bankScenarioFV - creepScenarioFV
}

function fvAnnuity(pmt: number, r: number, n: number): number {
  if (r === 0) return pmt * n;
  return pmt * ((Math.pow(1 + r, n) - 1) / r);
}

export function calcLifestyleInflation(
  input: LifestyleInflationInput
): LifestyleInflationResult {
  const { raise, creepPct, years, returnRate } = input;
  const r = returnRate / 100;
  const n = Math.max(0, Math.round(years));

  const creepAmount = raise * (creepPct / 100);
  const bankAmount = raise - creepAmount;
  const totalCreepSpend = creepAmount * n;

  const bankScenarioFV = fvAnnuity(raise, r, n);
  const creepScenarioFV = fvAnnuity(bankAmount, r, n);
  const opportunityCost = bankScenarioFV - creepScenarioFV;

  return {
    creepAmount,
    bankAmount,
    totalCreepSpend,
    creepScenarioFV,
    bankScenarioFV,
    opportunityCost,
  };
}

// Spot-check (can verify manually):
// raise=$10k, creep=50%, years=10, return=7%
// creepAmount=$5k, bankAmount=$5k
// bankScenarioFV = 10000 * ((1.07^10 - 1) / 0.07) = 10000 * 13.816 ≈ $138,164
// creepScenarioFV = 5000 * 13.816 ≈ $69,082
// opportunityCost ≈ $69,082
