import { z } from "zod";
import { router, publicProcedure, editorProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { createTechVaultRepository } from "@/repositories/tech-vault.repository";
import { TechVaultCategory } from "@content-platform/database";

const categoryEnum = z.nativeEnum(TechVaultCategory);

export const techVaultRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          category: categoryEnum.optional(),
          published: z.boolean().optional(),
          limit: z.number().min(1).max(100).optional(),
          offset: z.number().min(0).optional(),
        })
        .optional()
    )
    .query(({ ctx, input }) => {
      const repo = createTechVaultRepository(ctx.prisma);
      return repo.list({
        category: input?.category,
        published: input?.published ?? true,
        limit: input?.limit,
        offset: input?.offset,
      });
    }),

  getBySlug: publicProcedure.input(z.object({ slug: z.string().min(1) })).query(async ({ ctx, input }) => {
    const repo = createTechVaultRepository(ctx.prisma);
    const review = await repo.getBySlug(input.slug);
    if (!review) throw new TRPCError({ code: "NOT_FOUND", message: "Review not found" });
    if (!review.published && ctx.role !== "ADMIN" && ctx.role !== "EDITOR") {
      throw new TRPCError({ code: "NOT_FOUND", message: "Review not found" });
    }
    return review;
  }),

  create: editorProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
        summary: z.string().max(500).optional(),
        body: z.string().min(1),
        rating: z.number().min(1).max(5),
        productName: z.string().min(1).max(200),
        category: categoryEnum,
        imageUrl: z.string().url().optional(),
        published: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const repo = createTechVaultRepository(ctx.prisma);
      return repo.create({
        ...input,
        authorId: ctx.userId!,
        published: input.published ?? false,
      });
    }),

  update: editorProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        title: z.string().min(1).max(200).optional(),
        slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/).optional(),
        summary: z.string().max(500).optional(),
        body: z.string().min(1).optional(),
        rating: z.number().min(1).max(5).optional(),
        productName: z.string().min(1).max(200).optional(),
        category: categoryEnum.optional(),
        imageUrl: z.string().url().optional().nullable(),
        published: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const repo = createTechVaultRepository(ctx.prisma);
      return repo.update(id, data);
    }),

  delete: editorProcedure.input(z.object({ id: z.string().cuid() })).mutation(async ({ ctx, input }) => {
    const repo = createTechVaultRepository(ctx.prisma);
    await repo.delete(input.id);
    return { success: true };
  }),
});
