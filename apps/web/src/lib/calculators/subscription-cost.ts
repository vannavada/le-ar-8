// Subscription Cost Calculator — pure math, no side effects.
//
// Shows the true cost of a recurring subscription: not just what you pay,
// but the compounded opportunity cost — what that money would be worth
// if invested instead over N years.
//
// FV of an ordinary annuity (annual payments invested at r):
//   FV = pmt * ((1+r)^n - 1) / r

export type SubscriptionPeriod = "monthly" | "annual";

export interface SubscriptionCostInput {
  cost: number;                 // cost per period ($)
  period: SubscriptionPeriod;   // monthly or annual
  returnRate: number;           // annual investment return (%)
  years: number;                // time horizon
}

export interface SubscriptionCostResult {
  annualCost: number;       // normalized to annual
  totalPaid: number;        // simple sum over N years (no investing)
  opportunityCost: number;  // FV of annual payments if invested instead
  costPerDay: number;       // annualCost / 365
}

export function calcSubscriptionCost(
  input: SubscriptionCostInput
): SubscriptionCostResult {
  const { cost, period, returnRate, years } = input;
  const r = returnRate / 100;
  const n = Math.max(0, Math.round(years));

  const annualCost = period === "monthly" ? cost * 12 : cost;
  const totalPaid = annualCost * n;

  const opportunityCost =
    r === 0
      ? totalPaid
      : annualCost * ((Math.pow(1 + r, n) - 1) / r);

  const costPerDay = annualCost / 365;

  return { annualCost, totalPaid, opportunityCost, costPerDay };
}

// Spot-check:
// $15/mo Netflix, 7% return, 20 years
// annualCost = $180, totalPaid = $3,600
// opportunityCost = 180 * ((1.07^20 - 1) / 0.07) = 180 * 40.995 ≈ $7,379
