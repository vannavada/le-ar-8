import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Passes for EDITOR or ADMIN — content authoring (create/edit/publish)
const requireEditor = t.middleware(({ ctx, next }) => {
  if (ctx.role !== "EDITOR" && ctx.role !== "ADMIN") {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Editor access required" });
  }
  return next({ ctx });
});

export const editorProcedure = t.procedure.use(requireEditor);

// Passes for ADMIN only — governance (user/role management, settings)
const requireAdmin = t.middleware(({ ctx, next }) => {
  if (ctx.role !== "ADMIN") {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin access required" });
  }
  return next({ ctx: { ...ctx, role: "ADMIN" as const } });
});

export const adminProcedure = t.procedure.use(requireAdmin);
