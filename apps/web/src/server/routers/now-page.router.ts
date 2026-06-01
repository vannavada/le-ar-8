import { z } from "zod";
import { router, publicProcedure, editorProcedure } from "../trpc";
import { createNowPageRepository } from "@/repositories/now-page";

export const nowPageRouter = router({
  get: publicProcedure.query(({ ctx }) => {
    return createNowPageRepository(ctx.prisma).get();
  }),

  update: editorProcedure
    .input(z.object({ body: z.string().min(1) }))
    .mutation(({ ctx, input }) => {
      return createNowPageRepository(ctx.prisma).upsert(input.body);
    }),
});
