import type { Metadata } from "next";
import { RealReturnCalculator } from "@/components/calculators/RealReturnCalculator";

export const metadata: Metadata = {
  title: "Real Return Calculator | FinanceHub",
  description:
    "After tax, after inflation — what did your investment actually earn? Enter your own tax rate and see your true real return using the Fisher equation.",
};

export default function Page() {
  return <RealReturnCalculator />;
}
