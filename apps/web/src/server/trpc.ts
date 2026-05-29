import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireAdmin = t.middleware(({ ctx, next }) => {
  if (ctx.role !== "ADMIN") {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin access required" });
  }
  return next({ ctx: { ...ctx, role: "ADMIN" as const } });
});

export const adminProcedure = t.procedure.use(requireAdmin);
