import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";
import { appRouter } from "@/server/_app";
import { createContext } from "@/server/context";

const handler = async (req: NextRequest) => {
  const ctx = await createContext(req);
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ctx,
  });
};

export const GET = handler;
export const POST = handler;
