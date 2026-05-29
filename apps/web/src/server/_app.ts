import { router } from "./trpc";
import { techVaultRouter } from "./routers/tech-vault.router";

export const appRouter = router({
  techVault: techVaultRouter,
});

export type AppRouter = typeof appRouter;
