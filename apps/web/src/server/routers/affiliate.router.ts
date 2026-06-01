import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "../trpc";
import { createAffiliateRepository } from "@/repositories/affiliate";

const programCreateSchema = z.object({
  name: z.string().min(1).max(100),
  network: z.string().min(1).max(50),
  affiliateId: z.string().min(1).max(100),
  baseUrl: z.string().url(),
  commission: z.string().max(50).optional(),
  categories: z.array(z.string()).optional(),
  active: z.boolean().optional(),
});

export const affiliateRouter = router({
  // Used by article rendering (readers) and the editor link helper.
  // affiliateId (tracking tag) is non-secret — it's visible in every generated URL.
  listActive: publicProcedure.query(({ ctx }) => {
    return createAffiliateRepository(ctx.prisma).listActive();
  }),

  list: adminProcedure.query(({ ctx }) => {
    return createAffiliateRepository(ctx.prisma).list();
  }),

  create: adminProcedure
    .input(programCreateSchema)
    .mutation(({ ctx, input }) => {
      return createAffiliateRepository(ctx.prisma).create(input);
    }),

  update: adminProcedure
    .input(z.object({ id: z.string().cuid(), data: programCreateSchema.partial() }))
    .mutation(({ ctx, input }) => {
      return createAffiliateRepository(ctx.prisma).update(input.id, input.data);
    }),

  deactivate: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(({ ctx, input }) => {
      return createAffiliateRepository(ctx.prisma).update(input.id, { active: false });
    }),
});
