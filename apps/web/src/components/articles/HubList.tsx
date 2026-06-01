"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import type { Hub } from "@content-platform/database";
import { trpc } from "@/trpc";
import { hubToRoute } from "@/lib/hub-utils";
import { Button } from "@/components/ui/button";
import { ArticleCard } from "./ArticleCard";

interface HubListProps {
  hub: Hub;
}

export function HubList({ hub }: HubListProps) {
  const { data: session } = useSession();
  const isEditor =
    session?.user?.role === "EDITOR" || session?.user?.role === "ADMIN";

  const { data, isLoading, error } = trpc.article.list.useQuery(
    { hub, limit: 20 },
    { refetchOnWindowFocus: false }
  );

  return (
    <div>
      {isEditor && (
        <div className="flex justify-end mb-2">
          <Link href={`/${hubToRoute(hub)}/new`}>
            <Button size="sm">New article</Button>
          </Link>
        </div>
      )}

      {isLoading && (
        <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i}>
              <div className="rounded-lg border bg-card overflow-hidden animate-pulse">
                <div className="p-4 space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted/60 rounded" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!isLoading && error && (
        <p className="mt-6 text-destructive text-sm">
          Failed to load articles: {error.message}
        </p>
      )}

      {!isLoading && !error && !data?.length && (
        <p className="mt-6 text-muted-foreground text-sm">No articles yet.</p>
      )}

      {!isLoading && !error && !!data?.length && (
        <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((article) => (
            <li key={article.id}>
              <ArticleCard article={article} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
