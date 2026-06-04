import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env") });

import { PrismaClient } from "@content-platform/database";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const articles = await prisma.article.findMany({
    orderBy: [{ hub: "asc" }, { published: "desc" }, { createdAt: "desc" }],
    select: { id: true, hub: true, title: true, slug: true, published: true, tags: true, createdAt: true },
  });

  if (articles.length === 0) {
    console.log("No articles in database.");
  } else {
    console.log(`${articles.length} article(s):\n`);
    for (const a of articles) {
      const testFlag = a.tags.includes("test:phase2") ? " ⚑ test:phase2" : "";
      const pubFlag = a.published ? "published" : "DRAFT";
      console.log(`[${a.hub}] ${pubFlag}${testFlag}`);
      console.log(`  title:   ${a.title}`);
      console.log(`  slug:    ${a.slug}`);
      console.log(`  tags:    [${a.tags.join(", ")}]`);
      console.log(`  created: ${a.createdAt.toISOString().slice(0, 10)}`);
      console.log();
    }
  }

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
