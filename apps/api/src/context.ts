import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { prisma } from "@content-platform/database";

export type Context = {
  prisma: typeof prisma;
  userId: string | null;
};

export function createContext({ req }: CreateExpressContextOptions): Context {
  // Session/auth will be resolved via cookie or Authorization header in a later step
  const userId = (req.headers["x-user-id"] as string) ?? null;
  return {
    prisma,
    userId,
  };
}
