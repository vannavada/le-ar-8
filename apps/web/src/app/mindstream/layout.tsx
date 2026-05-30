import { SectionLayout } from "@/components/layout/section-layout";

export const metadata = { title: "MindStream" };

export default function MindStreamLayout({ children }: { children: React.ReactNode }) {
  return <SectionLayout slug="mindstream">{children}</SectionLayout>;
}
