import type { Metadata } from "next";
import { SubscriptionCostCalculator } from "@/components/calculators/SubscriptionCostCalculator";

export const metadata: Metadata = {
  title: "True Cost of a Subscription Calculator | FinanceHub",
  description:
    "That $15/month subscription is worth far more compounded over decades. Calculate the real opportunity cost of any recurring expense.",
};

export default function Page() {
  return <SubscriptionCostCalculator />;
}
