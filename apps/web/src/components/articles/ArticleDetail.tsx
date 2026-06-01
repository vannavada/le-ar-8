"use client";

import type { Hub } from "@content-platform/database";
import { trpc } from "@/trpc";
import { ArticleBody } from "./ArticleBody";

interface ArticleDetailProps {
  hub: Hub;
  slug: string;
}

export function ArticleDetail({ hub, slug }: ArticleDetailProps) {
  const { data, isLoading, error } = trpc.article.getBySlug.useQuery(
    { hub, slug },
    { refetchOnWindowFocus: false }
  );

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse space-y-4 pt-4">
        <div className="h-8 w-2/3 bg-muted rounded" />
        <div className="h-4 w-1/3 bg-muted/60 rounded" />
        <div className="space-y-2 mt-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 bg-muted/60 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return <p className="mt-8 text-muted-foreground">Article not found.</p>;
  }

  return (
    <article className="max-w-3xl mx-auto">
      <h1 className="mt-4 text-3xl font-bold font-serif leading-tight">{data.title}</h1>

      {data.productName && data.rating != null && (
        <p className="mt-2 text-sm text-muted-foreground">
          {data.productName} · {"★".repeat(data.rating)}
          {data.productCategory && ` · ${data.productCategory}`}
        </p>
      )}

      <p className="mt-1 text-xs text-muted-foreground">
        {data.author.name ?? "Anonymous"} ·{" "}
        {data.publishedAt ? new Date(data.publishedAt).toLocaleDateString() : "Draft"}
      </p>

      {data.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {data.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      )}

      {data.summary && (
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{data.summary}</p>
      )}

      <div className="mt-8">
        <ArticleBody body={data.body} />
      </div>
    </article>
  );
}
