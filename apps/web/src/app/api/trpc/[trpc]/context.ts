import { getToken } from "next-auth/jwt";
import { prisma } from "@content-platform/database";

export type Context = {
  prisma: typeof prisma;
  userId: string | null;
};

export async function createContext(req: Request): Promise<Context> {
  const token = await getToken({
    req: req as unknown as { headers: Headers; url?: string },
    secret: process.env.NEXTAUTH_SECRET,
  });
  const userId = (token?.id as string | undefined) ?? token?.sub ?? null;
  return {
    prisma,
    userId,
  };
}
