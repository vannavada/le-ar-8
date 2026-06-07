import type { Metadata } from "next";
import { SectionLayout } from "@/components/layout/section-layout";

export const metadata: Metadata = {
  title: { default: "MindStream", template: "%s — le-ar-8" },
  description:
    "Personal thoughts and reflections — from one-liners to expanded pieces.",
};

export default function MindStreamLayout({ children }: { children: React.ReactNode }) {
  return <SectionLayout slug="mindstream">{children}</SectionLayout>;
}
