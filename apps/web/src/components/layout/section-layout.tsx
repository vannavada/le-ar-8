import { SECTIONS } from "@/lib/sections";

interface SectionLayoutProps {
  slug: string;
  children: React.ReactNode;
}

export function SectionLayout({ slug, children }: SectionLayoutProps) {
  const section = SECTIONS.find((s) => s.slug === slug);

  return (
    <div>
      {section && (
        <div
          className="border-b px-4 py-3"
          style={{ borderBottomColor: section.color }}
        >
          <div className="mx-auto max-w-7xl">
            <h1 className="text-lg font-semibold" style={{ color: section.color }}>
              {section.name}
            </h1>
            <p className="text-sm text-muted-foreground">{section.description}</p>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-7xl px-4 py-6">{children}</div>
    </div>
  );
}
