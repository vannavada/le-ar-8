"use client";

import { trpc } from "@/trpc";

export function TechVaultDetail({ slug }: { slug: string }) {
  const { data, isLoading, error } = trpc.techVault.getBySlug.useQuery(
    { slug },
    { refetchOnWindowFocus: false }
  );

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse space-y-4 pt-4">
        <div className="h-64 bg-muted rounded-lg" />
        <div className="h-8 w-2/3 bg-muted rounded" />
        <div className="h-4 w-1/3 bg-muted/60 rounded" />
        <div className="space-y-2 mt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 bg-muted/60 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return <p className="mt-8 text-muted-foreground">Review not found.</p>;
  }

  return (
    <article className="max-w-3xl mx-auto">
      {data.imageUrl && (
        <img
          src={data.imageUrl}
          alt=""
          className="w-full rounded-lg object-cover max-h-80"
        />
      )}
      <h1 className="mt-6 text-3xl font-bold">{data.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {data.productName} · {"★".repeat(data.rating)} · {data.category.replace("_", " ")}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {data.author.name ?? "Anonymous"} ·{" "}
        {data.publishedAt ? new Date(data.publishedAt).toLocaleDateString() : "Draft"}
      </p>
      {data.summary && (
        <p className="mt-4 text-lg text-muted-foreground">{data.summary}</p>
      )}
      <div className="mt-6 prose prose-neutral dark:prose-invert max-w-none">
        <div className="whitespace-pre-wrap">{data.body}</div>
      </div>
    </article>
  );
}
