import type { Metadata } from "next";
import { SectionLayout } from "@/components/layout/section-layout";

export const metadata: Metadata = {
  title: "LearnHub",
  description:
    "Guides and resources on finance, technology, and the skills worth developing.",
};

export default function LearnHubLayout({ children }: { children: React.ReactNode }) {
  return <SectionLayout slug="learn-hub">{children}</SectionLayout>;
}
