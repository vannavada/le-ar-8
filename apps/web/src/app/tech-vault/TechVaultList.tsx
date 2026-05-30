"use client";

import Link from "next/link";
import { trpc } from "@/trpc";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function TechVaultList() {
  const { data, isLoading, error } = trpc.techVault.list.useQuery(
    { published: true, limit: 20 },
    { refetchOnWindowFocus: false }
  );

  if (isLoading) {
    return (
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card overflow-hidden animate-pulse">
            <div className="h-40 bg-muted" />
            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4 bg-muted rounded" />
              <div className="h-3 w-1/2 bg-muted/60 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) return <p className="mt-6 text-destructive text-sm">Failed to load reviews: {error.message}</p>;
  if (!data?.length) return <p className="mt-6 text-muted-foreground text-sm">No reviews yet.</p>;

  return (
    <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((review) => (
        <li key={review.id}>
          <Link href={`/tech-vault/${review.slug}`} className="group block h-full">
            <Card className="h-full transition-shadow hover:shadow-md overflow-hidden">
              {review.imageUrl && (
                <img
                  src={review.imageUrl}
                  alt=""
                  className="w-full h-40 object-cover"
                />
              )}
              <CardHeader>
                <CardTitle className="text-base group-hover:text-primary transition-colors">
                  {review.title}
                </CardTitle>
                <CardDescription>
                  {review.productName} · {"★".repeat(review.rating)}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
}
