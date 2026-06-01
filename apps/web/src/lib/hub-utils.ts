import type { Hub } from "@content-platform/database";

export const HUB_ROUTES: Record<Hub, string> = {
  TECH_VAULT: "tech-vault",
  THOUGHT_FORGE: "thought-forge",
  FINANCE_HUB: "finance-hub",
  LEARN_HUB: "learn-hub",
};

export function hubToRoute(hub: Hub): string {
  return HUB_ROUTES[hub];
}
