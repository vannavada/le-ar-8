import type { Metadata } from "next";
import { CoastFireCalculator } from "@/components/calculators/CoastFireCalculator";

export const metadata: Metadata = {
  title: "Coast-FIRE Calculator | FinanceHub",
  description:
    "Find your coast number — the portfolio size where compounding alone will reach your retirement target, with no further contributions needed.",
};

export default function Page() {
  return <CoastFireCalculator />;
}
