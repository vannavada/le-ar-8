import { z } from "zod";
import { router, publicProcedure, editorProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { createArticleRepository } from "@/repositories/article";
import { Hub } from "@content-platform/database";

const hubEnum = z.nativeEnum(Hub);

const slugSchema = z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "Use only lowercase letters, numbers, and hyphens");

export const articleRouter = router({
  list: publicProcedure
    .input(
      z.object({
        hub: hubEnum,
        tag: z.string().optional(),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      })
    )
    .query(({ ctx, input }) => {
      const repo = createArticleRepository(ctx.prisma);
      const isEditor = ctx.role === "EDITOR" || ctx.role === "ADMIN";
      return repo.list({
        hub: input.hub,
        published: isEditor ? undefined : true,
        tag: input.tag,
        limit: input.limit,
        offset: input.offset,
      });
    }),

  getBySlug: publicProcedure
    .input(z.object({ hub: hubEnum, slug: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const repo = createArticleRepository(ctx.prisma);
      const article = await repo.getBySlug(input.hub, input.slug);
      if (!article) throw new TRPCError({ code: "NOT_FOUND", message: "Article not found" });
      if (!article.published && ctx.role !== "EDITOR" && ctx.role !== "ADMIN") {
        throw new TRPCError({ code: "NOT_FOUND", message: "Article not found" });
      }
      return article;
    }),

  randomPublished: publicProcedure.query(async ({ ctx }) => {
    const repo = createArticleRepository(ctx.prisma);
    return repo.randomPublished();
  }),

  create: editorProcedure
    .input(
      z.object({
        hub: hubEnum,
        title: z.string().min(1).max(200),
        slug: slugSchema,
        summary: z.string().max(500).optional(),
        body: z.string().min(1),
        tags: z.array(z.string()).optional(),
        published: z.boolean().optional(),
        rating: z.number().min(1).max(5).optional(),
        productName: z.string().min(1).max(200).optional(),
        productCategory: z.string().max(100).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const repo = createArticleRepository(ctx.prisma);
      return repo.create({ ...input, authorId: ctx.userId! });
    }),

  update: editorProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        title: z.string().min(1).max(200).optional(),
        slug: slugSchema.optional(),
        summary: z.string().max(500).optional().nullable(),
        body: z.string().min(1).optional(),
        tags: z.array(z.string()).optional(),
        published: z.boolean().optional(),
        rating: z.number().min(1).max(5).optional().nullable(),
        productName: z.string().min(1).max(200).optional().nullable(),
        productCategory: z.string().max(100).optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const repo = createArticleRepository(ctx.prisma);
      return repo.update(id, ctx.userId!, data);
    }),

  delete: editorProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const repo = createArticleRepository(ctx.prisma);
      await repo.delete(input.id, ctx.userId!);
      return { success: true };
    }),
});
