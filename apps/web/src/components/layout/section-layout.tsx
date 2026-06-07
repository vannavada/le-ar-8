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
          className="border-b px-4 pt-8 pb-6 sm:pt-10 sm:pb-8"
          style={{ borderBottomColor: `${section.color}35` }}
        >
          <div className="mx-auto max-w-7xl">
            <h1
              className="font-serif font-normal tracking-tight leading-none text-4xl sm:text-5xl"
              style={{ color: section.color }}
            >
              {section.name}
            </h1>
            <p className="mt-3 text-base text-muted-foreground leading-relaxed max-w-2xl">
              {section.description}
            </p>
            <div
              className="mt-5 h-[2px] w-10 rounded-full"
              style={{ backgroundColor: section.color }}
            />
          </div>
        </div>
      )}
      <div className="mx-auto max-w-7xl px-4 py-6">{children}</div>
    </div>
  );
}
