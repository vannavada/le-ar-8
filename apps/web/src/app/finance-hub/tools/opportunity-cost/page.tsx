import type { Metadata } from "next";
import { OpportunityCostCalculator } from "@/components/calculators/OpportunityCostCalculator";

export const metadata: Metadata = {
  title: "Opportunity Cost Calculator | FinanceHub",
  description:
    "What does a purchase today cost in future money? Calculate the future value of any one-time expense if invested instead.",
};

export default function Page() {
  return <OpportunityCostCalculator />;
}
