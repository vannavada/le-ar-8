import { SECTIONS } from "@/lib/sections";

interface SectionLayoutProps {
  slug: string;
  children: React.ReactNode;
}

// Small [/8] terminal mark for technical hub headers.
// Charcoal brackets/8 use currentColor (theme-aware); teal slash is hardcoded brand accent.
function SmallTerminalMark() {
  return (
    <svg
      viewBox="100 55 455 140"
      className="h-5 w-auto select-none opacity-50 flex-shrink-0"
      aria-hidden="true"
    >
      <g
        fontFamily="'Space Mono','Roboto Mono',ui-monospace,monospace"
        fontWeight="700"
        fontSize="150"
        letterSpacing="2"
      >
        <text x="150" y="170" textAnchor="middle" fill="currentColor">[</text>
        <text x="285" y="170" textAnchor="middle" fill="#00D9CC">/</text>
        <text x="400" y="170" textAnchor="middle" fill="currentColor">8</text>
        <text x="510" y="170" textAnchor="middle" fill="currentColor">]</text>
      </g>
    </svg>
  );
}

export function SectionLayout({ slug, children }: SectionLayoutProps) {
  const section = SECTIONS.find((s) => s.slug === slug);

  return (
    <div>
      {section && (
        <div
          className="border-b px-4 py-4"
          style={{ borderBottomColor: `${section.color}55` }}
        >
          <div className="mx-auto max-w-7xl flex items-center gap-3">
            {section.terminalMark && <SmallTerminalMark />}
            <div>
              <h1
                className="font-serif text-xl font-normal leading-tight"
                style={{ color: section.color }}
              >
                {section.name}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {section.description}
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-7xl px-4 py-6">{children}</div>
    </div>
  );
}
