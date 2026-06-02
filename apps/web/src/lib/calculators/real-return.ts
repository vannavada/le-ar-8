// Real Return Calculator — pure math, no side effects.
//
// Computes the real (after-inflation, after-tax) return on an investment.
//
// IMPORTANT: taxRate is USER-ENTERED. This calculator does NOT compute
// anyone's tax. It applies the entered rate as a flat deduction from
// nominal gains. Label inputs clearly in the UI.
//
// Steps:
//   1. After-tax nominal: nominalReturn × (1 - taxRate)
//   2. Real return (Fisher equation):
//      realReturn = (1 + afterTaxNominal) / (1 + inflation) - 1
//
// The Fisher equation is the correct way to chain inflation adjustment —
// NOT a simple subtraction (which understates inflation drag at higher rates).

export interface RealReturnInput {
  nominalReturn: number;  // gross investment return (%)
  inflationRate: number;  // annual inflation (%)
  taxRate: number;        // user-entered effective tax rate on gains (%)
}

export interface RealReturnResult {
  afterTaxNominal: number;    // nominalReturn × (1 - taxRate/100), in %
  realReturn: number;         // real after-tax return, in %
  taxDrag: number;            // return lost to tax (%)
  inflationDrag: number;      // approximate purchasing-power erosion (%)
  purchasingPowerGain: number; // realReturn if positive, else loss
}

export function calcRealReturn(input: RealReturnInput): RealReturnResult {
  const { nominalReturn, inflationRate, taxRate } = input;

  const afterTaxNominal = nominalReturn * (1 - taxRate / 100);

  // Fisher equation: (1 + real) = (1 + afterTaxNominal%) / (1 + inflation%)
  const realReturn =
    ((1 + afterTaxNominal / 100) / (1 + inflationRate / 100) - 1) * 100;

  const taxDrag = nominalReturn - afterTaxNominal;
  const inflationDrag = inflationRate; // simple display; Fisher already applied above
  const purchasingPowerGain = realReturn;

  return { afterTaxNominal, realReturn, taxDrag, inflationDrag, purchasingPowerGain };
}

// Spot-checks:
// nominalReturn=10%, inflation=3%, taxRate=25%
//   afterTaxNominal = 10 * 0.75 = 7.5%
//   realReturn = (1.075 / 1.03 - 1) * 100 = 4.37% ✓ (reasonable real return)
//
// nominalReturn=3%, inflation=3%, taxRate=20%
//   afterTaxNominal = 3 * 0.8 = 2.4%
//   realReturn = (1.024 / 1.03 - 1) * 100 = -0.58% (losing real value) ✓
