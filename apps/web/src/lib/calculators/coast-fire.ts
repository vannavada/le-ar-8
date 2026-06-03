// Coast-FIRE Calculator — pure math, no side effects.
//
// "Coasting" means you have enough invested RIGHT NOW that, with no further
// contributions, it will compound to your target retirement number by
// retirement age.
//
// Coast Number (present value of target at current age):
//   coastNumber = targetNumber / (1 + r)^(retirementAge - currentAge)
//
// If currentPortfolio >= coastNumber → already coasted.
// Otherwise, time to coast:
//   t = ln(coastNumber / currentPortfolio) / ln(1 + r)

export interface CoastFireInput {
  currentPortfolio: number; // current invested assets ($)
  expectedReturn: number;   // annual nominal return (%)
  currentAge: number;
  retirementAge: number;    // target retirement age
  targetNumber: number;     // desired portfolio at retirement ($)
}

export interface CoastFireResult {
  coastNumber: number;        // what you need NOW to stop contributing
  hasCoasted: boolean;        // currentPortfolio >= coastNumber
  surplus: number;            // currentPortfolio - coastNumber (positive = surplus)
  yearsToCoast: number | null; // null if already coasted or portfolio = 0
  coastAge: number | null;    // null if already coasted or portfolio = 0
  projectedValueAtRetirement: number; // currentPortfolio grown to retirementAge (no contributions)
}

export function calcCoastFire(input: CoastFireInput): CoastFireResult {
  const { currentPortfolio, expectedReturn, currentAge, retirementAge, targetNumber } = input;
  const r = expectedReturn / 100;
  const yearsToRetirement = Math.max(0, retirementAge - currentAge);

  const growthFactor = r > 0 ? Math.pow(1 + r, yearsToRetirement) : 1;
  const coastNumber = yearsToRetirement > 0 && r > 0
    ? targetNumber / growthFactor
    : targetNumber;

  const hasCoasted = currentPortfolio >= coastNumber;
  const surplus = currentPortfolio - coastNumber;

  const projectedValueAtRetirement = currentPortfolio * growthFactor;

  let yearsToCoast: number | null = null;
  let coastAge: number | null = null;

  if (!hasCoasted && currentPortfolio > 0 && r > 0 && coastNumber > currentPortfolio) {
    // Solve: currentPortfolio * (1+r)^t = coastNumber
    yearsToCoast = Math.log(coastNumber / currentPortfolio) / Math.log(1 + r);
    if (yearsToCoast > 0 && yearsToCoast < yearsToRetirement) {
      coastAge = currentAge + yearsToCoast;
    }
  }

  return {
    coastNumber,
    hasCoasted,
    surplus,
    yearsToCoast,
    coastAge,
    projectedValueAtRetirement,
  };
}

// Spot-check:
// currentPortfolio=$200k, return=7%, currentAge=35, retirementAge=65, target=$1M
// coastNumber = 1,000,000 / 1.07^30 = 1,000,000 / 7.612 ≈ $131,367
// $200k > $131,367 → already coasted! ✓
//
// currentPortfolio=$50k, same inputs:
// not coasted; yearsToCoast = ln(131,367/50,000) / ln(1.07) = 0.969/0.0677 ≈ 14.3 years
// coastAge ≈ 49.3
