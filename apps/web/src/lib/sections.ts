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
    color: "#8b5cf6",
    href: "/tech-vault",
    terminalMark: true,
  },
  {
    slug: "thought-forge",
    name: "ThoughtForge",
    description: "Professional and industry articles",
    color: "#f59e0b",
    href: "/thought-forge",
  },
  {
    slug: "mindstream",
    name: "MindStream",
    description: "Personal thoughts, from one-liners to full pieces",
    color: "#10b981",
    href: "/mindstream",
  },
  {
    slug: "finance-hub",
    name: "FinanceHub",
    description: "Finance articles, calculators, and rate tables",
    color: "#06b6d4",
    href: "/finance-hub",
    terminalMark: true,
  },
  {
    slug: "learn-hub",
    name: "LearnHub",
    description: "Coming soon",
    color: "#f43f5e",
    href: "/learn-hub",
  },
  {
    slug: "community",
    name: "CommunitySpace",
    description: "Coming soon",
    color: "#6366f1",
    href: "/community",
  },
];
