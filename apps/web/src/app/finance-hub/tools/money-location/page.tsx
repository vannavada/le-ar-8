import type { Metadata } from "next";
import { MoneyLocationCalculator } from "@/components/calculators/MoneyLocationCalculator";

export const metadata: Metadata = {
  title: "US vs. India — Where Should My Money Live?",
  description:
    "Compare growing your savings in a US investment vs. an Indian fixed deposit. Accounts for live FX, INR depreciation trend, and your tax rates. Estimate, not advice.",
};

export default function Page() {
  return <MoneyLocationCalculator />;
}
