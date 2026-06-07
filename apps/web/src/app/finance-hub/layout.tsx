import type { Metadata } from "next";
import { SectionLayout } from "@/components/layout/section-layout";

export const metadata: Metadata = {
  title: { default: "FinanceHub", template: "%s — le-ar-8" },
  description:
    "Financial calculators, FIRE tools, and cross-border US–India money tools for NRIs. No ads, no sign-up — runs in your browser.",
};

export default function FinanceHubLayout({ children }: { children: React.ReactNode }) {
  return <SectionLayout slug="finance-hub">{children}</SectionLayout>;
}
