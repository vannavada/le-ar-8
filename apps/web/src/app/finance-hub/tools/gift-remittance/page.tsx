import type { Metadata } from "next";
import { GiftRemittanceCalculator } from "@/components/calculators/GiftRemittanceCalculator";

export const metadata: Metadata = {
  title: "Gift & Remittance Limit Calculator | FinanceHub",
  description:
    "Estimate US gift-tax implications of sending money to India. Annual exclusion, lifetime exemption tracking, and Indian recipient tax check. Thresholds change yearly — verify before use. Not tax advice.",
};

export default function Page() {
  return <GiftRemittanceCalculator />;
}
