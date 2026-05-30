import { SectionLayout } from "@/components/layout/section-layout";

export const metadata = { title: "LearnHub" };

export default function LearnHubLayout({ children }: { children: React.ReactNode }) {
  return <SectionLayout slug="learn-hub">{children}</SectionLayout>;
}
