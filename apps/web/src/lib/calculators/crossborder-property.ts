// Cross-border rent-vs-buy — pure math, no side effects.
//
// Compares buying property in India (while living in the US) against
// investing the equivalent USD capital in the US market.
//
// India buy scenario:
//   Capital deployed (USD) = propertyPriceInr / usdToInr  (at current FX)
//   Property value at end: propertyPriceInr * (1 + appreciationPct/100)^years
//   Rental income (simplified flat annuity on initial price, not reinvested):
//     totalRentalInr = propertyPriceInr * rentalYieldPct/100 * years
//   Total INR = propertyFvInr + totalRentalInr
//   After repatriation friction: total * (1 - frictionPct/100)
//   Convert back to USD at CURRENT rate (FX trend not modelled here;
//   user should factor currency risk separately via the MoneyLocation calc)
//
// US invest scenario:
//   usFvUsd = capitalUsd * (1 + usReturnPct/100)^years
//
// NOTE: Simplified rental model — flat yield on initial price, no vacancy,
// no maintenance costs, no tax on rental income (user should apply their
// own tax rate). Repatriation friction covers TDS, FEMA, conversion fees
// as a single % — use a conservative estimate (5–10%).

export interface CrossBorderPropertyInput {
  propertyPriceInr: number;        // purchase price in INR
  usdToInr: number;                // current USD/INR rate
  rentalYieldPct: number;          // annual gross rental yield (%)
  propertyAppreciationPct: number; // annual price appreciation (%)
  repatriationFrictionPct: number; // % of proceeds lost to repatriation costs
  usReturnPct: number;             // alternative US investment annual return (%)
  years: number;
}

export interface CrossBorderPropertyResult {
  capitalUsd: number;              // USD deployed (property price / FX)

  // India buy scenario
  propertyFvInr: number;           // property value at end
  totalRentalInr: number;          // total rental income over period
  indiaTotalInr: number;           // property + rental
  indiaAfterFrictionInr: number;   // after repatriation costs
  indiaFvUsd: number;              // converted to USD at current rate

  // US invest scenario
  usFvUsd: number;

  // Annualized returns
  annualizedIndiaReturnPct: number; // CAGR of India scenario
  annualizedUsReturnPct: number;    // same as input usReturnPct

  // Comparison
  winner: "india" | "us" | "tie";
  differenceUsd: number;
}

export function calcCrossBorderProperty(
  input: CrossBorderPropertyInput
): CrossBorderPropertyResult {
  const {
    propertyPriceInr, usdToInr, rentalYieldPct, propertyAppreciationPct,
    repatriationFrictionPct, usReturnPct, years,
  } = input;
  const n = Math.max(0, Math.round(years));

  const capitalUsd = usdToInr > 0 ? propertyPriceInr / usdToInr : 0;

  // India: property appreciation (compound)
  const propertyFvInr = propertyPriceInr * Math.pow(1 + propertyAppreciationPct / 100, n);

  // Rental: simplified flat annuity on initial price (not reinvested)
  const totalRentalInr = propertyPriceInr * (rentalYieldPct / 100) * n;

  const indiaTotalInr = propertyFvInr + totalRentalInr;
  const indiaAfterFrictionInr = indiaTotalInr * (1 - repatriationFrictionPct / 100);
  const indiaFvUsd = usdToInr > 0 ? indiaAfterFrictionInr / usdToInr : 0;

  // US: compound
  const usFvUsd = capitalUsd * Math.pow(1 + usReturnPct / 100, n);

  // CAGRs
  const annualizedIndiaReturnPct =
    capitalUsd > 0 && n > 0
      ? (Math.pow(indiaFvUsd / capitalUsd, 1 / n) - 1) * 100
      : 0;
  const annualizedUsReturnPct = usReturnPct;

  const diff = Math.abs(indiaFvUsd - usFvUsd);
  const winner: "india" | "us" | "tie" =
    diff < 0.01 ? "tie" : indiaFvUsd > usFvUsd ? "india" : "us";

  return {
    capitalUsd,
    propertyFvInr,
    totalRentalInr,
    indiaTotalInr,
    indiaAfterFrictionInr,
    indiaFvUsd,
    usFvUsd,
    annualizedIndiaReturnPct,
    annualizedUsReturnPct,
    winner,
    differenceUsd: diff,
  };
}

// Spot-checks:
// propertyPriceInr=10_000_000, usdToInr=84, rentalYield=3.5%,
//   appreciation=5%, friction=5%, usReturn=7%, years=10:
//   capitalUsd = 10,000,000/84 ≈ 119,047.6
//   propertyFvInr = 10,000,000 * 1.05^10 ≈ 16,288,946
//   totalRentalInr = 10,000,000 * 0.035 * 10 = 3,500,000
//   indiaTotalInr ≈ 19,788,946
//   after 5% friction ≈ 18,799,499
//   indiaFvUsd ≈ 223,803
//   usFvUsd ≈ 119,047.6 * 1.07^10 ≈ 234,289
//   annualIndiaCAGR ≈ (223,803/119,047.6)^0.1 - 1 ≈ 6.5%
