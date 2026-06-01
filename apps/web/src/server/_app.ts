import { router } from "./trpc";
import { articleRouter } from "./routers/article.router";
import { nowPageRouter } from "./routers/now-page.router";
import { affiliateRouter } from "./routers/affiliate.router";

export const appRouter = router({
  article: articleRouter,
  nowPage: nowPageRouter,
  affiliate: affiliateRouter,
});

export type AppRouter = typeof appRouter;
