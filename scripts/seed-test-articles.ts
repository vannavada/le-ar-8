/**
 * Test-data seed — Phase 2 Chunk 1 verification.
 * THROWAWAY: delete all rows tagged test:phase2 before launch.
 * Run: npx tsx scripts/seed-test-articles.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env") });

import { PrismaClient } from "@content-platform/database";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  // ── Find admin user ─────────────────────────────────────────────────────
  const author = await prisma.user.findFirst({
    where: { role: { in: ["ADMIN", "EDITOR"] } },
    select: { id: true, email: true, role: true },
  });

  if (!author) {
    console.error("No ADMIN or EDITOR user found. Cannot seed — authorId is required.");
    process.exit(1);
  }
  console.log(`Using author: ${author.email} (${author.role}) — ${author.id}`);

  // ── Delete any previous test articles ───────────────────────────────────
  const deleted = await prisma.article.deleteMany({
    where: { tags: { has: "test:phase2" } },
  });
  if (deleted.count > 0) console.log(`Cleared ${deleted.count} previous test articles.`);

  // ── TECH_VAULT — published review-type article ──────────────────────────
  const tv = await prisma.article.create({
    data: {
      hub: "TECH_VAULT",
      title: "[TEST] Keychron K2 — The Best 75% Keyboard for Most People",
      slug: "test-keychron-k2-review",
      summary: "A compact, wireless mechanical keyboard that gets almost everything right.",
      body: `## The case for 75%

The 75% layout is the **sweet spot** for most desk setups: you keep the function row and arrow keys, lose the bloated numpad, and gain a noticeably smaller footprint.

### What we liked

- **Wireless + wired** dual mode — no dongle required
- Hot-swappable switches so you can retune the feel without buying another board
- Build quality that punches well above the price

### What we didn't

- The default keycaps are thin and the legends fade faster than we'd like
- No per-key RGB in the base model

**Bottom line:** buy this if you want a thoughtful daily driver without paying flagship prices.`,
      tags: ["test:phase2", "keyboards", "tech"],
      published: true,
      publishedAt: new Date(),
      authorId: author.id,
      rating: 4,
      productName: "Keychron K2",
      productCategory: "Keyboards",
    },
  });
  console.log(`✓ TECH_VAULT   published  — /tech-vault/${tv.slug}`);

  // ── THOUGHT_FORGE — published editorial ─────────────────────────────────
  const tf = await prisma.article.create({
    data: {
      hub: "THOUGHT_FORGE",
      title: "[TEST] Why Specialists Are Winning the Job Market Again",
      slug: "test-specialists-winning-job-market",
      summary: "The decade of the generalist is over. Here is why depth beats breadth right now.",
      body: `## The generalist era is closing

The past decade rewarded people who could do a little of everything. **That window is narrowing.** Companies that used to prize versatility are now explicitly hiring for depth — someone who has spent years inside a problem, not someone who has skimmed it.

### Three forces driving this

- **AI handles the breadth layer.** Summarising, context-switching, and first-draft thinking are increasingly automated. The human value-add is now the judgment you build from deep familiarity with a domain.
- **Trust asymmetry.** Specialists command trust faster. A client hires the cardiologist, not the GP, for heart surgery — the same logic now applies to software architecture, finance structuring, and content strategy.
- **Remote work raised the comparison set.** You are no longer competing with generalists in your city. You are competing globally. Depth is the clearest differentiator.

**The move:** double down on the domain where you already have an edge. Breadth can be bought; depth takes years.`,
      tags: ["test:phase2", "careers", "strategy"],
      published: true,
      publishedAt: new Date(),
      authorId: author.id,
    },
  });
  console.log(`✓ THOUGHT_FORGE published  — /thought-forge/${tf.slug}`);

  // ── FINANCE_HUB — published finance article ──────────────────────────────
  const fh = await prisma.article.create({
    data: {
      hub: "FINANCE_HUB",
      title: "[TEST] Wise vs. Remitly: Which One to Use for NRI Transfers",
      slug: "test-wise-vs-remitly-nri-transfers",
      summary: "Two of the best money-transfer services head to head — and when to use each.",
      body: `## The short answer

Use **Wise** when rate transparency matters most. Use **Remitly** when speed to the recipient is the priority.

### What each one does well

- **Wise:** Shows the exact mid-market rate and a fixed fee upfront. No hidden margin baked into the exchange rate. The rate you see is the rate you get.
- **Remitly:** Faster delivery options (sometimes within minutes via Express), a cleaner mobile experience, and promotional rates for first-time transfers.

### Where they fall short

- Wise's Express tier is not always available for India corridors.
- Remitly's "Economy" speed is cheaper but can take 3–5 days — read the small print.

**Our call:** For regular INR transfers above ₹50,000 equivalent, Wise wins on total cost. For urgent, smaller transfers, Remitly's Express is worth the small premium.`,
      tags: ["test:phase2", "nri", "transfers", "money"],
      published: true,
      publishedAt: new Date(),
      authorId: author.id,
    },
  });
  console.log(`✓ FINANCE_HUB  published  — /finance-hub/${fh.slug}`);

  // ── LEARN_HUB — published tutorial ──────────────────────────────────────
  const lh = await prisma.article.create({
    data: {
      hub: "LEARN_HUB",
      title: "[TEST] How to Read a Research Paper (Without a PhD)",
      slug: "test-how-to-read-research-paper",
      summary: "A practical three-pass method for extracting what matters from academic papers.",
      body: `## You do not need to read everything

The most common mistake is starting at the abstract and ploughing through to the references. **Do not do this.** Most of the paper is not relevant to why you picked it up.

### The three-pass method

1. **First pass (5 minutes):** Read the title, abstract, introduction, and conclusion only. Decide if the paper is worth your time.
2. **Second pass (30 minutes):** Read the body, skip the proofs and derivations. Focus on figures, tables, and the discussion section — those contain the actual claims.
3. **Third pass (only if needed):** Go deep — verify the methodology, check the citations, stress-test the assumptions.

### What to write down

- The **central claim** in one sentence
- The **evidence type** (RCT, observational, meta-analysis — they carry different weight)
- **One thing you would challenge** if you were reviewing it

Most practical readers only need pass one and two. Save the third pass for papers that will directly inform a decision.`,
      tags: ["test:phase2", "learning", "research"],
      published: true,
      publishedAt: new Date(),
      authorId: author.id,
    },
  });
  console.log(`✓ LEARN_HUB    published  — /learn-hub/${lh.slug}`);

  // ── TECH_VAULT — UNPUBLISHED draft (visibility test) ────────────────────
  const draft = await prisma.article.create({
    data: {
      hub: "TECH_VAULT",
      title: "[TEST] DRAFT — This Should Not Be Publicly Visible",
      slug: "test-draft-unpublished-visibility-check",
      body: "If you can see this article on the public list or detail page, the unpublished visibility filter is broken.",
      tags: ["test:phase2", "draft-check"],
      published: false,
      authorId: author.id,
    },
  });
  console.log(`✓ TECH_VAULT   UNPUBLISHED — /tech-vault/${draft.slug} (should be invisible to public)`);

  console.log("\nAll test articles created. Tag: test:phase2");
  console.log("Delete before launch: prisma.article.deleteMany({ where: { tags: { has: 'test:phase2' } } })");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
