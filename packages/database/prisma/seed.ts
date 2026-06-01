import { config } from "dotenv";
import { resolve } from "path";

// Load root .env when running from monorepo
config({ path: resolve(__dirname, "../../../.env") });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create a demo user if none exist
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    await prisma.user.create({
      data: {
        email: "admin@example.com",
        name: "Admin User",
        role: "ADMIN",
      },
    });
    console.log("Created demo admin user (admin@example.com)");
  }

  // Seed Amazon Associates if no affiliate programs exist
  const programCount = await prisma.affiliateProgram.count();
  if (programCount === 0) {
    await prisma.affiliateProgram.create({
      data: {
        name: "Amazon Associates",
        network: "amazon",
        affiliateId: "lear8-20",
        baseUrl: "https://www.amazon.com",
        commission: "1–10%",
        categories: ["tech", "lifestyle", "books", "home"],
        active: true,
      },
    });
    console.log("Seeded Amazon Associates affiliate program (tag: lear8-20)");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
