import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import superjson from "superjson";
import { appRouter } from "@content-platform/api/router";
import { createContext } from "./context";

type NextContext = { params: Promise<{ trpc: string[] }>; req: Request };

const handler = async (req: Request) => {
  const ctx = await createContext(req);
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ctx,
    transformer: superjson,
  });
};

export const GET = handler;
export const POST = handler;
