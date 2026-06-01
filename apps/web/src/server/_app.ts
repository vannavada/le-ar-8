import { router } from "./trpc";
import { articleRouter } from "./routers/article.router";

export const appRouter = router({
  article: articleRouter,
});

export type AppRouter = typeof appRouter;
