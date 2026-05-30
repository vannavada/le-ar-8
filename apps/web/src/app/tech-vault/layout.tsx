import { SectionLayout } from "@/components/layout/section-layout";

export const metadata = { title: "TechVault" };

export default function TechVaultLayout({ children }: { children: React.ReactNode }) {
  return <SectionLayout slug="tech-vault">{children}</SectionLayout>;
}
