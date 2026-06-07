import type { Metadata } from "next";
import { MovingBackCalculator } from "@/components/calculators/MovingBackCalculator";

export const metadata: Metadata = {
  title: "Cost of Moving Back to India",
  description:
    "What is your US salary or savings worth in India after cost-of-living adjustment and live FX? See your real purchasing power. Estimate, not advice.",
};

export default function Page() {
  return <MovingBackCalculator />;
}
