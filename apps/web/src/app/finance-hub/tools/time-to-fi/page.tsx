import type { Metadata } from "next";
import { TimeToFiCalculator } from "@/components/calculators/TimeToFiCalculator";

export const metadata: Metadata = {
  title: "Time to Financial Independence",
  description:
    "The real FIRE math: how many years until your portfolio sustains your lifestyle indefinitely? Your savings rate is the single most powerful variable.",
};

export default function Page() {
  return <TimeToFiCalculator />;
}
