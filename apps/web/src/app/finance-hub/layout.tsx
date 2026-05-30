import { SectionLayout } from "@/components/layout/section-layout";

export const metadata = { title: "FinanceHub" };

export default function FinanceHubLayout({ children }: { children: React.ReactNode }) {
  return <SectionLayout slug="finance-hub">{children}</SectionLayout>;
}
