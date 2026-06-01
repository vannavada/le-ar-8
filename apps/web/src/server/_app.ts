import { router } from "./trpc";
import { articleRouter } from "./routers/article.router";
import { nowPageRouter } from "./routers/now-page.router";

export const appRouter = router({
  article: articleRouter,
  nowPage: nowPageRouter,
});

export type AppRouter = typeof appRouter;
