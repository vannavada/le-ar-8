import { type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@content-platform/database";

export type Context = {
  prisma: typeof prisma;
  userId: string | null;
  role: string | null;
};

export async function createContext(req: NextRequest): Promise<Context> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const userId = (token?.id as string | undefined) ?? token?.sub ?? null;
  const role = (token?.role as string | undefined) ?? null;
  return { prisma, userId, role };
}
