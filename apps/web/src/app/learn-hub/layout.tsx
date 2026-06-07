import type { Metadata } from "next";
import { SectionLayout } from "@/components/layout/section-layout";

export const metadata: Metadata = {
  title: { default: "LearnHub", template: "%s — le-ar-8" },
  description:
    "Guides and resources on finance, technology, and the skills worth developing.",
};

export default function LearnHubLayout({ children }: { children: React.ReactNode }) {
  return <SectionLayout slug="learn-hub">{children}</SectionLayout>;
}
