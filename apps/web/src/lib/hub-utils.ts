import type { Hub } from "@content-platform/database";
import { SECTIONS } from "@/lib/sections";

export const HUB_ROUTES: Record<Hub, string> = {
  TECH_VAULT: "tech-vault",
  THOUGHT_FORGE: "thought-forge",
  FINANCE_HUB: "finance-hub",
  LEARN_HUB: "learn-hub",
};

export function hubToRoute(hub: Hub): string {
  return HUB_ROUTES[hub];
}

export function hubColor(hub: Hub): string {
  const slug = HUB_ROUTES[hub];
  return SECTIONS.find((s) => s.slug === slug)?.color ?? "#00D9CC";
}

export function hubName(hub: Hub): string {
  const slug = HUB_ROUTES[hub];
  return SECTIONS.find((s) => s.slug === slug)?.name ?? hub;
}
