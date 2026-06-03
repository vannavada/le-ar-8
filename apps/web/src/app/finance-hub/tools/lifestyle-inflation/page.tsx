import type { Metadata } from "next";
import { LifestyleInflationCalculator } from "@/components/calculators/LifestyleInflationCalculator";

export const metadata: Metadata = {
  title: "Lifestyle Inflation Calculator | FinanceHub",
  description:
    "See how lifestyle creep silently erodes your raise. Compare banking the raise vs. letting it inflate your spending — compounded over your investing years.",
};

export default function Page() {
  return <LifestyleInflationCalculator />;
}
