import type { Metadata } from "next";
import { CrossBorderPropertyCalculator } from "@/components/calculators/CrossBorderPropertyCalculator";

export const metadata: Metadata = {
  title: "Buy Property in India vs. Invest in the US",
  description:
    "Should you buy that flat in India or invest the equivalent in the US? Compare total returns after appreciation, rental income, repatriation costs, and live FX. Estimate, not advice.",
};

export default function Page() {
  return <CrossBorderPropertyCalculator />;
}
