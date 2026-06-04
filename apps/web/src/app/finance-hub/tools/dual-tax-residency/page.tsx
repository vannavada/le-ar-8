import type { Metadata } from "next";
import { DualTaxResidencyCalculator } from "@/components/calculators/DualTaxResidencyCalculator";

export const metadata: Metadata = {
  title: "Dual-Tax-Residency Estimator | FinanceHub",
  description:
    "Rough ballpark estimate of US and India tax exposure when you have income in both countries — and whether the Foreign Tax Credit likely prevents double-taxation. Deliberately rough. Not a tax computation.",
};

export default function Page() {
  return <DualTaxResidencyCalculator />;
}
