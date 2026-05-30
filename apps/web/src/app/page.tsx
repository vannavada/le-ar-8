import { prisma } from "@content-platform/database";
import { HomepageHero } from "./HomepageHero";

export default async function HomePage() {
  // Gather all published content for "Cast me adrift".
  // Only TechVault has a content model in Phase 1; other sections join in Phase 2.
  const published = await prisma.techVaultReview.findMany({
    where: { published: true },
    select: { slug: true },
  });

  let randomHref: string | null = null;
  if (published.length > 0) {
    const pick = published[Math.floor(Math.random() * published.length)];
    randomHref = `/tech-vault/${pick.slug}`;
  }

  return <HomepageHero randomHref={randomHref} />;
}
