import { defineConfig } from "prisma/config";
import { config } from "dotenv";
import { resolve } from "path";

// When Prisma runs this from packages/database/, cwd is packages/database/
// Two levels up is the repo root where .env lives
config({ path: resolve(process.cwd(), "../../.env") });
// Fallback: if cwd is already the repo root (e.g. direct invocation)
config({ path: resolve(process.cwd(), ".env") });

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
