import type { Metadata } from "next";
import { NriRepatriationCalculator } from "@/components/calculators/NriRepatriationCalculator";

export const metadata: Metadata = {
  title: "NRI Repatriation Calculator",
  description:
    "Estimate how much of your Indian income or asset-sale proceeds you can repatriate to the US after Indian taxes, and how it compares to the RBI's USD 1 million/year NRO limit. Estimate only — not tax advice.",
};

export default function Page() {
  return <NriRepatriationCalculator />;
}
