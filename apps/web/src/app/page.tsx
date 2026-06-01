// DB query runs at request time, not at build — avoids build-time connection attempt
// and ensures "cast me adrift" is truly random per request, not frozen at deploy.
export const dynamic = "force-dynamic";

import { prisma } from "@content-platform/database";
import { createArticleRepository } from "@/repositories/article";
import { HUB_ROUTES } from "@/lib/hub-utils";
import { HomepageHero } from "./HomepageHero";

export default async function HomePage() {
  const repo = createArticleRepository(prisma);
  const pick = await repo.randomPublished();

  const randomHref = pick ? `/${HUB_ROUTES[pick.hub]}/${pick.slug}` : null;

  return <HomepageHero randomHref={randomHref} />;
}
