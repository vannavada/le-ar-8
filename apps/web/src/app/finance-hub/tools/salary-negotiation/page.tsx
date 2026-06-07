import type { Metadata } from "next";
import { SalaryNegotiationCalculator } from "@/components/calculators/SalaryNegotiationCalculator";

export const metadata: Metadata = {
  title: "Lifetime Value of a Raise",
  description:
    "A salary negotiation win compounds across your entire career. Calculate the true lifetime value of a one-time raise, including future salary growth and investing.",
};

export default function Page() {
  return <SalaryNegotiationCalculator />;
}
