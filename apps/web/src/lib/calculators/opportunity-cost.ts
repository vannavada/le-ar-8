// Opportunity Cost of a Purchase — pure math, no side effects.
//
// A one-time purchase of $X today vs. what that money would be worth
// if invested at rate r for N years.
//
// Lump-sum future value: FV = PV * (1 + r)^n

export interface OpportunityCostInput {
  amount: number;     // one-time purchase price ($)
  returnRate: number; // annual investment return (%)
  years: number;      // time horizon
}

export interface OpportunityCostResult {
  futureValue: number; // amount * (1 + r)^n — what it would be worth
  gain: number;        // futureValue - amount (the opportunity you forgo)
  doubleTime: number;  // Rule of 72: years to double at this rate
}

export function calcOpportunityCost(
  input: OpportunityCostInput
): OpportunityCostResult {
  const { amount, returnRate, years } = input;
  const r = returnRate / 100;
  const n = Math.max(0, years);

  const futureValue = amount * Math.pow(1 + r, n);
  const gain = futureValue - amount;
  const doubleTime = r > 0 ? 72 / returnRate : Infinity;

  return { futureValue, gain, doubleTime };
}

// Spot-check:
// $1,000 purchase, 7% return, 30 years
// FV = 1000 * 1.07^30 = 1000 * 7.612 ≈ $7,612
// gain ≈ $6,612
