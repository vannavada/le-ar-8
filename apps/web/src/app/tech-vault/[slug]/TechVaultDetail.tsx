"use client";

import { trpc } from "@/trpc";

export function TechVaultDetail({ slug }: { slug: string }) {
  const { data, isLoading, error } = trpc.techVault.getBySlug.useQuery(
    { slug },
    { refetchOnWindowFocus: false }
  );

  if (isLoading) return <div className="mt-8 text-gray-500">Loading…</div>;
  if (error || !data) return <div className="mt-8 text-red-600">Review not found.</div>;

  return (
    <article className="max-w-3xl mx-auto mt-8">
      {data.imageUrl && (
        <img
          src={data.imageUrl}
          alt=""
          className="w-full rounded-lg object-cover max-h-80"
        />
      )}
      <h1 className="mt-6 text-3xl font-bold text-gray-900">{data.title}</h1>
      <p className="mt-2 text-gray-500">
        {data.productName} · ★ {data.rating}/5 · {data.category}
      </p>
      <p className="mt-2 text-sm text-gray-500">
        by {data.author.name ?? "Unknown"} ·{" "}
        {data.publishedAt
          ? new Date(data.publishedAt).toLocaleDateString()
          : "Draft"}
      </p>
      {data.summary && (
        <p className="mt-4 text-lg text-gray-600">{data.summary}</p>
      )}
      <div className="mt-6 prose prose-gray max-w-none">
        <div className="whitespace-pre-wrap">{data.body}</div>
      </div>
    </article>
  );
}
