import type { Metadata } from "next";
import { SectionLayout } from "@/components/layout/section-layout";

export const metadata: Metadata = {
  title: { default: "ThoughtForge", template: "%s — le-ar-8" },
  description:
    "Professional essays and industry analysis. Career strategy, business thinking, and opinions that take a position.",
};

export default function ThoughtForgeLayout({ children }: { children: React.ReactNode }) {
  return <SectionLayout slug="thought-forge">{children}</SectionLayout>;
}
