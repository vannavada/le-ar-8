import type { Metadata } from "next";
import { SectionLayout } from "@/components/layout/section-layout";

export const metadata: Metadata = {
  title: { default: "TechVault", template: "%s — le-ar-8" },
  description:
    "Honest reviews of tech, men's lifestyle, and automotive products. No hype — clear verdicts on what's worth your money.",
};

export default function TechVaultLayout({ children }: { children: React.ReactNode }) {
  return <SectionLayout slug="tech-vault">{children}</SectionLayout>;
}
