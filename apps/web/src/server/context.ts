import { type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@content-platform/database";

type Role = "USER" | "EDITOR" | "ADMIN";

export type Context = {
  prisma: typeof prisma;
  userId: string | null;
  role: Role | null;
};

export async function createContext(req: NextRequest): Promise<Context> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const userId = (token?.id as string | undefined) ?? token?.sub ?? null;
  const rawRole = token?.role;
  const role: Role | null =
    rawRole === "USER" || rawRole === "EDITOR" || rawRole === "ADMIN" ? rawRole : null;
  return { prisma, userId, role };
}
