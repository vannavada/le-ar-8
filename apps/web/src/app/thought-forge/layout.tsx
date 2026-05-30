import { SectionLayout } from "@/components/layout/section-layout";

export const metadata = { title: "ThoughtForge" };

export default function ThoughtForgeLayout({ children }: { children: React.ReactNode }) {
  return <SectionLayout slug="thought-forge">{children}</SectionLayout>;
}
