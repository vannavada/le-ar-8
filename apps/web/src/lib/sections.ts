export interface SectionMeta {
  slug: string;
  name: string;
  description: string;
  color: string;
  href: string;
  /** Show the terminal [/8] mark in this hub's section header (technical hubs only). */
  terminalMark?: boolean;
}

export const SECTIONS: SectionMeta[] = [
  {
    slug: "tech-vault",
    name: "TechVault",
    description: "Product reviews — tech, men's lifestyle, automotive, and innovation",
    color: "#6b9fc0", // slate blue
    href: "/tech-vault",
    terminalMark: true,
  },
  {
    slug: "thought-forge",
    name: "ThoughtForge",
    description: "Professional and industry articles",
    color: "#c27a55", // terracotta
    href: "/thought-forge",
  },
  {
    slug: "mindstream",
    name: "MindStream",
    description: "Personal thoughts, from one-liners to full pieces",
    color: "#a87898", // mauve — reserved for Phase 2.5
    href: "/mindstream",
  },
  {
    slug: "finance-hub",
    name: "FinanceHub",
    description: "Finance articles, calculators, and rate tables",
    color: "#5f9e7e", // sage
    href: "/finance-hub",
    terminalMark: true,
  },
  {
    slug: "learn-hub",
    name: "LearnHub",
    description: "Coming soon",
    color: "#b8944a", // ochre
    href: "/learn-hub",
  },
];
