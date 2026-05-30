import { SectionLayout } from "@/components/layout/section-layout";

export const metadata = { title: "CommunitySpace" };

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return <SectionLayout slug="community">{children}</SectionLayout>;
}
